"use client";

import { useState } from "react";
import { toast } from "sonner";
import { SlideOver } from "@/components/admin/shared/slide-over";
import { StatusBadge } from "@/components/admin/shared/status-badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { formatDate, formatMoney } from "@/lib/admin/format";
import { getOrdersForCustomer } from "@/lib/admin/data";
import type { Customer, CustomerNote } from "@/lib/admin/types";

interface CustomerDetailPanelProps {
  open: boolean;
  customer: Customer | null;
  onOpenChange: (open: boolean) => void;
  onAddNote: (customerId: string, note: CustomerNote) => void;
}

export function CustomerDetailPanel({ open, customer, onOpenChange, onAddNote }: CustomerDetailPanelProps) {
  const [draft, setDraft] = useState("");

  if (!customer) {
    return (
      <SlideOver open={open} onOpenChange={onOpenChange} title="Customer">
        {null}
      </SlideOver>
    );
  }

  const orders = getOrdersForCustomer(customer.id);

  function submitNote() {
    if (!customer || !draft.trim()) return;
    onAddNote(customer.id, {
      id: `note-${Date.now()}`,
      author: "Priya Patel",
      text: draft.trim(),
      createdAt: new Date().toISOString(),
    });
    setDraft("");
    toast.success("Note added");
  }

  return (
    <SlideOver
      open={open}
      onOpenChange={onOpenChange}
      wide
      title={
        <div className="flex items-center gap-2">
          <span>{customer.name}</span>
          <StatusBadge status={customer.status} />
        </div>
      }
    >
      <div className="flex flex-col gap-5">
        <div className="grid grid-cols-3 gap-3">
          <Stat label="Lifetime value" value={formatMoney(customer.lifetimeValue)} />
          <Stat label="Avg order value" value={formatMoney(customer.averageOrderValue)} />
          <Stat label="Orders" value={String(customer.ordersCount)} />
        </div>

        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <p className="text-xs text-muted-foreground">Email</p>
            <p className="text-foreground">{customer.email}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Location</p>
            <p className="text-foreground">{customer.city}, {customer.state}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Customer since</p>
            <p className="text-foreground">{formatDate(customer.createdAt)}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Tags</p>
            <p className="text-foreground">{customer.tags.length ? customer.tags.join(", ") : "—"}</p>
          </div>
        </div>

        <section>
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Order history ({orders.length})
          </h3>
          <div className="flex flex-col divide-y divide-border rounded-lg border border-border">
            {orders.length === 0 && <p className="p-3 text-sm text-muted-foreground">No orders yet.</p>}
            {orders.slice(0, 8).map((order) => (
              <div key={order.id} className="flex items-center justify-between px-3 py-2 text-sm">
                <div>
                  <p className="font-medium text-foreground">{order.id}</p>
                  <p className="text-xs text-muted-foreground">{formatDate(order.placedAt)}</p>
                </div>
                <div className="flex items-center gap-2">
                  <StatusBadge status={order.paymentStatus} />
                  <span className="tabular-nums text-foreground">{formatMoney(order.total)}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Notes</h3>
          <div className="flex flex-col gap-2">
            {customer.notes.map((note) => (
              <div key={note.id} className="rounded-lg border border-border bg-muted/20 p-3 text-sm">
                <p className="text-foreground">{note.text}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {note.author} · {formatDate(note.createdAt)}
                </p>
              </div>
            ))}
            <div className="flex flex-col gap-2">
              <Textarea
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder="Add an internal note about this customer..."
                rows={3}
              />
              <Button size="sm" className="self-end" onClick={submitNote} disabled={!draft.trim()}>
                Add note
              </Button>
            </div>
          </div>
        </section>
      </div>
    </SlideOver>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1 rounded-lg border border-border bg-muted/20 px-3 py-2">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="text-sm font-medium text-foreground">{value}</span>
    </div>
  );
}
