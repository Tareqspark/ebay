"use client";

import { useRef, useState } from "react";
import { formatMoney } from "@/lib/admin/format";
import { cn } from "@/lib/utils";

interface EditableMoneyCellProps {
  value: number;
  onCommit: (next: number) => void;
  className?: string;
}

/** Click-to-edit currency cell — click to reveal an input, Enter/blur commits, Escape cancels. */
export function EditableMoneyCell({ value, onCommit, className }: EditableMoneyCellProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(String(value));
  const inputRef = useRef<HTMLInputElement>(null);

  if (!editing) {
    return (
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setDraft(String(value));
          setEditing(true);
          requestAnimationFrame(() => inputRef.current?.select());
        }}
        className={cn(
          "rounded px-1.5 py-0.5 tabular-nums transition-colors hover:bg-muted",
          className
        )}
      >
        {formatMoney(value)}
      </button>
    );
  }

  function commit() {
    const parsed = Number.parseFloat(draft);
    setEditing(false);
    if (!Number.isNaN(parsed) && parsed >= 0 && parsed !== value) {
      onCommit(Math.round(parsed * 100) / 100);
    }
  }

  return (
    <input
      ref={inputRef}
      type="number"
      step="0.01"
      min="0"
      value={draft}
      autoFocus
      onClick={(e) => e.stopPropagation()}
      onChange={(e) => setDraft(e.target.value)}
      onBlur={commit}
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          commit();
        }
        if (e.key === "Escape") {
          e.preventDefault();
          setEditing(false);
        }
      }}
      className="w-20 rounded border border-ring bg-background px-1.5 py-0.5 text-sm tabular-nums outline-none ring-2 ring-ring/30"
    />
  );
}
