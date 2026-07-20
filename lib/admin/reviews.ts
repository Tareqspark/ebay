import { PRODUCTS, CUSTOMERS, getProduct, getCustomer } from "@/lib/admin/data";

export type ReviewStatus = "pending" | "approved" | "rejected";

export interface ProductReview {
  id: string;
  productId: string;
  customerId: string;
  rating: 1 | 2 | 3 | 4 | 5;
  title: string;
  body: string;
  status: ReviewStatus;
  createdAt: string;
}

const REVIEW_COPY: Record<number, { title: string; body: string }[]> = {
  5: [
    { title: "Exceeded expectations", body: "Exactly as described and arrived faster than I expected. Would buy again without hesitation." },
    { title: "Exactly what I needed", body: "Great build quality and works perfectly for everyday use. Happy with this purchase." },
  ],
  4: [
    { title: "Really solid", body: "Does what it promises with only minor nitpicks. Good value for the price." },
    { title: "Would recommend", body: "Comfortable, well made, and shipped quickly. Docking one star for the packaging." },
  ],
  3: [
    { title: "Does the job", body: "Nothing special but gets the job done. Wouldn't call it a standout at this price point." },
    { title: "Average experience", body: "Works as expected but the material feels a bit cheaper than I hoped." },
  ],
  2: [
    { title: "Had some issues", body: "Ran into a minor defect out of the box. Support was slow to respond to my email." },
  ],
  1: [
    { title: "Not what I expected", body: "Quality felt noticeably cheaper than the photos suggested. Considering a return." },
  ],
};

function seededRandom(seed: number) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function buildReviews(): ProductReview[] {
  const rand = seededRandom(4242);
  const count = 90;
  const reviews: ProductReview[] = [];
  for (let i = 0; i < count; i += 1) {
    const product = PRODUCTS[Math.floor(rand() * PRODUCTS.length)];
    const customer = CUSTOMERS[Math.floor(rand() * CUSTOMERS.length)];
    const ratingRoll = rand();
    const rating = (ratingRoll < 0.5 ? 5 : ratingRoll < 0.75 ? 4 : ratingRoll < 0.88 ? 3 : ratingRoll < 0.96 ? 2 : 1) as ProductReview["rating"];
    const copyPool = REVIEW_COPY[rating];
    const copy = copyPool[Math.floor(rand() * copyPool.length)];
    const statusRoll = rand();
    const status: ReviewStatus = statusRoll < 0.75 ? "approved" : statusRoll < 0.92 ? "pending" : "rejected";
    reviews.push({
      id: `rev-${i + 1}`,
      productId: product.id,
      customerId: customer.id,
      rating,
      title: copy.title,
      body: copy.body,
      status,
      createdAt: new Date(Date.now() - Math.floor(rand() * 45) * 86400000).toISOString(),
    });
  }
  return reviews.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export const REVIEWS: ProductReview[] = buildReviews();

export function getReviewProductTitle(review: ProductReview): string {
  return getProduct(review.productId)?.title ?? review.productId;
}
export function getReviewCustomerName(review: ProductReview): string {
  return getCustomer(review.customerId)?.name ?? review.customerId;
}
