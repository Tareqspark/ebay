import "server-only";

/**
 * Sends through the Gmail REST API over HTTPS, not SMTP.
 *
 * The host blocks outbound SMTP on every port Gmail offers — 25, 465, 587 and
 * 2525 all time out from this droplet, while 443 is open. Nodemailer's OAuth2
 * support does not help: it still opens an SMTP connection and merely swaps
 * the password for an XOAUTH2 token, so it fails in exactly the same place.
 * Talking to gmail.googleapis.com over 443 is the only way to keep sending
 * from a Gmail account on this host.
 *
 * Hand-rolled against fetch rather than pulling in `googleapis`, which is a
 * very large dependency for two HTTP calls: exchange a refresh token for an
 * access token, then POST one message.
 *
 * Needs GOOGLE_OAUTH_CLIENT_ID, GOOGLE_OAUTH_CLIENT_SECRET,
 * GOOGLE_OAUTH_REFRESH_TOKEN and GMAIL_USER. The refresh token is minted once
 * against the gmail.send scope — send-only, so a leak cannot read the mailbox.
 */

const TOKEN_URL = "https://oauth2.googleapis.com/token";
const SEND_URL = "https://gmail.googleapis.com/gmail/v1/users/me/messages/send";

export function isGmailApiConfigured(): boolean {
  return Boolean(
    process.env.GOOGLE_OAUTH_CLIENT_ID &&
      process.env.GOOGLE_OAUTH_CLIENT_SECRET &&
      process.env.GOOGLE_OAUTH_REFRESH_TOKEN &&
      process.env.GMAIL_USER
  );
}

// Access tokens last an hour. Cached in module scope with a safety margin so
// a burst of orders doesn't mint one per email.
let cached: { token: string; expiresAt: number } | null = null;

async function getAccessToken(): Promise<string> {
  if (cached && cached.expiresAt > Date.now()) return cached.token;

  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: process.env.GOOGLE_OAUTH_CLIENT_ID!,
      client_secret: process.env.GOOGLE_OAUTH_CLIENT_SECRET!,
      refresh_token: process.env.GOOGLE_OAUTH_REFRESH_TOKEN!,
      grant_type: "refresh_token",
    }),
    signal: AbortSignal.timeout(15_000),
  });

  const body = await res.json().catch(() => ({}));
  if (!res.ok || !body.access_token) {
    // invalid_grant is the one worth naming: it means the refresh token was
    // revoked, the Google account password changed, or — the common trap —
    // the OAuth app is still in "Testing" and Google expired the token after
    // seven days.
    const detail = body.error === "invalid_grant"
      ? "refresh token rejected (revoked, or the OAuth app is still in Testing mode, which expires tokens after 7 days)"
      : body.error_description || body.error || `HTTP ${res.status}`;
    throw new Error(`Gmail OAuth token refresh failed: ${detail}`);
  }

  cached = {
    token: body.access_token,
    expiresAt: Date.now() + Math.max(0, (Number(body.expires_in) || 3600) - 120) * 1000,
  };
  return cached.token;
}

/** RFC 2047 encodes a header value, so non-ASCII subjects don't arrive mangled. */
function encodeHeader(value: string): string {
  if (/^[\u0000-\u007F]*$/.test(value)) return value;
  return `=?UTF-8?B?${Buffer.from(value, "utf8").toString("base64")}?=`;
}

function buildMimeMessage({ from, to, subject, html }: { from: string; to: string; subject: string; html: string }): string {
  const headers = [
    `From: ${from}`,
    `To: ${to}`,
    `Subject: ${encodeHeader(subject)}`,
    "MIME-Version: 1.0",
    'Content-Type: text/html; charset="UTF-8"',
    "Content-Transfer-Encoding: base64",
  ].join("\r\n");

  // The body is base64'd rather than sent raw: an HTML email routinely
  // contains lines past SMTP's 998-character limit, and encoding sidesteps
  // both that and any bare-CR/LF ambiguity.
  const body = Buffer.from(html, "utf8").toString("base64").replace(/(.{76})/g, "$1\r\n");
  return `${headers}\r\n\r\n${body}`;
}

export async function sendViaGmailApi({
  to,
  subject,
  html,
  fromName = "Cartebay",
}: {
  to: string;
  subject: string;
  html: string;
  fromName?: string;
}): Promise<void> {
  const token = await getAccessToken();
  const mime = buildMimeMessage({
    from: `"${fromName}" <${process.env.GMAIL_USER}>`,
    to,
    subject,
    html,
  });

  // Gmail wants base64url, and it must be unpadded-safe: the standard
  // alphabet's + and / are not valid here.
  const raw = Buffer.from(mime, "utf8").toString("base64").replace(/\+/g, "-").replace(/\//g, "_");

  const res = await fetch(SEND_URL, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({ raw }),
    signal: AbortSignal.timeout(20_000),
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    const detail = body?.error?.message || `HTTP ${res.status}`;
    // A 401 here means the cached token went stale mid-flight; drop it so the
    // next send re-mints rather than repeating the failure.
    if (res.status === 401) cached = null;
    throw new Error(`Gmail API send failed: ${detail}`);
  }
}
