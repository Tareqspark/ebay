"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface TempPasswordDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  password: string | null;
}

export function TempPasswordDialog({ open, onOpenChange, password }: TempPasswordDialogProps) {
  const [copied, setCopied] = useState(false);

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        onOpenChange(next);
        if (!next) setCopied(false);
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Temporary password</DialogTitle>
          <DialogDescription>
            Share this with the team member yourself — it&apos;s only shown once and can&apos;t be retrieved again.
          </DialogDescription>
        </DialogHeader>
        <div className="flex items-center justify-between gap-3 rounded-lg border border-border bg-muted/30 px-3 py-2.5">
          <code className="font-mono text-sm text-foreground">{password}</code>
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5"
            onClick={async () => {
              if (!password) return;
              await navigator.clipboard.writeText(password);
              setCopied(true);
              toast.success("Copied to clipboard");
            }}
          >
            {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
            {copied ? "Copied" : "Copy"}
          </Button>
        </div>
        <DialogFooter>
          <Button onClick={() => onOpenChange(false)}>Done</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
