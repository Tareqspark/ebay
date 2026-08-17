/**
 * Decides which leaf category a product title belongs in.
 *
 * Pure and dependency-free so it can be unit-tested against the real failures
 * it exists to fix — the audit found 66% of 11,807 products mis-filed, and
 * every example traced to the same flaw in the previous matcher: it accepted
 * ANY shared word anywhere in the title. CJ titles are long and stuffed with
 * adjectives that collide with category nouns, so one incidental word decided
 * the category:
 *
 *   "Non-slip Waffle Doormat"            -> Women's > Intimates > Slips
 *   "Muslim Solid-color Long-sleeve"     -> Computers > Solid-State Drives
 *   "Leaf Print Lace Bikini"             -> Collectibles > Art Prints
 *   "Newsboy Beret Ivy Flat Cap"         -> Shoes > Women's > Flats
 *   "Universal Shoes For Small Dogs"     -> Baby > Wedding Registry Items
 *   "Motorcycle waterproof rear bag"     -> Computers > Laptop Sleeves & Bags
 *
 * Three changes fix all six:
 *
 *   1. Match on the HEAD NOUN — what the thing *is* — not on any word in the
 *      title. A doormat is a doormat however non-slip it is.
 *   2. Gate the department on unambiguous signals. "dog" outranks everything;
 *      a dog product is a pet product whatever else the title says.
 *   3. Score, and refuse below a threshold. Leaving a product where it is
 *      beats moving it somewhere confidently wrong — the previous pass forced
 *      a guess for every product, which is how it reached 66%.
 */

export interface LeafOption {
  id: string;
  leafName: string;
  childName: string;
  topName: string;
  topSlug: string;
  slugPath: [string, string, string];
}

export interface MatchResult {
  leaf: LeafOption | null;
  confidence: number;
  reason: string;
}

/**
 * Words that describe a product rather than identify it, and which collide
 * with real category names. Every one of these caused a live mis-filing.
 */
const ADJECTIVES = new Set([
  "solid", "print", "printed", "flat", "universal", "slip", "slipping",
  "portable", "mini", "large", "small", "soft", "hard", "smart", "electric",
  "wireless", "adjustable", "creative", "simple", "cute", "new", "fashion",
  "casual", "premium", "luxury", "professional", "multifunction", "multifunctional",
  "waterproof", "breathable", "reusable", "disposable", "foldable", "folding",
  "double", "single", "thick", "thin", "light", "heavy", "long", "short",
  "high", "low", "deep", "quick", "fast", "super", "ultra", "anti", "non",
  // Style and pattern words. CJ titles routinely END on these — "Linen
  // Pillowcase Home Fabric Geometric Abstract" — so without them the
  // head-noun walk stops on "abstract" and never reaches "pillowcase".
  "geometric", "abstract", "vintage", "retro", "modern", "nordic", "classic",
  "elegant", "trendy", "sweet", "lovely", "personality", "personalized",
  "custom", "diy", "solid", "striped", "floral", "cartoon", "plain",
]);

/**
 * What a thing is made of, not what it is.
 *
 * CJ titles list materials freely, often last: "Linen Pillowcase Home Fabric
 * Geometric Abstract" is a pillowcase, but the final noun is "fabric", which
 * sent it to Sewing > Fabric. Treating materials as non-identifying makes the
 * walk continue to the real noun. A genuine bolt of fabric will now usually
 * decline rather than match, which is the safer direction.
 */
const MATERIALS = new Set([
  "fabric", "cotton", "linen", "silk", "wool", "polyester", "leather", "suede",
  "steel", "stainless", "aluminum", "aluminium", "iron", "metal", "brass",
  "wood", "wooden", "bamboo", "plastic", "acrylic", "glass", "ceramic",
  "silicone", "rubber", "velvet", "denim", "nylon", "canvas", "flannel",
]);

/** Structural words that carry no category signal. */
const STOPWORDS = new Set([
  "and", "the", "for", "with", "set", "sets", "kit", "kits", "pcs", "piece", "pieces",
  "pack", "packs", "style", "color", "colour", "size", "type", "version", "series",
  "accessories", "accessory", "other", "supplies", "products", "items", "item",
  "use", "used", "home", "outdoor", "indoor", "quality",
]);

/** A trailing phrase after one of these describes purpose, not identity: "Shoes **for** Small Dogs". */
const PREPOSITIONS = new Set(["for", "with", "in", "on", "of", "from", "by", "to", "at", "as"]);

function tokens(text: string): string[] {
  return text.toLowerCase().split(/[^a-z0-9]+/).filter(Boolean);
}

/**
 * Strips CJ's variant suffix. Titles end with the chosen option — "- Black-L",
 * "- Deep apricot-34x34x40cm", "- 2 Style" — which is colour and size noise
 * that matches category words by accident.
 */
export function cleanTitle(title: string): string {
  return title.split(/\s+[-–]\s+/)[0].trim();
}

/**
 * The noun that says what the product IS.
 *
 * Everything after a preposition describes what it's for, so it's cut first:
 * "Universal Shoes For Small Dogs" is a shoe, not a dog. What remains ends in
 * its head noun, skipping back over adjectives — "Ivy Flat Cap" is a cap.
 * Returns up to two words so compound heads survive ("knife set" is dropped to
 * "knife" by the stopword filter, but "storage rack" keeps "rack").
 */
export function headNouns(title: string): string[] {
  const words = tokens(cleanTitle(title));
  const cut = words.findIndex((w) => PREPOSITIONS.has(w));
  const phrase = (cut > 0 ? words.slice(0, cut) : words).filter((w) => w.length >= 3 && !STOPWORDS.has(w));
  if (phrase.length === 0) return [];

  const heads: string[] = [];
  for (let i = phrase.length - 1; i >= 0 && heads.length < 2; i--) {
    if (ADJECTIVES.has(phrase[i]) || MATERIALS.has(phrase[i])) continue;
    heads.push(phrase[i]);
  }
  // Everything was an adjective — fall back to the final word rather than
  // giving up, so "Solid Flat" still yields something to score.
  return heads.length ? heads : [phrase[phrase.length - 1]];
}

interface Gate {
  topSlug: string;
  pattern: RegExp;
  label: string;
}

/**
 * Signals strong enough to decide the department on their own.
 *
 * A title mentioning a dog is a pet product regardless of what else it says —
 * that alone accounts for 2,357 of the mis-filed products, sitting in
 * Electronics, Registry and elsewhere. Order matters: the first match wins,
 * so the most specific signals come first.
 */
const GATES: Gate[] = [
  { topSlug: "pet-supplies", label: "pet", pattern: /\b(dog|dogs|puppy|puppies|cat|cats|kitten|kittens|pet|pets|aquarium|hamster|parrot|birdcage|leash|kennel)\b/i },
  { topSlug: "kids-and-baby", label: "baby", pattern: /\b(baby|babies|infant|newborn|toddler|nursery|diaper|diapers|pacifier|stroller|onesie|romper|rompers)\b/i },
  { topSlug: "automotive-and-powersports", label: "automotive", pattern: /\b(car|cars|motorcycle|motorbike|vehicle|truck|automotive|windshield|windscreen|tyre|tyres|dashboard)\b/i },
];

/** Gendered wording that must not land in the opposite department. */
const WOMENS = /\b(women|womens|woman|ladies|lady|female|girls)\b/i;
const MENS = /\b(men|mens|man|male|boys)\b/i;

/**
 * Head nouns that mean the same thing to a shopper but share no letters.
 * Deliberately tiny — each entry is a real miss, not a guess. Without this
 * "motorcycle rear bag" finds no home and stays in Laptop Sleeves & Bags.
 */
const SYNONYMS: Record<string, string[]> = {
  bag: ["luggage", "tote", "backpack"],
  luggage: ["bag"],
  cap: ["hat"],
  hat: ["cap"],
  sofa: ["couch"],
  couch: ["sofa"],
  pants: ["trousers"],
  trousers: ["pants"],
  sneakers: ["trainers"],
  jumper: ["sweater"],
  pullover: ["sweater"],
};

function synonymsOf(word: string): string[] {
  return SYNONYMS[word] ?? [];
}

/**
 * A specific noun and the broader category words it belongs under.
 *
 * Categories are named at a level above individual products — "Cat Clothing",
 * not "Cat Sweaters" — so a sweater has to be recognised as clothing or it
 * finds nothing. Kept to the groupings the tree actually uses.
 */
const HYPERNYMS: Record<string, string[]> = {
  sweater: ["clothing", "apparel", "sweaters", "tops"],
  sweatshirt: ["clothing", "apparel", "tops"],
  hoodie: ["clothing", "apparel", "tops"],
  shirt: ["clothing", "apparel", "tops"],
  tshirt: ["clothing", "apparel", "tops"],
  blouse: ["clothing", "apparel", "tops"],
  cardigan: ["clothing", "apparel", "tops"],
  jacket: ["clothing", "apparel", "outerwear"],
  coat: ["clothing", "apparel", "outerwear"],
  dress: ["clothing", "apparel", "dresses"],
  skirt: ["clothing", "apparel"],
  vest: ["clothing", "apparel"],
  romper: ["clothing", "apparel"],
  onesie: ["clothing", "apparel"],
  boots: ["shoes", "footwear"],
  sandals: ["shoes", "footwear"],
  slippers: ["shoes", "footwear"],
  sneakers: ["shoes", "footwear"],
  necklace: ["jewelry", "jewellery"],
  bracelet: ["jewelry", "jewellery"],
  earrings: ["jewelry", "jewellery"],
};

function broaderThan(word: string): string[] {
  return HYPERNYMS[word] ?? [];
}

function inflectionMatch(a: string, b: string): boolean {
  if (a === b) return true;
  const [short, long] = a.length <= b.length ? [a, b] : [b, a];
  if (!long.startsWith(short)) return false;
  const rest = long.slice(short.length);
  return rest === "s" || rest === "es";
}

function leafWords(leaf: LeafOption): string[] {
  return tokens(leaf.leafName).filter((w) => w.length >= 3 && !STOPWORDS.has(w));
}

/**
 * Scores one leaf for a title. Higher is better; anything under the caller's
 * threshold is treated as no match.
 */
function scoreLeaf(titleWords: string[], heads: string[], leaf: LeafOption, gatedTop: string | null): number {
  const lw = leafWords(leaf);
  if (lw.length === 0) return 0;

  // A gate is a hard filter, not a hint.
  if (gatedTop && leaf.topSlug !== gatedTop) return 0;

  const leafHead = lw[lw.length - 1];
  let score = 0;

  // The product's head noun matching the category's head noun is the single
  // strongest signal: "cap" -> "Hats & Caps" beats "flat" -> "Flats".
  const headHits = (target: string) => {
    const i = heads.findIndex(
      (h) =>
        inflectionMatch(h, target) ||
        synonymsOf(h).some((s) => inflectionMatch(s, target)) ||
        broaderThan(h).some((b) => inflectionMatch(b, target))
    );
    // The first head is the one nearest the end of the noun phrase and so the
    // likelier identity; a second-choice hit still counts, but for less.
    return i === -1 ? 0 : i === 0 ? 6 : 5;
  };

  const headScore = headHits(leafHead);
  if (headScore) score += headScore;
  else if (heads.some((h) => lw.some((w) => inflectionMatch(h, w) || synonymsOf(h).some((s) => inflectionMatch(s, w))))) score += 3;

  // Remaining leaf words present in the title corroborate it.
  const others = lw.slice(0, -1);
  const supported = others.filter((w) => titleWords.some((t) => inflectionMatch(t, w))).length;
  if (others.length > 0) score += (supported / others.length) * 2;

  // A leaf whose own name is only adjectives ("Flats", "Solid") is a weak
  // destination — require the head-noun hit rather than accepting support.
  if (lw.every((w) => ADJECTIVES.has(w)) && !headScore) return 0;

  return score;
}

/**
 * Picks the best leaf, or none.
 *
 * `minScore` of 4 means a head-noun hit on the category's own head noun (6),
 * or a weaker head hit (3) with corroborating words. A title sharing only an
 * incidental adjective scores 0 and is left alone — which is the entire point.
 */
export function matchProductToLeaf(title: string, leaves: LeafOption[], minScore = 4): MatchResult {
  const cleaned = cleanTitle(title);
  const titleWords = tokens(cleaned).filter((w) => w.length >= 3);
  const heads = headNouns(title);
  if (heads.length === 0) return { leaf: null, confidence: 0, reason: "no usable noun in the title" };

  const gate = GATES.find((g) => g.pattern.test(cleaned));
  const gatedTop = gate?.topSlug ?? null;

  const womens = WOMENS.test(cleaned);
  const mens = MENS.test(cleaned) && !womens;

  /**
   * The head noun decides, or nothing does.
   *
   * An earlier version fell back to a secondary noun when the head found no
   * category, and every example it produced was wrong: "Electric Scarf USB
   * Rechargeable" went to Rechargeable Batteries, "Winter Ring Velvet Long
   * Shawl" to Smart Rings. The cause is not the fallback's scoring but the
   * tree — there is no Scarves or Shawls leaf, so those products have no
   * correct home and any match is a wrong one. Declining says exactly that,
   * and the decline list is the evidence for which categories are missing.
   */
  const eligible = leaves.filter((leaf) => {
    // Gendered wording must not cross departments — 554 products are in the
    // wrong one of these two today.
    if (womens && leaf.topSlug === "mens-clothing") return false;
    if (mens && leaf.topSlug === "womens-clothing") return false;
    return true;
  });

  let best: { leaf: LeafOption; score: number } | null = null;
  for (const leaf of eligible) {
    const score = scoreLeaf(titleWords, [heads[0]], leaf, gatedTop);
    if (score > 0 && (!best || score > best.score)) best = { leaf, score };
  }

  if (!best || best.score < minScore) {
    return {
      leaf: null,
      confidence: best ? best.score / 8 : 0,
      reason: gate ? `no confident ${gate.label} category for "${heads[0]}"` : `no confident category for "${heads[0]}"`,
    };
  }

  return {
    leaf: best.leaf,
    confidence: Math.min(1, best.score / 8),
    reason: `head noun "${heads[0]}"${gate ? `, ${gate.label} department` : ""}`,
  };
}
