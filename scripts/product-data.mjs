// Pure product-generation logic, shared by generate-products.mjs (writes
// app/data/products.ts) and generate-admin-data.mjs (needs the same product
// records in memory to build orders/inventory/admin metadata against real ids).
import { RAW } from "./category-source.mjs";
import { RAW_BRANDS } from "./brand-source.mjs";
import { slugify } from "./slugify.mjs";
import { createRng } from "./rng.mjs";

export const PRICE_RANGES = {
  electronics: [15, 1899],
  "computers-and-tablets": [19, 2999],
  "cell-phones-and-accessories": [9, 1399],
  "video-games-and-consoles": [12, 599],
  "cameras-and-photography": [15, 2799],
  "home-and-kitchen": [8, 599],
  furniture: [39, 2499],
  "major-appliances": [149, 2999],
  "bedding-and-bath": [9, 349],
  "home-improvement-and-tools": [6, 899],
  "automotive-and-powersports": [8, 1299],
  "mens-clothing": [12, 249],
  "womens-clothing": [12, 279],
  "kids-and-baby": [7, 349],
  shoes: [19, 259],
  "jewelry-and-watches": [15, 4999],
  "health-and-beauty": [4, 189],
  "sporting-goods-and-outdoors": [9, 1499],
  "toys-games-and-hobbies": [6, 299],
  "pet-supplies": [4, 349],
  "books-movies-and-music": [5, 79],
  "musical-instruments-and-gear": [12, 2199],
  "office-and-school-supplies": [3, 449],
  "arts-crafts-and-sewing": [3, 599],
  "collectibles-and-fine-art": [9, 3499],
  "garden-and-outdoor-living": [8, 1499],
  "grocery-and-gourmet-food": [3, 69],
  "luggage-and-travel-gear": [15, 449],
  "industrial-and-scientific": [9, 1999],
  "baby-and-wedding-registry-essentials": [9, 399],
  "seasonal-and-holiday": [4, 249],
};

const DEFAULT_MODIFIERS = ["Classic", "Everyday", "Essential", "Premium", "Signature"];
const MODIFIERS_BY_TOP = {
  electronics: ["Wireless", "Smart", "Pro", "Portable", "HD", "Compact"],
  "computers-and-tablets": ["Pro", "Slim", "High-Performance", "Everyday", "Business"],
  "cell-phones-and-accessories": ["Wireless", "Fast-Charge", "Slim", "Rugged", "Everyday"],
  "video-games-and-consoles": ["Pro", "Elite", "Wireless", "Limited Edition"],
  "cameras-and-photography": ["Pro", "Compact", "Travel", "Studio"],
  "home-and-kitchen": ["Stainless Steel", "Nonstick", "Family-Size", "Compact", "Premium"],
  furniture: ["Modern", "Mid-Century", "Upholstered", "Solid Wood", "Compact"],
  "major-appliances": ["Energy-Efficient", "Smart", "Large-Capacity", "Compact"],
  "bedding-and-bath": ["Soft-Touch", "Quilted", "Cooling", "Organic Cotton"],
  "home-improvement-and-tools": ["Heavy-Duty", "Cordless", "Professional-Grade", "Compact"],
  "automotive-and-powersports": ["All-Weather", "Heavy-Duty", "Performance", "OEM-Style"],
  "mens-clothing": ["Classic Fit", "Slim Fit", "Everyday", "Signature"],
  "womens-clothing": ["Relaxed Fit", "Everyday", "Signature", "Tailored"],
  "kids-and-baby": ["Soft", "Everyday", "Adjustable", "Machine-Washable"],
  shoes: ["Lightweight", "Cushioned", "Everyday", "Performance"],
  "jewelry-and-watches": ["Sterling Silver", "14K Gold-Plated", "Signature", "Classic"],
  "health-and-beauty": ["Hydrating", "Gentle", "Fragrance-Free", "Daily"],
  "sporting-goods-and-outdoors": ["Lightweight", "All-Terrain", "Performance", "Packable"],
  "toys-games-and-hobbies": ["Interactive", "Classic", "Deluxe", "Educational"],
  "pet-supplies": ["Durable", "Washable", "Everyday", "Large-Breed"],
  "books-movies-and-music": ["Collector's Edition", "Illustrated", "Anniversary Edition"],
  "musical-instruments-and-gear": ["Studio", "Beginner-Friendly", "Professional", "Compact"],
  "office-and-school-supplies": ["Everyday", "Heavy-Duty", "Compact", "Ergonomic"],
  "arts-crafts-and-sewing": ["Beginner-Friendly", "Deluxe", "Everyday"],
  "collectibles-and-fine-art": ["Limited Edition", "Hand-Finished", "Numbered"],
  "garden-and-outdoor-living": ["Weather-Resistant", "Heavy-Duty", "Compact"],
  "grocery-and-gourmet-food": ["Family-Size", "Small-Batch", "Organic"],
  "luggage-and-travel-gear": ["Lightweight", "Hardside", "Expandable", "Carry-On"],
  "industrial-and-scientific": ["Heavy-Duty", "Precision", "Commercial-Grade"],
  "baby-and-wedding-registry-essentials": ["Essential", "Everyday", "Gift-Ready"],
  "seasonal-and-holiday": ["Festive", "Classic", "Light-Up"],
};

const VARIANTS = ["Black", "White", "Graphite", "Navy", "Slate", "Sand", "Charcoal", "Ocean Blue", "Forest Green", "Rose Gold"];

const DESCRIPTION_TEMPLATES = [
  (brand, leaf, top) =>
    `The ${brand} ${leaf} brings dependable performance and thoughtful design to your ${top} lineup, tested for everyday durability and built to perform from the first use.`,
  (brand, leaf, top) =>
    `Designed for people who expect more from their ${top} gear, the ${brand} ${leaf} pairs quality materials with a clean, functional design that fits right into daily life.`,
  (brand, leaf, top) =>
    `${brand} engineered the ${leaf} to deliver reliable results without the fuss — a smart pick for anyone upgrading their ${top} setup this season.`,
  (brand, leaf, top) =>
    `A standout in our ${top} selection, the ${brand} ${leaf} balances form and function with details that hold up to real-world use.`,
  (brand, leaf, top) =>
    `From first impression to everyday use, the ${brand} ${leaf} is built to earn a permanent spot in your ${top} rotation.`,
];

const FEATURE_POOL_DEFAULT = [
  "Backed by a 1-year limited warranty",
  "Rigorously tested for everyday durability",
  "Designed with premium, long-lasting materials",
  "Easy to set up right out of the box",
  "Trusted by thousands of repeat customers",
  "Thoughtfully designed for everyday use",
];
const FEATURE_POOL_BY_TOP = {
  electronics: ["Fast, reliable wireless connectivity", "Long-lasting battery life", "Compact design that travels well"],
  "computers-and-tablets": ["Fast boot and load times", "Ample storage for work and play", "Sleek, portable design"],
  "cell-phones-and-accessories": ["Slim profile that fits any pocket", "Precise cutouts for ports and cameras", "Drop-tested for peace of mind"],
  "home-and-kitchen": ["Dishwasher-safe for easy cleanup", "Even heat distribution", "Space-saving design"],
  furniture: ["Sturdy frame built to last", "Easy at-home assembly", "Fits comfortably in most rooms"],
  "mens-clothing": ["Breathable, comfortable fabric", "Fade-resistant color", "True-to-size fit"],
  "womens-clothing": ["Soft, breathable fabric", "Flattering, true-to-size fit", "Fade-resistant color"],
  shoes: ["Cushioned insole for all-day comfort", "Durable, slip-resistant outsole", "Breathable upper material"],
  "health-and-beauty": ["Dermatologist-tested formula", "Free from harsh sulfates", "Suitable for daily use"],
  "sporting-goods-and-outdoors": ["Built for all-terrain performance", "Lightweight, packable design", "Weather-resistant construction"],
  "pet-supplies": ["Safe, pet-tested materials", "Easy to clean", "Built for daily play"],
};

const GENERIC_BRANDS = [
  { id: "storehouse", name: "Storehouse" },
  { id: "northline", name: "Northline" },
  { id: "everly", name: "Everly" },
];

export function generateProducts(seed = 20260714) {
  const { rand, pick, pickN, randInt, chance } = createRng(seed);

  const BRANDS_BY_TOP = new Map();
  for (const [name, categorySlugs] of RAW_BRANDS) {
    for (const slug of categorySlugs) {
      if (!BRANDS_BY_TOP.has(slug)) BRANDS_BY_TOP.set(slug, []);
      BRANDS_BY_TOP.get(slug).push({ id: slugify(name), name });
    }
  }

  function priceFor(topSlug) {
    const [min, max] = PRICE_RANGES[topSlug] ?? [9, 199];
    const raw = min + rand() * (max - min);
    return Math.round(raw) - 0.01 < 1 ? Math.round(raw * 100) / 100 : Math.round(raw) - 0.01;
  }

  const products = [];
  const usedSlugs = new Set();

  for (const [topName, , , , children] of RAW) {
    const topSlug = slugify(topName);
    const topDisplay = topName.replace(/&/g, "&").toLowerCase();
    const brandPool = (BRANDS_BY_TOP.get(topSlug) ?? []).concat(GENERIC_BRANDS);
    const modifiers = MODIFIERS_BY_TOP[topSlug] ?? DEFAULT_MODIFIERS;
    const featurePool = (FEATURE_POOL_BY_TOP[topSlug] ?? []).concat(FEATURE_POOL_DEFAULT);

    for (const [childName, grandchildren] of children) {
      const childSlug = slugify(childName);

      for (const gcName of grandchildren) {
        const gcSlug = slugify(gcName);
        const productsForLeaf = 2;

        for (let i = 0; i < productsForLeaf; i += 1) {
          const brand = pick(brandPool);
          const useModifier = chance(0.7);
          const modifier = useModifier ? pick(modifiers) : null;
          const titleBase = modifier ? `${brand.name} ${modifier} ${gcName}` : `${brand.name} ${gcName}`;

          let slug = slugify(titleBase);
          let title = titleBase;
          if (usedSlugs.has(slug)) {
            const variant = pick(VARIANTS);
            title = `${titleBase} - ${variant}`;
            slug = slugify(title);
          }
          let dedupeCounter = 2;
          while (usedSlugs.has(slug)) {
            slug = `${slug}-${dedupeCounter}`;
            dedupeCounter += 1;
          }
          usedSlugs.add(slug);

          const price = priceFor(topSlug);
          const isDeal = chance(0.28);
          const isFlashSale = chance(0.08);
          const hasDiscount = isDeal || isFlashSale || chance(0.12);
          const discountPct = hasDiscount ? randInt(10, 45) : 0;
          const originalPrice = hasDiscount ? Math.round((price / (1 - discountPct / 100)) * 100) / 100 : undefined;

          const rating = Math.round((3.4 + rand() * 1.6) * 10) / 10;
          const reviewCount = chance(0.15) ? randInt(400, 6200) : randInt(2, 380);

          const descTemplate = pick(DESCRIPTION_TEMPLATES);
          const description = descTemplate(brand.name, gcName, topDisplay);
          const features = pickN(featurePool, Math.min(4, featurePool.length));

          products.push({
            id: `p-${slug}`,
            slug,
            title,
            brandId: brand.id,
            price,
            originalPrice,
            images: [1, 2, 3].map((n) => `https://picsum.photos/seed/${slug}-${n}/900/900`),
            rating,
            reviewCount,
            categorySlugPath: [topSlug, childSlug, gcSlug],
            isNewArrival: chance(0.16),
            isBestSeller: reviewCount > 2500 || chance(0.1),
            isTrending: chance(0.14),
            isFlashSale,
            isDeal,
            freeShipping: price >= 25 || chance(0.5),
            stock: chance(0.05) ? 0 : randInt(3, 320),
            description,
            features,
          });
        }
      }
    }
  }

  return products;
}
