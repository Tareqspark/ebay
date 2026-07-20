import { statusConfig, toneClasses } from "@/lib/admin/status";
import { cn } from "@/lib/utils";

export function StatusBadge({ status, className }: { status: string; className?: string }) {
  const config = statusConfig(status);
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md px-1.5 py-0.5 text-xs font-medium ring-1 ring-inset",
        toneClasses(config.tone),
        className
      )}
    >
      {config.label}
    </span>
  );
}
