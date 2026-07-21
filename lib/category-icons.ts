import type { LucideIcon } from "lucide-react";
import {
  Baby,
  BedDouble,
  BookOpen,
  Briefcase,
  Camera,
  Car,
  Dumbbell,
  FlaskConical,
  Footprints,
  Gamepad2,
  Gem,
  Gift,
  Hammer,
  Laptop,
  Luggage,
  Music,
  Palette,
  PartyPopper,
  PawPrint,
  Puzzle,
  Refrigerator,
  Shirt,
  ShoppingBasket,
  Smartphone,
  Sofa,
  Sparkles,
  Trees,
  UtensilsCrossed,
  Watch,
  Zap,
  Tag,
} from "lucide-react";

/**
 * Category.icon can't be stored in the database (a LucideIcon is a
 * component, not data) — db/schema.ts stores the icon's export name as a
 * string instead, and this map resolves it back to the component. Keep in
 * sync with the icon set scripts/category-source.mjs used to originally
 * generate app/data/categories.ts.
 */
export const CATEGORY_ICONS: Record<string, LucideIcon> = {
  Baby,
  BedDouble,
  BookOpen,
  Briefcase,
  Camera,
  Car,
  Dumbbell,
  FlaskConical,
  Footprints,
  Gamepad2,
  Gem,
  Gift,
  Hammer,
  Laptop,
  Luggage,
  Music,
  Palette,
  PartyPopper,
  PawPrint,
  Puzzle,
  Refrigerator,
  Shirt,
  ShoppingBasket,
  Smartphone,
  Sofa,
  Sparkles,
  Trees,
  UtensilsCrossed,
  Watch,
  Zap,
};

export function resolveCategoryIcon(iconName: string | null | undefined): LucideIcon {
  return (iconName && CATEGORY_ICONS[iconName]) || Tag;
}
