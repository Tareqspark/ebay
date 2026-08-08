"use client";

import { useState, useTransition } from "react";
import { Pencil } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { updateOrderAddressAction, type OrderAddress } from "@/lib/admin/order-actions";

/**
 * Inline correction for a mistyped delivery address, which previously could
 * only be fixed by cancelling and re-placing the order. Editing is offered
 * only before the parcel moves — after that the address on the order is a
 * record of where the goods actually went, not an editable field.
 */
export function OrderAddressEditor({
  orderId,
  address,
  locked,
}: {
  orderId: string;
  address: OrderAddress;
  locked: boolean;
}) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<OrderAddress>(address);
  const [pending, startTransition] = useTransition();

  function save() {
    startTransition(async () => {
      try {
        const result = await updateOrderAddressAction(orderId, draft);
        if (result.error) {
          toast.error(result.error);
          return;
        }
        toast.success("Shipping address updated");
        setEditing(false);
        router.refresh();
      } catch {
        toast.error("Couldn't update the address — please try again.");
      }
    });
  }

  if (!editing) {
    return (
      <div className="flex flex-col gap-0.5">
        <p className="text-foreground">{address.name}</p>
        <p className="text-muted-foreground">
          {address.line1}, {address.city}, {address.state} {address.zip}
        </p>
        {locked ? (
          <p className="mt-1 text-xs text-muted-foreground">Locked — this order has already shipped.</p>
        ) : (
          <button
            type="button"
            onClick={() => {
              setDraft(address);
              setEditing(true);
            }}
            className="mt-1 flex items-center gap-1 self-start text-xs text-muted-foreground hover:text-foreground"
          >
            <Pencil className="h-3 w-3" /> Edit address
          </button>
        )}
      </div>
    );
  }

  const field = (key: keyof OrderAddress, placeholder: string) => (
    <Input
      key={key}
      value={draft[key]}
      onChange={(e) => setDraft({ ...draft, [key]: e.target.value })}
      placeholder={placeholder}
      className="h-8 text-sm"
    />
  );

  return (
    <div className="flex flex-col gap-1.5">
      {field("name", "Recipient")}
      {field("line1", "Street address")}
      <div className="grid grid-cols-2 gap-1.5">
        {field("city", "City")}
        {field("state", "State")}
      </div>
      <div className="grid grid-cols-2 gap-1.5">
        {field("zip", "ZIP")}
        {field("country", "Country")}
      </div>
      <div className="mt-1 flex gap-2">
        <Button size="sm" disabled={pending} onClick={save}>
          {pending ? "Saving..." : "Save"}
        </Button>
        <Button size="sm" variant="outline" onClick={() => setEditing(false)}>
          Cancel
        </Button>
      </div>
    </div>
  );
}
