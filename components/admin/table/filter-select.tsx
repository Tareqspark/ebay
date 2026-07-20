"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface FilterSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  allLabel: string;
  width?: string;
}

/** Quick-filter dropdown used in table toolbars; "all" clears the filter. */
export function FilterSelect({ value, onChange, options, allLabel, width = "w-[150px]" }: FilterSelectProps) {
  const items: Record<string, string> = { all: allLabel };
  for (const opt of options) items[opt.value] = opt.label;

  return (
    <Select value={value} onValueChange={(v) => onChange(v ?? "all")} items={items}>
      <SelectTrigger size="sm" className={width}>
        <SelectValue placeholder={allLabel} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">{allLabel}</SelectItem>
        {options.map((opt) => (
          <SelectItem key={opt.value} value={opt.value}>
            {opt.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
