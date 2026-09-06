# Putting Cloudflare in front of Cartebay

Written 6 September 2026, against the server as it stands: nginx 1.24 on
`174.138.32.27`, proxying to Next.js on `localhost:3000`, Let's Encrypt via
certbot's nginx plugin, ufw, and three fail2ban jails.

## Why, honestly

Two things are worth having, and one commonly cited reason does not apply.

**Volumetric DDoS absorption.** Nothing on the droplet can help here. ufw drops
packets that have already crossed the network link, and fail2ban reads logs
*after* nginx has served the request, on a ten-minute window. A flood saturates
two cores and the link before either reacts. This is the only real fix.

**Bot defence.** The catalogue is 163,000 products, which is a scraping target.
The existing `nginx-botsearch` jail matches known-bad URL probes and has caught
7 things; a scraper walking ordinary product URLs matches none of them.

**Not: page speed.** The homepage takes **1.5-1.9 s server-side**, and Cloudflare
cannot cache that HTML because carts and sessions are per-visitor. It will
remove the ~0.7 s of connect and TLS for distant visitors, and it will serve
`/_next/static/*` from the edge, but the render cost is untouched. That is
`performance.md`, not this document.

## The one thing that must be done first

`/etc/nginx/conf.d/ratelimit.conf` keys on the client address:

```nginx
limit_req_zone $rl_key zone=cartebay_pages:16m rate=20r/s;   # $binary_remote_addr
```

Behind a proxy, `$remote_addr` becomes **a Cloudflare edge IP**, shared by many
visitors. Three things then break at once:

1. `rate=20r/s` becomes a shared budget per Cloudflare PoP, so real customers
   start getting 429s.
2. **fail2ban's `nginx-limit-req` jail bans the IP producing those 429s** — a
   Cloudflare edge. Every visitor behind that PoP loses the site, and the jail
   keeps going.
3. The Googlebot exemption (`66.249.64.0/19`) never matches again, so Google
   gets rate limited by the rule written to exempt it.

The fix restores the real client address before any of that logic runs.

### Already installed — 6 September

This is done. `/usr/local/sbin/cf-realip-refresh` fetches Cloudflare's ranges
and writes `/etc/nginx/conf.d/cloudflare-realip.conf` (20 ranges, plus
`real_ip_header CF-Connecting-IP`), refusing to install a truncated download.
It runs weekly from `/etc/cron.d/cloudflare-realip`.

It is inert until Cloudflare is switched on: with no proxy in front,
`CF-Connecting-IP` is absent and nginx behaves exactly as before.

`/usr/local/sbin/cf-sync-ignoreip.py` then copies the same ranges into
fail2ban's `ignoreip`, reading them from the nginx config so the two cannot
drift. That is a **safety net, not the defence**: when real-IP is working
fail2ban sees real visitor addresses and those ranges never match, but if it
ever silently breaks, fail2ban ignores Cloudflare rather than banning it.
Failing to ban an attacker is recoverable; banning the CDN is an outage.

Two scripts are staged for the switchover itself:

| Script | When |
| --- | --- |
| `/usr/local/sbin/cf-verify` | immediately after flipping to orange-cloud |
| `/usr/local/sbin/cf-lockdown` | last, once cf-verify passes |

`cf-lockdown` refuses to run unless a `cf-ray` header is present, so it cannot
take the site offline by being run too early. Both were tested on 6 September
against the un-proxied site and behaved correctly.

## Migration

### 1. Add the zone

Cloudflare dashboard, Add a site, `cartebay.com`, **Free** plan. It will scan
the existing DNS and should import:

| Type | Name | Content | Proxy |
| --- | --- | --- | --- |
| A | `cartebay.com` | `174.138.32.27` | grey at first |
| A | `www` | `174.138.32.27` | grey at first |

There is no MX record and no mail on this domain, so nothing else needs
carrying over. If SendGrid sending is ever set up on `cartebay.com`, its
SPF/DKIM records must be **grey-cloud** — proxying breaks mail authentication.

### 2. Set SSL/TLS **before** any traffic flows

SSL/TLS → Overview → **Full (strict)**.

Not Flexible. Flexible terminates TLS at Cloudflare and speaks plain HTTP to
the origin, which with the port-80 redirect in `sites-available/cartebay`
produces an infinite redirect loop — and is insecure besides. The Let's Encrypt
certificate (expires 16 November 2026) satisfies strict.

Also enable **Always Use HTTPS**, so the edge handles the redirect and the
origin's port-80 block becomes a backstop rather than a round trip.

### 3. Change nameservers at the registrar

Cloudflare will name two nameservers. These are changed **at the registrar**,
not in DigitalOcean — DigitalOcean is currently only the DNS host
(`ns1/ns2/ns3.digitalocean.com`), and the delegation lives with whoever the
domain was bought from.

Leave the DigitalOcean DNS records in place until the migration is proven; they
cost nothing and are the fastest rollback.

### 4. Verify on grey-cloud

Once the nameservers propagate, with records still grey (DNS only), the site
should behave exactly as before — Cloudflare is only answering DNS.

```bash
dig +short NS cartebay.com          # expect the Cloudflare pair
curl -sI https://www.cartebay.com/ | head -1
```

### 5. Turn on the proxy, then check the logs immediately

Flip both A records to **orange**. Then, on the server:

```bash
/usr/local/sbin/cf-verify
```

It prints the recent client addresses, flags any that look like a Cloudflare
edge, checks for the `cf-ray` header, confirms the real-IP config is loaded,
and lists what fail2ban has banned.

**These must be real visitor addresses.** If they are Cloudflare ranges
(`104.16.x`, `172.64.x`, `162.158.x`, …), the real-IP config is not working:
go straight back to grey-cloud before fail2ban starts banning edges. Do not
leave it running to "see if it settles".

Cross-check that the traffic is genuinely proxied:

```bash
curl -sI https://www.cartebay.com/ | grep -i '^cf-ray'
```

### 6. Cache and bot rules

**Cache rules** — the default (static extensions only) is already correct for a
site with carts and sessions. Add explicit bypasses so a later settings change
cannot start sharing one customer's page with another:

| Rule | Match | Action |
| --- | --- | --- |
| Bypass admin | URI path starts with `/admin` | Bypass cache |
| Bypass API | URI path starts with `/api` | Bypass cache |

Do **not** enable "Cache Everything" on HTML.

**Bot protection** — Security → Bots → **Bot Fight Mode** on. Then exempt the
payment path, because a blocked webhook is a silently missing order:

| Rule | Match | Action |
| --- | --- | --- |
| Stripe webhooks | URI path starts with `/api/webhooks/` | Skip — all bot and security rules |

`/api/webhooks/` is already excluded from rate limiting in nginx for the same
reason; this keeps the two consistent.

### 7. Lock the origin down

Until this step, anyone who knows `174.138.32.27` bypasses Cloudflare entirely,
and the address is in public DNS history.

```bash
/usr/local/sbin/cf-lockdown
```

It allows OpenSSH, allows 80/443 from Cloudflare's ranges only, and removes the
world-open `Nginx Full` rule. It aborts if `cf-ray` is absent.

Reverse with `ufw allow 'Nginx Full'`.

**Do this last, and only after step 5 passes.** If real IPs are not coming
through, this makes the site unreachable rather than merely misconfigured.

Note the consequence for certificates: renewal continues to work, because the
HTTP-01 challenge arrives *through* Cloudflare. But if the records are ever set
back to grey-cloud while ufw is locked down, Let's Encrypt cannot reach the
origin and renewal fails. Two ways out, either is fine:

- switch certbot to DNS-01 with a Cloudflare API token, or
- replace the origin certificate with a Cloudflare Origin Certificate (free,
  15 years, trusted only by Cloudflare — which is the point once locked down).

Neither is urgent; the current certificate is good until 16 November.

## Rollback

At any stage, in descending order of speed:

1. **Records back to grey-cloud** — traffic goes straight to the origin again,
   seconds. Requires ufw still allowing the world, so keep step 7 for last.
2. **Nameservers back to DigitalOcean** at the registrar — the DO records were
   never deleted. Minutes to hours for propagation.
3. `ufw allow 'Nginx Full'` if the origin was already locked down.

## After it is running

- `nginx-limit-req` and `nginx-botsearch` should start banning **real**
  offenders. If a ban list fills with Cloudflare ranges, the real-IP config
  has regressed — check `/etc/nginx/conf.d/cloudflare-realip.conf` and when
  the refresh cron last ran.
- The rate limit can then be tightened. It currently allows 20 r/s from one
  address while the homepage renders at roughly 1.2 r/s on two cores, so a
  single client inside the allowed limit can still outrun the server by ~16x.
  Splitting HTML and static assets into separate zones is the next step, and
  is independent of Cloudflare.
- Watch for 429s reaching real customers in the first day. If they appear,
  the real-IP config is the first thing to check, not the limit itself.

## What this does not fix

The homepage still costs 1.5-1.9 s of CPU per request, and Cloudflare cannot
cache it. Until the rail queries are cached, the origin's practical ceiling is
a couple of homepage renders per second regardless of what sits in front of it.
That remains the single highest-value piece of work outstanding.
