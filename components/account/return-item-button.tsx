"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { requestReturnAction } from "@/lib/return-actions";
import type { ReturnReason } from "@/lib/returns";

const reasonLabels: Record<ReturnReason, string> = {
  defective: "Item is defective",
  wrong_item: "Received the wrong item",
  not_as_described: "Not as described",
  no_longer_needed: "No longer needed",
  damaged_in_shipping: "Arrived damaged",
  other: "Other",
};

export function ReturnItemButton({ orderItemId, productTitle }: { orderItemId: string; productTitle: string }) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState<ReturnReason>("no_longer_needed");
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit() {
    setError(null);
    startTransition(async () => {
      const result = await requestReturnAction(orderItemId, reason, note);
      if (result.error) {
        setError(result.error);
        return;
      }
      toast.success("Return requested");
      setOpen(false);
      setNote("");
    });
  }

  return (
    <>
      <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
        Return this item
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Return &ldquo;{productTitle}&rdquo;</DialogTitle>
            <DialogDescription>We&apos;ll refund your original payment method once the return is approved.</DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4 py-2">
            <div className="flex flex-col gap-1.5">
              <Label>Reason</Label>
              <Select value={reason} onValueChange={(v) => v && setReason(v as ReturnReason)} items={reasonLabels}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(reasonLabels).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="return-note">Details (optional)</Label>
              <Textarea
                id="return-note"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Anything that would help us process this faster"
                rows={3}
              />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={isPending}>
              {isPending ? "Submitting..." : "Request return"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
