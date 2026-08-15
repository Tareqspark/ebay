/**
 * Verifies the Gmail REST API transport end to end.
 *
 * Run after setting the OAuth variables, before trusting order confirmations
 * to them. Checks the three failure points separately so a problem names
 * itself instead of surfacing later as a silent missing receipt:
 *
 *   1. the variables are present
 *   2. the refresh token still exchanges for an access token
 *   3. Gmail actually accepts a message
 *
 *   node --env-file=.env.local ./node_modules/.bin/tsx scripts/check-gmail-api.ts
 *   node --env-file=.env.local ./node_modules/.bin/tsx scripts/check-gmail-api.ts you@example.com
 *
 * With no argument it stops after step 2 and sends nothing.
 */
const TOKEN_URL = "https://oauth2.googleapis.com/token";
const SEND_URL = "https://gmail.googleapis.com/gmail/v1/users/me/messages/send";

const required = [
  "GOOGLE_OAUTH_CLIENT_ID",
  "GOOGLE_OAUTH_CLIENT_SECRET",
  "GOOGLE_OAUTH_REFRESH_TOKEN",
  "GMAIL_USER",
] as const;

async function main() {
  console.log("1. Environment");
  let missing = false;
  for (const key of required) {
    const value = process.env[key];
    // Lengths only — never the values, so this is safe to paste into a chat
    // or a ticket when something isn't working.
    console.log(`   ${value ? "ok  " : "MISS"} ${key}${value ? ` (${value.length} chars)` : ""}`);
    if (!value) missing = true;
  }
  if (missing) {
    console.error("\nSet the missing variables in .env.local and re-run.");
    process.exit(1);
  }

  console.log("\n2. Refresh token -> access token");
  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: process.env.GOOGLE_OAUTH_CLIENT_ID!,
      client_secret: process.env.GOOGLE_OAUTH_CLIENT_SECRET!,
      refresh_token: process.env.GOOGLE_OAUTH_REFRESH_TOKEN!,
      grant_type: "refresh_token",
    }),
  });
  const token = await res.json().catch(() => ({}));
  if (!res.ok || !token.access_token) {
    console.error(`   FAILED: ${token.error ?? res.status} — ${token.error_description ?? ""}`);
    if (token.error === "invalid_grant") {
      console.error(
        "\n   invalid_grant almost always means one of:\n" +
          "     · the OAuth consent screen is still in Testing — Google expires those refresh tokens after 7 days\n" +
          "     · the token was revoked, or the Google account password changed\n" +
          "     · the token was minted against a different client id/secret than the ones above"
      );
    }
    process.exit(1);
  }
  console.log(`   ok   access token acquired, expires in ${token.expires_in}s`);
  console.log(`   scope: ${token.scope ?? "(not reported)"}`);
  if (token.scope && !String(token.scope).includes("gmail.send") && !String(token.scope).includes("mail.google.com")) {
    console.error("   WARNING: this token lacks a Gmail send scope — sending will be refused.");
  }

  const to = process.argv[2];
  if (!to) {
    console.log("\n3. Send test — skipped (pass a recipient address to actually send)");
    console.log("\nCredentials are valid.");
    return;
  }

  console.log(`\n3. Sending a test message to ${to}`);
  const mime = [
    `From: "Cartebay" <${process.env.GMAIL_USER}>`,
    `To: ${to}`,
    "Subject: Cartebay — Gmail API test",
    "MIME-Version: 1.0",
    'Content-Type: text/html; charset="UTF-8"',
    "",
    "<p>If you are reading this, order confirmations will send.</p>",
  ].join("\r\n");

  const sendRes = await fetch(SEND_URL, {
    method: "POST",
    headers: { Authorization: `Bearer ${token.access_token}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      raw: Buffer.from(mime, "utf8").toString("base64").replace(/\+/g, "-").replace(/\//g, "_"),
    }),
  });
  const sent = await sendRes.json().catch(() => ({}));
  if (!sendRes.ok) {
    console.error(`   FAILED: ${sent?.error?.message ?? sendRes.status}`);
    process.exit(1);
  }
  console.log(`   ok   Gmail accepted it (message id ${sent.id})`);
  console.log("\nAll three checks passed.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
