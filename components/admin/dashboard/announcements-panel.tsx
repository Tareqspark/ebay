import { CheckCircle2, Info, TriangleAlert } from "lucide-react";
import { Panel } from "@/components/admin/shared/panel";
import { getAnnouncements } from "@/lib/admin/data";
import { formatRelative } from "@/lib/admin/format";
import type { AnnouncementLevel } from "@/lib/admin/types";
import { cn } from "@/lib/utils";

const ICON: Record<AnnouncementLevel, typeof Info> = {
  info: Info,
  success: CheckCircle2,
  warning: TriangleAlert,
};
const ICON_CLASS: Record<AnnouncementLevel, string> = {
  info: "text-sky-600 dark:text-sky-400",
  success: "text-emerald-600 dark:text-emerald-400",
  warning: "text-amber-600 dark:text-amber-400",
};

export async function AnnouncementsPanel() {
  const announcements = await getAnnouncements();
  return (
    <Panel title="Announcements">
      <ul className="flex flex-col gap-3 px-4 py-3">
        {announcements.slice(0, 4).map((a) => {
          const Icon = ICON[a.level];
          return (
            <li key={a.id} className="flex gap-3">
              <Icon className={cn("mt-0.5 h-4 w-4 shrink-0", ICON_CLASS[a.level])} />
              <div className="min-w-0">
                <p className="text-sm font-medium text-foreground">{a.title}</p>
                <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">{a.body}</p>
                <p className="mt-1 text-[11px] text-muted-foreground/70">{formatRelative(a.createdAt)}</p>
              </div>
            </li>
          );
        })}
      </ul>
    </Panel>
  );
}
