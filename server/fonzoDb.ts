/**
 * Query helpers for the Fonzo-specific tables (enquiries, orders, marketplace).
 *
 * Every helper returns raw Drizzle rows; shaping for the client happens in the
 * routers. All of them tolerate a missing database so local tooling can still
 * boot.
 */

import { and, desc, eq, inArray, or, sql } from "drizzle-orm";
import {
  enquiries,
  listingFavorites,
  listingMessages,
  listings,
  orderEvents,
  orders,
  users,
  wishlist,
  type InsertEnquiry,
  type InsertListing,
  type InsertOrder,
} from "../drizzle/schema";
import { getDb } from "./db";

async function db() {
  const instance = await getDb();
  if (!instance) throw new Error("Database is not available");
  return instance;
}

/* ------------------------------- Enquiries ------------------------------- */

export async function createEnquiry(input: InsertEnquiry) {
  const conn = await db();
  const result = await conn.insert(enquiries).values(input);
  return { id: Number((result as unknown as { insertId?: number }).insertId ?? 0) };
}

export async function listEnquiries(limit = 100) {
  const conn = await db();
  return conn.select().from(enquiries).orderBy(desc(enquiries.createdAt)).limit(limit);
}

export async function updateEnquiryStatus(id: number, status: "new" | "in_progress" | "closed") {
  const conn = await db();
  await conn.update(enquiries).set({ status }).where(eq(enquiries.id, id));
}

/* --------------------------------- Orders -------------------------------- */

export async function createOrder(input: InsertOrder) {
  const conn = await db();
  const result = await conn.insert(orders).values(input);
  const id = Number((result as unknown as { insertId?: number }).insertId ?? 0);
  if (id) {
    await conn.insert(orderEvents).values({
      orderId: id,
      status: input.status ?? "pending",
      description: "Order received",
    });
  }
  return { id };
}

export async function findOrder(orderNumber: string, email: string) {
  const conn = await db();
  const rows = await conn
    .select()
    .from(orders)
    .where(
      and(
        eq(orders.orderNumber, orderNumber.trim().replace(/^#/, "")),
        eq(orders.email, email.trim().toLowerCase()),
      ),
    )
    .limit(1);
  return rows[0];
}

export async function listOrderEvents(orderId: number) {
  const conn = await db();
  return conn
    .select()
    .from(orderEvents)
    .where(eq(orderEvents.orderId, orderId))
    .orderBy(orderEvents.createdAt);
}

export async function listOrdersForUser(userId: number) {
  const conn = await db();
  return conn.select().from(orders).where(eq(orders.userId, userId)).orderBy(desc(orders.createdAt));
}

export async function listAllOrders(limit = 200) {
  const conn = await db();
  return conn.select().from(orders).orderBy(desc(orders.createdAt)).limit(limit);
}

export async function updateOrder(
  id: number,
  patch: {
    status?: "pending" | "paid" | "in_production" | "shipped" | "delivered" | "cancelled";
    trackingNumber?: string | null;
    carrier?: string | null;
    note?: string | null;
  },
) {
  const conn = await db();
  await conn.update(orders).set(patch).where(eq(orders.id, id));
  if (patch.status) {
    await conn.insert(orderEvents).values({
      orderId: id,
      status: patch.status,
      description: patch.note ?? null,
    });
  }
}

/* ------------------------------ Marketplace ------------------------------ */

export async function createListing(input: InsertListing) {
  const conn = await db();
  const result = await conn.insert(listings).values(input);
  return { id: Number((result as unknown as { insertId?: number }).insertId ?? 0) };
}

export async function listListings(options: {
  status?: "active" | "reserved" | "sold" | "hidden";
  intent?: "sell" | "trade" | "both";
  limit?: number;
}) {
  const conn = await db();
  const conditions = [];
  if (options.status) conditions.push(eq(listings.status, options.status));
  else conditions.push(inArray(listings.status, ["active", "reserved"]));
  if (options.intent) {
    conditions.push(
      options.intent === "both"
        ? eq(listings.intent, "both")
        : or(eq(listings.intent, options.intent), eq(listings.intent, "both"))!,
    );
  }

  return conn
    .select({
      listing: listings,
      sellerName: users.name,
    })
    .from(listings)
    .leftJoin(users, eq(users.id, listings.sellerId))
    .where(and(...conditions))
    .orderBy(desc(listings.createdAt))
    .limit(options.limit ?? 100);
}

export async function getListing(id: number) {
  const conn = await db();
  const rows = await conn
    .select({ listing: listings, sellerName: users.name, sellerOpenId: users.openId })
    .from(listings)
    .leftJoin(users, eq(users.id, listings.sellerId))
    .where(eq(listings.id, id))
    .limit(1);
  return rows[0];
}

export async function incrementListingViews(id: number) {
  const conn = await db();
  await conn
    .update(listings)
    .set({ viewCount: sql`${listings.viewCount} + 1` })
    .where(eq(listings.id, id));
}

export async function listListingsBySeller(sellerId: number) {
  const conn = await db();
  return conn
    .select()
    .from(listings)
    .where(eq(listings.sellerId, sellerId))
    .orderBy(desc(listings.createdAt));
}

export async function updateListing(
  id: number,
  sellerId: number,
  patch: Partial<InsertListing>,
) {
  const conn = await db();
  await conn
    .update(listings)
    .set(patch)
    .where(and(eq(listings.id, id), eq(listings.sellerId, sellerId)));
}

export async function deleteListing(id: number, sellerId: number) {
  const conn = await db();
  await conn.delete(listings).where(and(eq(listings.id, id), eq(listings.sellerId, sellerId)));
}

/* -------------------------- Listing conversations ------------------------ */

export async function createListingMessage(input: {
  listingId: number;
  senderId: number;
  recipientId: number;
  body: string;
}) {
  const conn = await db();
  const result = await conn.insert(listingMessages).values(input);
  return { id: Number((result as unknown as { insertId?: number }).insertId ?? 0) };
}

/** Messages exchanged between two members on one listing. */
export async function listConversation(listingId: number, userA: number, userB: number) {
  const conn = await db();
  return conn
    .select({ message: listingMessages, senderName: users.name })
    .from(listingMessages)
    .leftJoin(users, eq(users.id, listingMessages.senderId))
    .where(
      and(
        eq(listingMessages.listingId, listingId),
        or(
          and(eq(listingMessages.senderId, userA), eq(listingMessages.recipientId, userB)),
          and(eq(listingMessages.senderId, userB), eq(listingMessages.recipientId, userA)),
        )!,
      ),
    )
    .orderBy(listingMessages.createdAt);
}

/** Inbox: every message where the user is sender or recipient. */
export async function listInbox(userId: number) {
  const conn = await db();
  return conn
    .select({ message: listingMessages, listingTitle: listings.title, senderName: users.name })
    .from(listingMessages)
    .leftJoin(listings, eq(listings.id, listingMessages.listingId))
    .leftJoin(users, eq(users.id, listingMessages.senderId))
    .where(or(eq(listingMessages.senderId, userId), eq(listingMessages.recipientId, userId)))
    .orderBy(desc(listingMessages.createdAt))
    .limit(200);
}

export async function markMessagesRead(listingId: number, recipientId: number) {
  const conn = await db();
  await conn
    .update(listingMessages)
    .set({ readAt: new Date() })
    .where(
      and(eq(listingMessages.listingId, listingId), eq(listingMessages.recipientId, recipientId)),
    );
}

/* -------------------------------- Wishlist ------------------------------- */

export async function toggleWishlist(userId: number, productCode: string, kind: "guitar" | "accessory") {
  const conn = await db();
  const existing = await conn
    .select()
    .from(wishlist)
    .where(and(eq(wishlist.userId, userId), eq(wishlist.productCode, productCode)))
    .limit(1);

  if (existing.length > 0) {
    await conn.delete(wishlist).where(eq(wishlist.id, existing[0].id));
    return { saved: false };
  }
  await conn.insert(wishlist).values({ userId, productCode, productKind: kind });
  return { saved: true };
}

export async function listWishlist(userId: number) {
  const conn = await db();
  return conn.select().from(wishlist).where(eq(wishlist.userId, userId));
}

/* ------------------------------- Favourites ------------------------------ */

export async function toggleListingFavorite(userId: number, listingId: number) {
  const conn = await db();
  const existing = await conn
    .select()
    .from(listingFavorites)
    .where(and(eq(listingFavorites.userId, userId), eq(listingFavorites.listingId, listingId)))
    .limit(1);

  if (existing.length > 0) {
    await conn.delete(listingFavorites).where(eq(listingFavorites.id, existing[0].id));
    return { saved: false };
  }
  await conn.insert(listingFavorites).values({ userId, listingId });
  return { saved: true };
}

export async function listFavorites(userId: number) {
  const conn = await db();
  return conn.select().from(listingFavorites).where(eq(listingFavorites.userId, userId));
}
