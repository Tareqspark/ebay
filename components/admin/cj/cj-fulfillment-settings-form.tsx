"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { updateCjFulfillmentSettingsAction } from "@/lib/admin/cj-settings-actions";
import type { CjShippingLine } from "@/lib/admin/cj-types";

const syncFrequencyItems = { "15min": "Every 15 minutes", hourly: "Hourly", "6h": "Every 6 hours", daily: "Daily" };

interface CjFulfillmentSettingsFormProps {
  autoPushOrders: boolean;
  defaultShippingLineId: string;
  syncFrequency: string;
  shippingLines: CjShippingLine[];
}

export function CjFulfillmentSettingsForm({
  autoPushOrders: initialAutoPush,
  defaultShippingLineId: initialLineId,
  syncFrequency: initialSyncFrequency,
  shippingLines,
}: CjFulfillmentSettingsFormProps) {
  const [autoPushOrders, setAutoPushOrders] = useState(initialAutoPush);
  const [defaultShippingLineId, setDefaultShippingLineId] = useState(initialLineId);
  const [syncFrequency, setSyncFrequency] = useState(initialSyncFrequency);
  const [isPending, startTransition] = useTransition();

  const shippingLineItems = Object.fromEntries(shippingLines.map((l) => [l.id, `${l.name} (${l.estimatedDays})`]));

  const dirty =
    autoPushOrders !== initialAutoPush || defaultShippingLineId !== initialLineId || syncFrequency !== initialSyncFrequency;

  function handleSave() {
    startTransition(async () => {
      const result = await updateCjFulfillmentSettingsAction({ autoPushOrders, defaultShippingLineId, syncFrequency });
      if (result.error) {
        toast.error(result.error);
        return;
      }
      toast.success("Fulfillment defaults saved");
    });
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2.5">
        <Switch id="auto-push" checked={autoPushOrders} onCheckedChange={setAutoPushOrders} />
        <Label htmlFor="auto-push">Automatically push paid orders to CJ</Label>
      </div>
      <div className="flex flex-col gap-1.5">
        <Label>Default shipping line</Label>
        <Select value={defaultShippingLineId} onValueChange={(v) => v && setDefaultShippingLineId(v)} items={shippingLineItems}>
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {shippingLines.map((line) => (
              <SelectItem key={line.id} value={line.id}>
                {line.name} ({line.estimatedDays})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="flex flex-col gap-1.5">
        <Label>Sync frequency</Label>
        <Select value={syncFrequency} onValueChange={(v) => v && setSyncFrequency(v)} items={syncFrequencyItems}>
          <SelectTrigger className="w-[220px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="15min">Every 15 minutes</SelectItem>
            <SelectItem value="hourly">Hourly</SelectItem>
            <SelectItem value="6h">Every 6 hours</SelectItem>
            <SelectItem value="daily">Daily</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <Button size="sm" className="w-fit" disabled={!dirty || isPending} onClick={handleSave}>
        {isPending ? "Saving..." : "Save changes"}
      </Button>
    </div>
  );
}
