import type { Session } from "next-auth";
import { TopBar } from "@/components/layout/top-bar";
import { MainHeader } from "@/components/layout/main-header";
import { NavMegaMenu } from "@/components/layout/nav-mega-menu";
import { buildCategoryTree, getCategoryTree, toClientCategories } from "@/lib/category-utils";
import { getAllBrands } from "@/lib/brands";

export async function Header({ session }: { session: Session | null }) {
  const [tree, brands, mobileTree] = await Promise.all([getCategoryTree(), getAllBrands(), buildCategoryTree()]);

  const brandsBySlug: Record<string, typeof brands> = {};
  for (const top of tree) {
    brandsBySlug[top.slug] = brands.filter((b) => b.categorySlugs.includes(top.slug)).slice(0, 8);
  }

  const categories = toClientCategories(tree, "h-4 w-4 shrink-0");
  const featuredCategories = toClientCategories(
    tree.filter((c) => c.featured).slice(0, 6),
    "h-4 w-4 text-primary"
  );
  const allCategoriesForScope = tree.map((c) => ({ slug: c.slug, name: c.name }));

  return (
    <header className="sticky top-0 z-40 border-b border-border/70 shadow-sm">
      <TopBar />
      <MainHeader
        session={session}
        featuredCategories={featuredCategories}
        allCategoriesForScope={allCategoriesForScope}
        mobileTree={mobileTree}
      />
      <NavMegaMenu categories={categories} brandsBySlug={brandsBySlug} />
    </header>
  );
}
