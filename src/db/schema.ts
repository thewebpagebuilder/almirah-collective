import {
  pgTable,
  serial,
  text,
  varchar,
  integer,
  boolean,
  timestamp,
  numeric,
  jsonb,
  pgEnum,
} from "drizzle-orm/pg-core";

export const orderStatusEnum = pgEnum("order_status", [
  "processed",
  "shipped",
  "out_for_delivery",
  "delivered",
  "cancelled",
  "returned",
]);

export const complaintStatusEnum = pgEnum("complaint_status", [
  "open",
  "in_review",
  "approved",
  "rejected",
  "resolved",
]);

export const leadStatusEnum = pgEnum("lead_status", [
  "new",
  "contacted",
  "qualified",
  "converted",
  "lost",
]);

export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  slug: varchar("slug", { length: 120 }).notNull().unique(),
  name: varchar("name", { length: 160 }).notNull(),
  description: text("description"),
  imageUrl: text("image_url"),
  parentSlug: varchar("parent_slug", { length: 120 }),
  sortOrder: integer("sort_order").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  slug: varchar("slug", { length: 160 }).notNull().unique(),
  name: varchar("name", { length: 220 }).notNull(),
  description: text("description").notNull(),
  shortDescription: text("short_description"),
  categorySlug: varchar("category_slug", { length: 120 }).notNull(),
  price: numeric("price", { precision: 10, scale: 2 }).notNull(),
  compareAtPrice: numeric("compare_at_price", { precision: 10, scale: 2 }),
  material: text("material"),
  careInstructions: text("care_instructions"),
  images: jsonb("images").$type<string[]>().notNull().default([]),
  colors: jsonb("colors").$type<{ name: string; hex: string }[]>().notNull().default([]),
  sizes: jsonb("sizes").$type<string[]>().notNull().default([]),
  tags: jsonb("tags").$type<string[]>().notNull().default([]),
  stock: integer("stock").notNull().default(0),
  stockBySize: jsonb("stock_by_size").$type<Record<string, number>>().notNull().default({ S: 0, L: 0, XL: 0, XXL: 0, "Free Size": 0 }),
  isFeatured: boolean("is_featured").default(false).notNull(),
  isTrending: boolean("is_trending").default(false).notNull(),
  rating: numeric("rating", { precision: 3, scale: 2 }).default("0"),
  reviewCount: integer("review_count").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const customers = pgTable("customers", {
  id: serial("id").primaryKey(),
  email: varchar("email", { length: 220 }).notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  firstName: varchar("first_name", { length: 120 }).notNull(),
  lastName: varchar("last_name", { length: 120 }).notNull(),
  phone: varchar("phone", { length: 40 }),
  loyaltyPoints: integer("loyalty_points").default(0).notNull(),
  isVip: boolean("is_vip").default(false).notNull(),
  newsletter: boolean("newsletter").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const addresses = pgTable("addresses", {
  id: serial("id").primaryKey(),
  customerId: integer("customer_id")
    .notNull()
    .references(() => customers.id, { onDelete: "cascade" }),
  label: varchar("label", { length: 80 }).default("Home"),
  line1: varchar("line1", { length: 220 }).notNull(),
  line2: varchar("line2", { length: 220 }),
  city: varchar("city", { length: 120 }).notNull(),
  state: varchar("state", { length: 120 }).notNull(),
  postalCode: varchar("postal_code", { length: 30 }).notNull(),
  country: varchar("country", { length: 120 }).default("India").notNull(),
  isDefault: boolean("is_default").default(false).notNull(),
});

export const wishlistItems = pgTable("wishlist_items", {
  id: serial("id").primaryKey(),
  customerId: integer("customer_id")
    .notNull()
    .references(() => customers.id, { onDelete: "cascade" }),
  productId: integer("product_id")
    .notNull()
    .references(() => products.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const cartItems = pgTable("cart_items", {
  id: serial("id").primaryKey(),
  sessionId: varchar("session_id", { length: 120 }).notNull(),
  customerId: integer("customer_id").references(() => customers.id, {
    onDelete: "set null",
  }),
  productId: integer("product_id")
    .notNull()
    .references(() => products.id, { onDelete: "cascade" }),
  quantity: integer("quantity").notNull().default(1),
  size: varchar("size", { length: 20 }),
  color: varchar("color", { length: 60 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  orderNumber: varchar("order_number", { length: 40 }).notNull().unique(),
  customerId: integer("customer_id").references(() => customers.id, {
    onDelete: "set null",
  }),
  customerEmail: varchar("customer_email", { length: 220 }).notNull(),
  customerName: varchar("customer_name", { length: 220 }).notNull(),
  status: varchar("status", { length: 50 }).default("placed").notNull(),
  subtotal: numeric("subtotal", { precision: 10, scale: 2 }).notNull(),
  shipping: numeric("shipping", { precision: 10, scale: 2 }).default("0").notNull(),
  tax: numeric("tax", { precision: 10, scale: 2 }).default("0").notNull(),
  total: numeric("total", { precision: 10, scale: 2 }).notNull(),
  shippingAddress: jsonb("shipping_address").$type<{
    line1: string;
    line2?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  }>(),
  trackingNumber: varchar("tracking_number", { length: 80 }),
  courier: varchar("courier", { length: 80 }),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const orderItems = pgTable("order_items", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id")
    .notNull()
    .references(() => orders.id, { onDelete: "cascade" }),
  productId: integer("product_id").references(() => products.id, {
    onDelete: "set null",
  }),
  productName: varchar("product_name", { length: 220 }).notNull(),
  productImage: text("product_image"),
  size: varchar("size", { length: 20 }),
  color: varchar("color", { length: 60 }),
  quantity: integer("quantity").notNull(),
  unitPrice: numeric("unit_price", { precision: 10, scale: 2 }).notNull(),
  lineTotal: numeric("line_total", { precision: 10, scale: 2 }).notNull(),
});

export const reviews = pgTable("reviews", {
  id: serial("id").primaryKey(),
  productId: integer("product_id")
    .notNull()
    .references(() => products.id, { onDelete: "cascade" }),
  customerName: varchar("customer_name", { length: 160 }).notNull(),
  rating: integer("rating").notNull(),
  title: varchar("title", { length: 200 }),
  body: text("body").notNull(),
  photoUrl: text("photo_url"),
  isVerified: boolean("is_verified").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const newsletterSubscribers = pgTable("newsletter_subscribers", {
  id: serial("id").primaryKey(),
  email: varchar("email", { length: 220 }).notNull().unique(),
  source: varchar("source", { length: 80 }).default("website"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const contactMessages = pgTable("contact_messages", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 160 }).notNull(),
  email: varchar("email", { length: 220 }).notNull(),
  phone: varchar("phone", { length: 40 }),
  subject: varchar("subject", { length: 220 }).notNull(),
  message: text("message").notNull(),
  status: varchar("status", { length: 40 }).default("new").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const leads = pgTable("leads", {
  id: serial("id").primaryKey(),
  email: varchar("email", { length: 220 }).notNull(),
  name: varchar("name", { length: 160 }),
  source: varchar("source", { length: 80 }).default("abandoned_cart").notNull(),
  status: leadStatusEnum("status").default("new").notNull(),
  cartValue: numeric("cart_value", { precision: 10, scale: 2 }),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const complaints = pgTable("complaints", {
  id: serial("id").primaryKey(),
  ticketNumber: varchar("ticket_number", { length: 40 }).notNull().unique(),
  orderId: integer("order_id").references(() => orders.id, {
    onDelete: "set null",
  }),
  customerEmail: varchar("customer_email", { length: 220 }).notNull(),
  customerName: varchar("customer_name", { length: 160 }).notNull(),
  type: varchar("type", { length: 40 }).notNull(), // return | replace | complaint
  reason: text("reason").notNull(),
  status: complaintStatusEnum("status").default("open").notNull(),
  adminNotes: text("admin_notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const pressMentions = pgTable("press_mentions", {
  id: serial("id").primaryKey(),
  outlet: varchar("outlet", { length: 120 }).notNull(),
  quote: text("quote").notNull(),
  sortOrder: integer("sort_order").default(0).notNull(),
});
