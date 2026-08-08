/**
 * Member-to-member marketplace for pre-owned instruments.
 *
 * Listing creation, editing and messaging all require a signed-in member:
 * Fonzo only hosts the space, so every listing is attributable to a real
 * account.
 */

import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { protectedProcedure, publicProcedure, router } from "../_core/trpc";
import { storagePut } from "../storage";
import {
  createListing,
  createListingMessage,
  deleteListing,
  getListing,
  incrementListingViews,
  listConversation,
  listFavorites,
  listInbox,
  listListings,
  listListingsBySeller,
  markMessagesRead,
  toggleListingFavorite,
  updateListing,
} from "../fonzoDb";

const intentEnum = z.enum(["sell", "trade", "both"]);
const conditionEnum = z.enum(["new", "mint", "excellent", "good", "fair"]);
const statusEnum = z.enum(["active", "reserved", "sold", "hidden"]);

function parseImages(raw: string | null): string[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((v): v is string => typeof v === "string") : [];
  } catch {
    return [];
  }
}

const listingInput = z.object({
  title: z.string().min(3).max(200),
  description: z.string().min(10).max(5000),
  intent: intentEnum.default("sell"),
  condition: conditionEnum.default("excellent"),
  brand: z.string().max(120).optional(),
  model: z.string().max(160).optional(),
  year: z.number().int().min(1900).max(2100).optional(),
  price: z.number().min(0).max(99999999).optional(),
  location: z.string().max(160).optional(),
  contactLine: z.string().max(160).optional(),
  contactPhone: z.string().max(40).optional(),
  /** Data URLs or already-hosted URLs; data URLs get pushed to S3. */
  images: z.array(z.string().max(8_000_000)).max(8).optional(),
});

/** Uploads any inline data-URL images to S3 and returns public URLs. */
async function persistImages(images: string[] | undefined, ownerId: number): Promise<string[]> {
  if (!images || images.length === 0) return [];
  const urls: string[] = [];

  for (let index = 0; index < images.length; index += 1) {
    const image = images[index];
    if (!image.startsWith("data:")) {
      urls.push(image);
      continue;
    }
    const match = image.match(/^data:([^;]+);base64,(.+)$/);
    if (!match) continue;
    const [, contentType, base64] = match;
    const extension = contentType.split("/")[1]?.split("+")[0] ?? "jpg";
    const key = `marketplace/${ownerId}/${Date.now()}-${index}.${extension}`;
    const { url } = await storagePut(key, Buffer.from(base64, "base64"), contentType);
    urls.push(url);
  }
  return urls;
}

export const marketplaceRouter = router({
  list: publicProcedure
    .input(
      z
        .object({
          intent: intentEnum.optional(),
          status: statusEnum.optional(),
          limit: z.number().int().min(1).max(100).optional(),
        })
        .optional(),
    )
    .query(async ({ input }) => {
      const rows = await listListings(input ?? {});
      return rows.map(row => ({
        id: row.listing.id,
        title: row.listing.title,
        description: row.listing.description,
        intent: row.listing.intent,
        condition: row.listing.condition,
        brand: row.listing.brand,
        model: row.listing.model,
        year: row.listing.year,
        price: row.listing.price,
        currencyCode: row.listing.currencyCode,
        location: row.listing.location,
        status: row.listing.status,
        viewCount: row.listing.viewCount,
        images: parseImages(row.listing.imagesJson),
        sellerName: row.sellerName ?? "Fonzo member",
        createdAt: row.listing.createdAt,
      }));
    }),

  byId: publicProcedure
    .input(z.object({ id: z.number().int().positive() }))
    .query(async ({ input }) => {
      const row = await getListing(input.id);
      if (!row) return null;
      void incrementListingViews(input.id).catch(() => undefined);
      return {
        id: row.listing.id,
        sellerId: row.listing.sellerId,
        title: row.listing.title,
        description: row.listing.description,
        intent: row.listing.intent,
        condition: row.listing.condition,
        brand: row.listing.brand,
        model: row.listing.model,
        year: row.listing.year,
        price: row.listing.price,
        currencyCode: row.listing.currencyCode,
        location: row.listing.location,
        contactLine: row.listing.contactLine,
        contactPhone: row.listing.contactPhone,
        status: row.listing.status,
        viewCount: row.listing.viewCount,
        images: parseImages(row.listing.imagesJson),
        sellerName: row.sellerName ?? "Fonzo member",
        createdAt: row.listing.createdAt,
      };
    }),

  create: protectedProcedure.input(listingInput).mutation(async ({ input, ctx }) => {
    const imageUrls = await persistImages(input.images, ctx.user.id);
    const result = await createListing({
      sellerId: ctx.user.id,
      title: input.title,
      description: input.description,
      intent: input.intent,
      condition: input.condition,
      brand: input.brand || null,
      model: input.model || null,
      year: input.year ?? null,
      price: input.price !== undefined ? input.price.toFixed(2) : null,
      location: input.location || null,
      contactLine: input.contactLine || null,
      contactPhone: input.contactPhone || null,
      imagesJson: imageUrls.length > 0 ? JSON.stringify(imageUrls) : null,
    });
    return { success: true, id: result.id } as const;
  }),

  update: protectedProcedure
    .input(listingInput.partial().extend({ id: z.number().int().positive(), status: statusEnum.optional() }))
    .mutation(async ({ input, ctx }) => {
      const existing = await getListing(input.id);
      if (!existing) throw new TRPCError({ code: "NOT_FOUND" });
      if (existing.listing.sellerId !== ctx.user.id && ctx.user.role !== "admin") {
        throw new TRPCError({ code: "FORBIDDEN", message: "This listing belongs to another member." });
      }

      const { id, images, price, ...rest } = input;
      const patch: Record<string, unknown> = { ...rest };
      if (price !== undefined) patch.price = price.toFixed(2);
      if (images) {
        const urls = await persistImages(images, ctx.user.id);
        patch.imagesJson = urls.length > 0 ? JSON.stringify(urls) : null;
      }

      await updateListing(id, existing.listing.sellerId, patch);
      return { success: true } as const;
    }),

  remove: protectedProcedure
    .input(z.object({ id: z.number().int().positive() }))
    .mutation(async ({ input, ctx }) => {
      await deleteListing(input.id, ctx.user.id);
      return { success: true } as const;
    }),

  mine: protectedProcedure.query(async ({ ctx }) => {
    const rows = await listListingsBySeller(ctx.user.id);
    return rows.map(row => ({ ...row, images: parseImages(row.imagesJson) }));
  }),

  favorites: router({
    toggle: protectedProcedure
      .input(z.object({ listingId: z.number().int().positive() }))
      .mutation(({ input, ctx }) => toggleListingFavorite(ctx.user.id, input.listingId)),
    list: protectedProcedure.query(({ ctx }) => listFavorites(ctx.user.id)),
  }),

  messages: router({
    send: protectedProcedure
      .input(z.object({ listingId: z.number().int().positive(), body: z.string().min(1).max(2000) }))
      .mutation(async ({ input, ctx }) => {
        const listing = await getListing(input.listingId);
        if (!listing) throw new TRPCError({ code: "NOT_FOUND" });

        // Sellers reply to the buyer; buyers write to the seller.
        const isSeller = listing.listing.sellerId === ctx.user.id;
        if (isSeller) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Use the thread endpoint to reply to a specific buyer.",
          });
        }

        await createListingMessage({
          listingId: input.listingId,
          senderId: ctx.user.id,
          recipientId: listing.listing.sellerId,
          body: input.body,
        });
        return { success: true } as const;
      }),

    reply: protectedProcedure
      .input(
        z.object({
          listingId: z.number().int().positive(),
          recipientId: z.number().int().positive(),
          body: z.string().min(1).max(2000),
        }),
      )
      .mutation(async ({ input, ctx }) => {
        const listing = await getListing(input.listingId);
        if (!listing) throw new TRPCError({ code: "NOT_FOUND" });
        if (listing.listing.sellerId !== ctx.user.id) {
          throw new TRPCError({ code: "FORBIDDEN", message: "Only the seller can reply in this thread." });
        }
        await createListingMessage({
          listingId: input.listingId,
          senderId: ctx.user.id,
          recipientId: input.recipientId,
          body: input.body,
        });
        return { success: true } as const;
      }),

    thread: protectedProcedure
      .input(z.object({ listingId: z.number().int().positive(), withUserId: z.number().int().positive().optional() }))
      .query(async ({ input, ctx }) => {
        const listing = await getListing(input.listingId);
        if (!listing) return [];
        const other =
          input.withUserId ??
          (listing.listing.sellerId === ctx.user.id ? ctx.user.id : listing.listing.sellerId);

        const rows = await listConversation(input.listingId, ctx.user.id, other);
        void markMessagesRead(input.listingId, ctx.user.id).catch(() => undefined);
        return rows.map(row => ({
          id: row.message.id,
          body: row.message.body,
          senderId: row.message.senderId,
          senderName: row.senderName ?? "Fonzo member",
          createdAt: row.message.createdAt,
          mine: row.message.senderId === ctx.user.id,
        }));
      }),

    inbox: protectedProcedure.query(async ({ ctx }) => {
      const rows = await listInbox(ctx.user.id);
      return rows.map(row => ({
        id: row.message.id,
        listingId: row.message.listingId,
        listingTitle: row.listingTitle ?? "",
        body: row.message.body,
        senderId: row.message.senderId,
        senderName: row.senderName ?? "Fonzo member",
        recipientId: row.message.recipientId,
        readAt: row.message.readAt,
        createdAt: row.message.createdAt,
        mine: row.message.senderId === ctx.user.id,
      }));
    }),
  }),
});
