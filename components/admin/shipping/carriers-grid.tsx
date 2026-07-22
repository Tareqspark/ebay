"use client";

import { useState } from "react";
import { toast } from "sonner";
import { CarrierCard } from "@/components/admin/shipping/carrier-card";
import { CarrierFormDialog } from "@/components/admin/shipping/carrier-form-dialog";
import { updateCarrierAction } from "@/lib/admin/shipping-actions";
import type { Carrier } from "@/lib/admin/shipping";

export function CarriersGrid({ carriers: initial }: { carriers: Carrier[] }) {
  const [carriers, setCarriers] = useState(initial);
  const [editing, setEditing] = useState<Carrier | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(input: { connected: boolean; servicesUsed: string[] }) {
    if (!editing) return;
    setSubmitting(true);
    const result = await updateCarrierAction(editing.id, input);
    setSubmitting(false);
    if (result.error) {
      toast.error(result.error);
      return;
    }
    setCarriers((prev) => prev.map((c) => (c.id === editing.id ? { ...c, ...input } : c)));
    toast.success(`${editing.name} updated`);
    setEditing(null);
  }

  return (
    <>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {carriers.map((c) => (
          <CarrierCard key={c.id} carrier={c} onClick={() => setEditing(c)} />
        ))}
      </div>
      <CarrierFormDialog
        open={editing !== null}
        onOpenChange={(open) => !open && setEditing(null)}
        carrier={editing}
        onSubmit={handleSubmit}
        submitting={submitting}
      />
    </>
  );
}
