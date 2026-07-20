"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Plus, RotateCcw, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { formatDate, formatRelative } from "@/lib/admin/format";
import type { ApiKey } from "@/lib/admin/api-keys";

export function ApiKeysList({ initialKeys }: { initialKeys: ApiKey[] }) {
  const [keys, setKeys] = useState(initialKeys);
  const [pendingRevoke, setPendingRevoke] = useState<string | null>(null);

  function regenerate(id: string) {
    setKeys((prev) => prev.map((k) => (k.id === id ? { ...k, prefix: `bsk_live_${Math.random().toString(16).slice(2, 6)}` } : k)));
    toast.success("API key regenerated");
  }

  return (
    <div className="rounded-lg border border-border bg-card">
      <div className="flex items-center justify-between border-b border-border px-5 py-4">
        <div>
          <h2 className="text-sm font-semibold text-foreground">API keys</h2>
          <p className="mt-0.5 text-xs text-muted-foreground">Used by integrations to access the Baruashop API</p>
        </div>
        <Button size="sm" className="gap-1.5" onClick={() => toast.success("New API key created")}>
          <Plus className="h-3.5 w-3.5" />
          New key
        </Button>
      </div>
      <div className="flex flex-col divide-y divide-border/60">
        {keys.map((key) => (
          <div key={key.id} className="flex items-center justify-between gap-3 px-5 py-3 text-sm">
            <div className="min-w-0">
              <p className="font-medium text-foreground">{key.name}</p>
              <p className="mt-0.5 font-mono text-xs text-muted-foreground">{key.prefix}••••••••••••</p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {key.scopes.join(", ")} · Created {formatDate(key.createdAt)} · Last used{" "}
                {key.lastUsedAt ? formatRelative(key.lastUsedAt) : "never"}
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-1.5">
              <Button variant="outline" size="icon-sm" aria-label="Regenerate" onClick={() => regenerate(key.id)}>
                <RotateCcw className="h-3.5 w-3.5" />
              </Button>
              <Button variant="outline" size="icon-sm" aria-label="Revoke" onClick={() => setPendingRevoke(key.id)}>
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      <AlertDialog open={pendingRevoke !== null} onOpenChange={(open) => !open && setPendingRevoke(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Revoke this API key?</AlertDialogTitle>
            <AlertDialogDescription>
              Any integration using this key will immediately lose access. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                setKeys((prev) => prev.filter((k) => k.id !== pendingRevoke));
                toast.success("API key revoked");
                setPendingRevoke(null);
              }}
            >
              Revoke
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
