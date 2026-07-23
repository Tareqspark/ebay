import { ShieldAlert } from "lucide-react";

export function AdminAccessDenied() {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-border py-24 text-center">
      <ShieldAlert className="h-8 w-8 text-muted-foreground" />
      <h1 className="text-lg font-semibold text-foreground">You don&apos;t have access to this section</h1>
      <p className="max-w-md text-sm text-muted-foreground">
        Ask an Owner to grant you access from Settings → Users &amp; Permissions if you need it.
      </p>
    </div>
  );
}
