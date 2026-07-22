"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import type { Carrier } from "@/lib/admin/shipping";

interface CarrierFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  carrier: Carrier | null;
  onSubmit: (input: { connected: boolean; servicesUsed: string[] }) => Promise<void>;
  submitting: boolean;
}

export function CarrierFormDialog({ open, onOpenChange, carrier, onSubmit, submitting }: CarrierFormDialogProps) {
  const [connected, setConnected] = useState(false);
  const [services, setServices] = useState("");

  useEffect(() => {
    if (open) {
      setConnected(carrier?.connected ?? false);
      setServices(carrier?.servicesUsed.join(", ") ?? "");
    }
  }, [open, carrier]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{carrier?.name ?? "Carrier"}</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4 py-2">
          <div className="flex items-center gap-2.5">
            <Switch id="carrier-connected" checked={connected} onCheckedChange={setConnected} />
            <Label htmlFor="carrier-connected">Connected</Label>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="carrier-services">Services used</Label>
            <Input
              id="carrier-services"
              value={services}
              onChange={(e) => setServices(e.target.value)}
              placeholder="e.g. Ground, 2-Day Air, Next Day Air"
            />
            <p className="text-xs text-muted-foreground">Comma-separated.</p>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={() =>
              onSubmit({
                connected,
                servicesUsed: services
                  .split(",")
                  .map((s) => s.trim())
                  .filter(Boolean),
              })
            }
            disabled={submitting}
          >
            {submitting ? "Saving..." : "Save changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
