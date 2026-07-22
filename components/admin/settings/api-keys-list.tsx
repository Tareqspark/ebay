"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Plus, RotateCcw, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { formatDate, formatRelative } from "@/lib/admin/format";
import { createApiKeyAction, regenerateApiKeyAction, revokeApiKeyAction } from "@/lib/admin/api-key-actions";
import type { ApiKey } from "@/lib/admin/api-keys";

export function ApiKeysList({ initialKeys }: { initialKeys: ApiKey[] }) {
  const [keys, setKeys] = useState(initialKeys);
  const [pendingRevoke, setPendingRevoke] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [newKeyName, setNewKeyName] = useState("");
  const [creating, setCreating] = useState(false);

  async function createKey() {
    const trimmed = newKeyName.trim();
    if (!trimmed) return;
    setCreating(true);
    const result = await createApiKeyAction(trimmed);
    setCreating(false);
    if (result.error || !result.id || !result.prefix) {
      toast.error(result.error ?? "Failed to create API key");
      return;
    }
    setKeys((prev) => [
      { id: result.id!, name: trimmed, prefix: result.prefix!, scopes: [], createdAt: new Date().toISOString(), lastUsedAt: null },
      ...prev,
    ]);
    setNewKeyName("");
    setCreateOpen(false);
    toast.success("New API key created");
  }

  async function regenerate(id: string) {
    const result = await regenerateApiKeyAction(id);
    if (result.error || !result.prefix) {
      toast.error(result.error ?? "Failed to regenerate key");
      return;
    }
    setKeys((prev) => prev.map((k) => (k.id === id ? { ...k, prefix: result.prefix!, lastUsedAt: null } : k)));
    toast.success("API key regenerated");
  }

  async function revoke(id: string) {
    const result = await revokeApiKeyAction(id);
    if (result.error) {
      toast.error(result.error);
      setPendingRevoke(null);
      return;
    }
    setKeys((prev) => prev.filter((k) => k.id !== id));
    toast.success("API key revoked");
    setPendingRevoke(null);
  }

  return (
    <div className="rounded-lg border border-border bg-card">
      <div className="flex items-center justify-between border-b border-border px-5 py-4">
        <div>
          <h2 className="text-sm font-semibold text-foreground">API keys</h2>
          <p className="mt-0.5 text-xs text-muted-foreground">Used by integrations to access the Baruashop API</p>
        </div>
        <Button size="sm" className="gap-1.5" onClick={() => setCreateOpen(true)}>
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
                {key.scopes.length ? key.scopes.join(", ") : "No scopes"} · Created {formatDate(key.createdAt)} · Last used{" "}
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
        {keys.length === 0 && <p className="px-5 py-8 text-center text-sm text-muted-foreground">No API keys yet.</p>}
      </div>

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create API key</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-1.5 py-2">
            <Label htmlFor="key-name">Name</Label>
            <Input
              id="key-name"
              value={newKeyName}
              onChange={(e) => setNewKeyName(e.target.value)}
              placeholder="e.g. Analytics export"
              autoFocus
              onKeyDown={(e) => e.key === "Enter" && createKey()}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>
              Cancel
            </Button>
            <Button onClick={createKey} disabled={!newKeyName.trim() || creating}>
              {creating ? "Creating..." : "Create key"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
            <AlertDialogAction onClick={() => pendingRevoke && revoke(pendingRevoke)}>Revoke</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
