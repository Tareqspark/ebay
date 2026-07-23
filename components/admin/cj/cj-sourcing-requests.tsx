"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Plus } from "lucide-react";
import { StatusBadge } from "@/components/admin/shared/status-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { formatDate } from "@/lib/admin/format";
import { submitSourcingRequestAction } from "@/lib/admin/cj-sourcing-actions";
import type { CjSourcingRequest } from "@/lib/admin/cj-types";

export function CjSourcingRequests({ initialRequests }: { initialRequests: CjSourcingRequest[] }) {
  const [requests, setRequests] = useState(initialRequests);
  const [productName, setProductName] = useState("");
  const [referenceUrl, setReferenceUrl] = useState("");
  const [notes, setNotes] = useState("");
  const [isPending, startTransition] = useTransition();

  function submit() {
    if (!productName.trim()) {
      toast.error("Product name is required");
      return;
    }
    startTransition(async () => {
      const result = await submitSourcingRequestAction(productName, referenceUrl, notes);
      if (result.error) {
        toast.error(result.error);
        return;
      }
      const request: CjSourcingRequest = {
        id: crypto.randomUUID(),
        productName: productName.trim(),
        referenceUrl: referenceUrl.trim() || undefined,
        notes: notes.trim(),
        status: "submitted",
        submittedAt: new Date().toISOString(),
      };
      setRequests((prev) => [request, ...prev]);
      setProductName("");
      setReferenceUrl("");
      setNotes("");
      toast.success("Sourcing request submitted to CJdropshipping");
    });
  }

  return (
    <section className="rounded-lg border border-border bg-card">
      <div className="border-b border-border px-5 py-4">
        <h2 className="text-sm font-semibold text-foreground">Sourcing requests</h2>
        <p className="mt-0.5 text-xs text-muted-foreground">
          Ask CJ to source a product that isn&apos;t in their catalog yet
        </p>
      </div>

      <div className="flex flex-col gap-3 border-b border-border px-5 py-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1.5">
            <Label>Product name</Label>
            <Input value={productName} onChange={(e) => setProductName(e.target.value)} placeholder="e.g. Collapsible travel bottles" />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>Reference URL (optional)</Label>
            <Input value={referenceUrl} onChange={(e) => setReferenceUrl(e.target.value)} placeholder="https://..." />
          </div>
        </div>
        <div className="flex flex-col gap-1.5">
          <Label>Notes</Label>
          <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Specs, quantity, target cost, shipping requirements..." />
        </div>
        <div>
          <Button size="sm" className="gap-1.5" onClick={submit} disabled={isPending}>
            <Plus className="h-3.5 w-3.5" />
            {isPending ? "Submitting..." : "Submit request"}
          </Button>
        </div>
      </div>

      <div className="flex flex-col divide-y divide-border">
        {requests.length === 0 && <p className="px-5 py-6 text-center text-sm text-muted-foreground">No sourcing requests yet.</p>}
        {requests.map((r) => (
          <div key={r.id} className="flex items-start justify-between gap-3 px-5 py-3">
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-foreground">{r.productName}</p>
              {r.notes && <p className="mt-0.5 truncate text-xs text-muted-foreground">{r.notes}</p>}
              <p className="mt-0.5 text-xs text-muted-foreground">Submitted {formatDate(r.submittedAt)}</p>
            </div>
            <StatusBadge status={r.status} className="shrink-0" />
          </div>
        ))}
      </div>
    </section>
  );
}
