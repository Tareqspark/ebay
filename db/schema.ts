import {
  mysqlTable,
  varchar,
  int,
  boolean,
  timestamp,
  text,
  json,
  mysqlEnum,
  index,
} from "drizzle-orm/mysql-core";
import { relations } from "drizzle-orm";

// All money columns are integer cents — see PRODUCT.md's Database conventions.
// All primary keys are ULIDs (varchar(26)) generated in application code.

export const users = mysqlTable("users", {
  id: varchar("id", { length: 26 }).primaryKey(),
  name: varchar("name", { length: 191 }).notNull(),
  email: varchar("email", { length: 191 }).notNull().unique(),
  passwordHash: varchar("password_hash", { length: 255 }).notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow().onUpdateNow(),
});

export const addresses = mysqlTable(
  "addresses",
  {
    id: varchar("id", { length: 26 }).primaryKey(),
    userId: varchar("user_id", { length: 26 }).notNull(),
    name: varchar("name", { length: 191 }).notNull(),
    line1: varchar("line1", { length: 191 }).notNull(),
    line2: varchar("line2", { length: 191 }),
    city: varchar("city", { length: 120 }).notNull(),
    state: varchar("state", { length: 60 }).notNull(),
    zip: varchar("zip", { length: 20 }).notNull(),
    country: varchar("country", { length: 60 }).notNull().default("US"),
    isDefault: boolean("is_default").notNull().default(false),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => [index("addresses_user_id_idx").on(table.userId)]
);

export const carts = mysqlTable(
  "carts",
  {
    id: varchar("id", { length: 26 }).primaryKey(),
    userId: varchar("user_id", { length: 26 }),
    guestId: varchar("guest_id", { length: 26 }),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow().onUpdateNow(),
  },
  (table) => [
    index("carts_user_id_idx").on(table.userId),
    index("carts_guest_id_idx").on(table.guestId),
  ]
);

export const cartItems = mysqlTable(
  "cart_items",
  {
    id: varchar("id", { length: 26 }).primaryKey(),
    cartId: varchar("cart_id", { length: 26 }).notNull(),
    productId: varchar("product_id", { length: 191 }).notNull(),
    quantity: int("quantity").notNull().default(1),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => [index("cart_items_cart_id_idx").on(table.cartId)]
);

export const orderPaymentStatus = ["paid", "pending", "refunded", "partially_refunded", "failed"] as const;
export const orderFulfillmentStatus = ["unfulfilled", "processing", "shipped", "delivered", "cancelled"] as const;

export const orders = mysqlTable(
  "orders",
  {
    id: varchar("id", { length: 26 }).primaryKey(),
    orderNumber: varchar("order_number", { length: 32 }).notNull().unique(),
    userId: varchar("user_id", { length: 26 }).notNull(),
    paymentStatus: mysqlEnum("payment_status", orderPaymentStatus).notNull().default("pending"),
    fulfillmentStatus: mysqlEnum("fulfillment_status", orderFulfillmentStatus).notNull().default("unfulfilled"),
    subtotalCents: int("subtotal_cents").notNull(),
    shippingCents: int("shipping_cents").notNull().default(0),
    taxCents: int("tax_cents").notNull(),
    totalCents: int("total_cents").notNull(),
    paymentMethod: varchar("payment_method", { length: 60 }).notNull().default("card"),
    stripePaymentIntentId: varchar("stripe_payment_intent_id", { length: 191 }),
    shippingAddress: json("shipping_address").notNull().$type<{
      name: string;
      line1: string;
      city: string;
      state: string;
      zip: string;
      country: string;
    }>(),
    placedAt: timestamp("placed_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow().onUpdateNow(),
  },
  (table) => [index("orders_user_id_idx").on(table.userId)]
);

export const orderItems = mysqlTable(
  "order_items",
  {
    id: varchar("id", { length: 26 }).primaryKey(),
    orderId: varchar("order_id", { length: 26 }).notNull(),
    productId: varchar("product_id", { length: 191 }).notNull(),
    title: varchar("title", { length: 255 }).notNull(),
    image: text("image").notNull(),
    quantity: int("quantity").notNull(),
    priceCents: int("price_cents").notNull(),
    source: mysqlEnum("source", ["self", "cj"]).notNull().default("self"),
  },
  (table) => [index("order_items_order_id_idx").on(table.orderId)]
);

export const reviews = mysqlTable(
  "reviews",
  {
    id: varchar("id", { length: 26 }).primaryKey(),
    productId: varchar("product_id", { length: 191 }).notNull(),
    userId: varchar("user_id", { length: 26 }).notNull(),
    rating: int("rating").notNull(),
    title: varchar("title", { length: 191 }).notNull(),
    body: text("body").notNull(),
    status: mysqlEnum("status", ["pending", "approved", "rejected"]).notNull().default("approved"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => [index("reviews_product_id_idx").on(table.productId)]
);

export const usersRelations = relations(users, ({ many }) => ({
  addresses: many(addresses),
  orders: many(orders),
  reviews: many(reviews),
}));

export const cartsRelations = relations(carts, ({ many }) => ({
  items: many(cartItems),
}));

export const cartItemsRelations = relations(cartItems, ({ one }) => ({
  cart: one(carts, { fields: [cartItems.cartId], references: [carts.id] }),
}));

export const ordersRelations = relations(orders, ({ many, one }) => ({
  items: many(orderItems),
  user: one(users, { fields: [orders.userId], references: [users.id] }),
}));

export const orderItemsRelations = relations(orderItems, ({ one }) => ({
  order: one(orders, { fields: [orderItems.orderId], references: [orders.id] }),
}));
