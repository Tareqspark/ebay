export type StatusTone = "success" | "warning" | "danger" | "info" | "neutral";

const TONE_CLASSES: Record<StatusTone, string> = {
  success: "bg-emerald-50 text-emerald-700 ring-emerald-600/20 dark:bg-emerald-500/10 dark:text-emerald-400 dark:ring-emerald-500/20",
  warning: "bg-amber-50 text-amber-700 ring-amber-600/20 dark:bg-amber-500/10 dark:text-amber-400 dark:ring-amber-500/20",
  danger: "bg-red-50 text-red-700 ring-red-600/20 dark:bg-red-500/10 dark:text-red-400 dark:ring-red-500/20",
  info: "bg-sky-50 text-sky-700 ring-sky-600/20 dark:bg-sky-500/10 dark:text-sky-400 dark:ring-sky-500/20",
  neutral: "bg-muted text-muted-foreground ring-border",
};

export function toneClasses(tone: StatusTone): string {
  return TONE_CLASSES[tone];
}

interface StatusConfig {
  label: string;
  tone: StatusTone;
}

const STATUS_MAP: Record<string, StatusConfig> = {
  // payment status (orders)
  paid: { label: "Paid", tone: "success" },
  pending: { label: "Pending", tone: "warning" },
  refunded: { label: "Refunded", tone: "neutral" },
  partially_refunded: { label: "Partial refund", tone: "warning" },
  failed: { label: "Failed", tone: "danger" },
  // fulfillment
  unfulfilled: { label: "Unfulfilled", tone: "warning" },
  processing: { label: "Processing", tone: "info" },
  shipped: { label: "Shipped", tone: "info" },
  delivered: { label: "Delivered", tone: "success" },
  cancelled: { label: "Cancelled", tone: "neutral" },
  // transactions
  succeeded: { label: "Succeeded", tone: "success" },
  // product
  active: { label: "Active", tone: "success" },
  draft: { label: "Draft", tone: "neutral" },
  archived: { label: "Archived", tone: "neutral" },
  visible: { label: "Visible", tone: "success" },
  hidden: { label: "Hidden", tone: "neutral" },
  // reviews
  approved: { label: "Approved", tone: "success" },
  rejected: { label: "Rejected", tone: "danger" },
  // inventory
  in_stock: { label: "In stock", tone: "success" },
  low_stock: { label: "Low stock", tone: "warning" },
  out_of_stock: { label: "Out of stock", tone: "danger" },
  backorder: { label: "Backorder", tone: "info" },
  // customers
  vip: { label: "VIP", tone: "info" },
  "at-risk": { label: "At risk", tone: "warning" },
  blocked: { label: "Blocked", tone: "danger" },
  // suppliers / sync
  paused: { label: "Paused", tone: "warning" },
  disconnected: { label: "Disconnected", tone: "danger" },
  connected: { label: "Connected", tone: "success" },
  // team
  invited: { label: "Invited", tone: "info" },
  disabled: { label: "Disabled", tone: "danger" },
  // CJ sourcing requests
  submitted: { label: "Submitted", tone: "neutral" },
  sourcing: { label: "Sourcing", tone: "info" },
  found: { label: "Found", tone: "success" },
  not_found: { label: "Not found", tone: "danger" },
  // import jobs
  queued: { label: "Queued", tone: "neutral" },
  running: { label: "Running", tone: "info" },
  completed: { label: "Completed", tone: "success" },
  // disputes
  needs_response: { label: "Needs response", tone: "danger" },
  under_review: { label: "Under review", tone: "warning" },
  won: { label: "Won", tone: "success" },
  lost: { label: "Lost", tone: "neutral" },
  // payouts
  in_transit: { label: "In transit", tone: "info" },
  scheduled: { label: "Scheduled", tone: "neutral" },
  // CJ order sync ("queued"/"processing"/"shipped" reuse the fulfillment tones above)
  not_sent: { label: "Not sent", tone: "neutral" },
  // CJ disputes ("rejected" reuses the reviews mapping above)
  open: { label: "Open", tone: "danger" },
  awaiting_cj: { label: "Awaiting CJ", tone: "warning" },
  resolved_reship: { label: "Resolved — reshipped", tone: "success" },
  resolved_refund: { label: "Resolved — refunded", tone: "success" },
  // system
  operational: { label: "Operational", tone: "success" },
  degraded: { label: "Degraded", tone: "warning" },
  outage: { label: "Outage", tone: "danger" },
  // logs
  info: { label: "Info", tone: "neutral" },
  warn: { label: "Warning", tone: "warning" },
  error: { label: "Error", tone: "danger" },
};

export function statusConfig(status: string): StatusConfig {
  return STATUS_MAP[status] ?? { label: status, tone: "neutral" };
}
