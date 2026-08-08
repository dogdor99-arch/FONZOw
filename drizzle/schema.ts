import {
  boolean,
  decimal,
  index,
  int,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Contact / product enquiries submitted from the public site.
 * Mirrors the "Get In Touch" role of the legacy site, but persisted so the
 * showroom team can work through them.
 */
export const enquiries = mysqlTable("enquiries", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 160 }).notNull(),
  email: varchar("email", { length: 320 }).notNull(),
  phone: varchar("phone", { length: 40 }),
  subject: varchar("subject", { length: 240 }),
  message: text("message").notNull(),
  /** Product reference (e.g. G0126) when the enquiry came from a product page. */
  productCode: varchar("productCode", { length: 32 }),
  status: mysqlEnum("status", ["new", "in_progress", "closed"]).default("new").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Enquiry = typeof enquiries.$inferSelect;
export type InsertEnquiry = typeof enquiries.$inferInsert;

/**
 * Local shadow of a completed Shopify checkout.
 *
 * Written when a shopper returns to the site from checkout, so that order
 * lookup ("track my order") works with just an order number + email even for
 * guest checkouts.
 */
export const orders = mysqlTable(
  "orders",
  {
    id: int("id").autoincrement().primaryKey(),
    /** Human-facing order number, e.g. "1042". */
    orderNumber: varchar("orderNumber", { length: 40 }).notNull(),
    email: varchar("email", { length: 320 }).notNull(),
    /** Set when the buyer was signed in. */
    userId: int("userId"),
    cartId: varchar("cartId", { length: 255 }),
    totalAmount: decimal("totalAmount", { precision: 12, scale: 2 }),
    currencyCode: varchar("currencyCode", { length: 8 }).default("THB").notNull(),
    status: mysqlEnum("status", [
      "pending",
      "paid",
      "in_production",
      "shipped",
      "delivered",
      "cancelled",
    ])
      .default("pending")
      .notNull(),
    /** Carrier tracking code, filled in by the shop team. */
    trackingNumber: varchar("trackingNumber", { length: 120 }),
    carrier: varchar("carrier", { length: 80 }),
    note: text("note"),
    /** JSON snapshot of purchased lines, so history survives catalogue changes. */
    itemsJson: text("itemsJson"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  table => ({
    orderNumberIdx: index("orders_orderNumber_idx").on(table.orderNumber),
    emailIdx: index("orders_email_idx").on(table.email),
  }),
);

export type Order = typeof orders.$inferSelect;
export type InsertOrder = typeof orders.$inferInsert;

/** Timeline entries shown on the order-tracking page. */
export const orderEvents = mysqlTable(
  "orderEvents",
  {
    id: int("id").autoincrement().primaryKey(),
    orderId: int("orderId").notNull(),
    status: varchar("status", { length: 40 }).notNull(),
    description: varchar("description", { length: 400 }),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  table => ({
    orderIdx: index("orderEvents_orderId_idx").on(table.orderId),
  }),
);

export type OrderEvent = typeof orderEvents.$inferSelect;

/**
 * Pre-owned marketplace listings created by signed-in members.
 * Listings are member-to-member; Fonzo only hosts the space.
 */
export const listings = mysqlTable(
  "listings",
  {
    id: int("id").autoincrement().primaryKey(),
    sellerId: int("sellerId").notNull(),
    title: varchar("title", { length: 200 }).notNull(),
    description: text("description").notNull(),
    /** "sell" | "trade" | "both" — drives the badge and filters. */
    intent: mysqlEnum("intent", ["sell", "trade", "both"]).default("sell").notNull(),
    condition: mysqlEnum("condition", ["new", "mint", "excellent", "good", "fair"])
      .default("excellent")
      .notNull(),
    brand: varchar("brand", { length: 120 }),
    model: varchar("model", { length: 160 }),
    year: int("year"),
    price: decimal("price", { precision: 12, scale: 2 }),
    currencyCode: varchar("currencyCode", { length: 8 }).default("THB").notNull(),
    /** Free-text location, e.g. "กรุงเทพฯ". */
    location: varchar("location", { length: 160 }),
    contactLine: varchar("contactLine", { length: 160 }),
    contactPhone: varchar("contactPhone", { length: 40 }),
    /** JSON array of S3 image URLs. */
    imagesJson: text("imagesJson"),
    status: mysqlEnum("status", ["active", "reserved", "sold", "hidden"]).default("active").notNull(),
    viewCount: int("viewCount").default(0).notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  table => ({
    sellerIdx: index("listings_sellerId_idx").on(table.sellerId),
    statusIdx: index("listings_status_idx").on(table.status),
  }),
);

export type Listing = typeof listings.$inferSelect;
export type InsertListing = typeof listings.$inferInsert;

/** Buyer ↔ seller messages attached to a listing. */
export const listingMessages = mysqlTable(
  "listingMessages",
  {
    id: int("id").autoincrement().primaryKey(),
    listingId: int("listingId").notNull(),
    senderId: int("senderId").notNull(),
    /** Denormalised so a seller can list conversations without extra joins. */
    recipientId: int("recipientId").notNull(),
    body: text("body").notNull(),
    readAt: timestamp("readAt"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  table => ({
    listingIdx: index("listingMessages_listingId_idx").on(table.listingId),
    recipientIdx: index("listingMessages_recipientId_idx").on(table.recipientId),
  }),
);

export type ListingMessage = typeof listingMessages.$inferSelect;

/** Saved / watch-listed marketplace listings. */
export const listingFavorites = mysqlTable(
  "listingFavorites",
  {
    id: int("id").autoincrement().primaryKey(),
    listingId: int("listingId").notNull(),
    userId: int("userId").notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  table => ({
    userIdx: index("listingFavorites_userId_idx").on(table.userId),
  }),
);

/** Wishlist / "notify me" registrations for catalogue models. */
export const wishlist = mysqlTable(
  "wishlist",
  {
    id: int("id").autoincrement().primaryKey(),
    userId: int("userId").notNull(),
    /** Catalogue reference, e.g. G0126 or A0031. */
    productCode: varchar("productCode", { length: 32 }).notNull(),
    productKind: mysqlEnum("productKind", ["guitar", "accessory"]).default("guitar").notNull(),
    notify: boolean("notify").default(false).notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  table => ({
    userIdx: index("wishlist_userId_idx").on(table.userId),
  }),
);

/**
 * Curated feed of Fonzo activity across owned channels.
 *
 * Shopee, Lazada, Facebook and TikTok do not expose public read APIs for a
 * brand's own posts without an approved app, so the newsroom is editorial: the
 * shop team registers each post/listing here (URL + copy + thumbnail) and the
 * homepage renders it, embedding the live post from TikTok/Facebook/YouTube
 * where the platform supports it.
 */
export const socialPosts = mysqlTable(
  "socialPosts",
  {
    id: int("id").autoincrement().primaryKey(),
    platform: mysqlEnum("platform", [
      "shopee",
      "lazada",
      "facebook",
      "tiktok",
      "youtube",
      "instagram",
      "site",
    ]).notNull(),
    /** Short headline shown on the card. */
    title: varchar("title", { length: 240 }).notNull(),
    titleEn: varchar("titleEn", { length: 240 }),
    excerpt: text("excerpt"),
    excerptEn: text("excerptEn"),
    /** Canonical link on the source platform. */
    url: varchar("url", { length: 1024 }).notNull(),
    /** Optional thumbnail (S3 URL or remote image). */
    imageUrl: varchar("imageUrl", { length: 1024 }),
    /** Price label for marketplace listings, e.g. "฿89,000". */
    priceLabel: varchar("priceLabel", { length: 64 }),
    /** When the post went live on the source platform. */
    postedAt: timestamp("postedAt").defaultNow().notNull(),
    /** Pinned cards float to the front of the feed. */
    pinned: boolean("pinned").default(false).notNull(),
    published: boolean("published").default(true).notNull(),
    /** Manual ordering within the same pinned/published bucket. */
    sortOrder: int("sortOrder").default(0).notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  table => ({
    feedIdx: index("socialPosts_feed_idx").on(table.published, table.postedAt),
    platformIdx: index("socialPosts_platform_idx").on(table.platform),
  }),
);

export type SocialPost = typeof socialPosts.$inferSelect;
export type InsertSocialPost = typeof socialPosts.$inferInsert;
