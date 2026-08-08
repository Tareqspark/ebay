"use client";

import { useEffect, useState, useTransition } from "react";
import { CircleDollarSign, Mail, MessageSquare, Package, RefreshCw, Send } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { formatDateTime } from "@/lib/admin/format";
import { addOrderNoteAction } from "@/lib/admin/order-actions";
import type { OrderEvent, OrderEventType } from "@/lib/admin/order-events";

const ICONS: Record<OrderEventType, typeof Package> = {
  status: RefreshCw,
  note: MessageSquare,
  email: Mail,
  payment: CircleDollarSign,
  fulfillment: Package,
};

/**
 * An order's history and its note composer, in one place: a note is just
 * another event, so writing one and reading what happened belong together
 * rather than in separate tabs.
 *
 * Events are fetched on open rather than passed down with the order row —
 * the orders table holds every order in memory, and attaching each one's
 * full history would multiply that payload for data only ever read one
 * order at a time.
 */
export function OrderTimeline({ orderId }: { orderId: string }) {
  const [events, setEvents] = useState<OrderEvent[] | null>(null);
  const [note, setNote] = useState("");
  const [pending, startTransition] = useTransition();

  async function load() {
    try {
      const res = await fetch(`/api/admin/orders/${orderId}/events`);
      const data = await res.json();
      setEvents(data.events ?? []);
    } catch {
      setEvents([]);
    }
  }

  useEffect(() => {
    setEvents(null);
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId]);

  function submitNote() {
    const text = note.trim();
    if (!text) return;
    startTransition(async () => {
      const result = await addOrderNoteAction(orderId, text);
      if (result.error) {
        toast.error(result.error);
        return;
      }
      setNote("");
      await load();
    });
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex gap-2">
        <Textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Add a note — what was agreed, who called, why something changed."
          rows={2}
          className="flex-1"
        />
        <Button size="sm" variant="outline" disabled={!note.trim() || pending} onClick={submitNote}>
          <Send className="h-3.5 w-3.5" />
        </Button>
      </div>

      {events === null ? (
        <p className="text-xs text-muted-foreground">Loading history…</p>
      ) : events.length === 0 ? (
        <p className="text-xs text-muted-foreground">
          Nothing recorded yet. Actions taken on this order from now on will appear here.
        </p>
      ) : (
        <ol className="flex flex-col">
          {events.map((event, i) => {
            const Icon = ICONS[event.type];
            return (
              <li key={event.id} className="flex gap-3">
                <div className="flex flex-col items-center">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-border bg-card text-muted-foreground">
                    <Icon className="h-3 w-3" />
                  </span>
                  {/* Connector, omitted on the last row so the line stops at the final event. */}
                  {i < events.length - 1 && <span className="w-px flex-1 bg-border" />}
                </div>
                <div className="pb-4">
                  <p className="text-sm text-foreground">{event.message}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatDateTime(event.createdAt)} · {event.actor}
                  </p>
                </div>
              </li>
            );
          })}
        </ol>
      )}
    </div>
  );
}
