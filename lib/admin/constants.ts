// Client-safe admin constants — no "server-only" import, so these can be
// used from both server code (lib/admin/data.ts) and "use client" components
// (e.g. order-detail-panel.tsx) without pulling the DB layer into the
// browser bundle.
export const CJ_BRAND_NAME = "CJdropshipping";
