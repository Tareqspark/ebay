"use client";

import { useActionState, useState } from "react";
import { Plus, Star, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  addAddressAction,
  deleteAddressAction,
  setDefaultAddressAction,
  type AddressActionState,
} from "@/lib/address-actions";

export interface AddressRow {
  id: string;
  name: string;
  line1: string;
  line2: string | null;
  city: string;
  state: string;
  zip: string;
  country: string;
  isDefault: boolean;
}

const initialState: AddressActionState = {};

export function AddressBook({ addresses }: { addresses: AddressRow[] }) {
  const [showForm, setShowForm] = useState(addresses.length === 0);
  const [state, formAction, isPending] = useActionState(addAddressAction, initialState);

  return (
    <div className="flex flex-col gap-4">
      {addresses.map((address) => (
        <div key={address.id} className="flex items-start justify-between gap-3 rounded-lg border border-border bg-card p-4">
          <div className="text-sm">
            <p className="flex items-center gap-1.5 font-medium text-foreground">
              {address.name}
              {address.isDefault && (
                <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-semibold uppercase text-muted-foreground">
                  Default
                </span>
              )}
            </p>
            <p className="mt-0.5 text-muted-foreground">
              {address.line1}
              {address.line2 ? `, ${address.line2}` : ""}, {address.city}, {address.state} {address.zip}
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-1">
            {!address.isDefault && (
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label="Set as default"
                onClick={() => setDefaultAddressAction(address.id)}
              >
                <Star className="h-3.5 w-3.5" />
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label="Delete address"
              onClick={() => deleteAddressAction(address.id)}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      ))}

      {showForm ? (
        <form action={formAction} className="flex flex-col gap-3 rounded-lg border border-border bg-card p-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="addr-name">Full name</Label>
              <Input id="addr-name" name="name" required />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="addr-line1">Address</Label>
              <Input id="addr-line1" name="line1" required />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="addr-city">City</Label>
              <Input id="addr-city" name="city" required />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="addr-state">State</Label>
              <Input id="addr-state" name="state" required />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="addr-zip">ZIP</Label>
              <Input id="addr-zip" name="zip" required />
            </div>
          </div>
          <input type="hidden" name="country" value="US" />
          {state.error && <p className="text-sm text-destructive">{state.error}</p>}
          <div className="flex items-center gap-2">
            <Button type="submit" size="sm" disabled={isPending}>
              {isPending ? "Saving..." : "Save address"}
            </Button>
            {addresses.length > 0 && (
              <Button type="button" variant="ghost" size="sm" onClick={() => setShowForm(false)}>
                Cancel
              </Button>
            )}
          </div>
        </form>
      ) : (
        <Button variant="outline" size="sm" className="w-fit gap-1.5" onClick={() => setShowForm(true)}>
          <Plus className="h-3.5 w-3.5" />
          Add address
        </Button>
      )}
    </div>
  );
}
