/**
 * Rejects `<`/`>` in free-text fields that get rendered back through a
 * Server Component (category/collection/content/campaign/shipping/team
 * names, review title/body, etc.). This isn't about allowing "safe" HTML —
 * none of these fields are meant to contain markup at all — it's closing a
 * real stored-XSS vector: Next.js's RSC hydration payload embeds these
 * values inside inline <script> tags without escaping the literal
 * `</script>` sequence, so a value containing `</script><img src=x
 * onerror=...>` breaks out of the hydration script and runs as live HTML in
 * whoever's browser renders the page. Rejecting the two characters that
 * make that possible (`<` and `>`) closes it at the point untrusted data
 * enters the system, which is more robust than trying to escape it
 * correctly on every output path.
 */
export function checkPlainText(value: string, fieldLabel: string): string | null {
  if (/[<>]/.test(value)) {
    return `${fieldLabel} can't contain < or > characters`;
  }
  return null;
}

/**
 * Prefixes a leading `=`, `+`, `-`, or `@` with a tab character before a value
 * is written into a CSV export. Excel/Sheets treat a cell starting with any of
 * those as a formula, so a product title like `=cmd|'/c calc'!A1` opened by
 * whoever downloads the export runs as a live formula/command instead of
 * showing as text — this neutralizes that at the point the cell is built,
 * without changing the visible value once opened in a spreadsheet app.
 */
export function neutralizeCsvCell(value: string): string {
  return /^[=+\-@]/.test(value) ? `\t${value}` : value;
}
