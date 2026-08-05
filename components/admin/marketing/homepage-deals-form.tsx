"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { ProductPicker } from "@/components/admin/bundles/product-picker";
import { setFeaturedDealsAction, setWeeklyTopDealsAction } from "@/lib/admin/homepage-deals-actions";
import type { HomepageDealProduct, HomepageDealsSelection } from "@/lib/admin/homepage-deals";

interface DealSectionProps {
  label: string;
  description: string;
  initial: HomepageDealProduct[];
  action: (productIds: string[]) => Promise<{ error?: string }>;
}

function DealSection({ label, description, initial, action }: DealSectionProps) {
  const [products, setProducts] = useState<HomepageDealProduct[]>(initial);
  const [submitting, setSubmitting] = useState(false);

  async function handleSave() {
    setSubmitting(true);
    const result = await action(products.map((p) => p.id));
    setSubmitting(false);
    if (result.error) {
      toast.error(result.error);
      return;
    }
    toast.success(`${label} saved`);
  }

  return (
    <div className="flex flex-col gap-2 rounded-lg border border-border p-4">
      <div>
        <Label>{label}</Label>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
      <ProductPicker selected={products} onChange={setProducts} />
      <div>
        <Button size="sm" onClick={handleSave} disabled={submitting}>
          {submitting ? "Saving..." : "Save"}
        </Button>
      </div>
    </div>
  );
}

export function HomepageDealsForm({ selection }: { selection: HomepageDealsSelection }) {
  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <DealSection
        label="Featured Deals"
        description="Hand-picked products shown in the homepage's Featured Deals rail."
        initial={selection.featuredDeals}
        action={setFeaturedDealsAction}
      />
      <DealSection
        label="This Week's Top Deals"
        description="Hand-picked products shown in the homepage's This Week's Top Deals rail."
        initial={selection.weeklyTopDeals}
        action={setWeeklyTopDealsAction}
      />
    </div>
  );
}
