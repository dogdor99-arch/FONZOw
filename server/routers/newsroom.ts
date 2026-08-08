/**
 * Newsroom — the editorial feed of Fonzo activity across owned channels.
 *
 * Public reads are open; every write is behind `adminProcedure` so only the shop
 * team can curate what appears on the homepage.
 */

import { z } from "zod";
import { and, desc, eq } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { adminProcedure, publicProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { socialPosts } from "../../drizzle/schema";

const platformEnum = z.enum([
  "shopee",
  "lazada",
  "facebook",
  "tiktok",
  "youtube",
  "instagram",
  "site",
]);

const postInput = z.object({
  platform: platformEnum,
  title: z.string().min(1).max(240),
  titleEn: z.string().max(240).nullish(),
  excerpt: z.string().max(2000).nullish(),
  excerptEn: z.string().max(2000).nullish(),
  url: z.string().url().max(1024),
  imageUrl: z.string().url().max(1024).nullish(),
  priceLabel: z.string().max(64).nullish(),
  postedAt: z.date().optional(),
  pinned: z.boolean().optional(),
  published: z.boolean().optional(),
  sortOrder: z.number().int().min(-999).max(999).optional(),
});

async function conn() {
  const db = await getDb();
  if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
  return db;
}

export const newsroomRouter = router({
  /** Homepage feed: published posts, pinned first, newest first. */
  feed: publicProcedure
    .input(
      z
        .object({
          platform: platformEnum.optional(),
          limit: z.number().int().min(1).max(60).default(24),
        })
        .optional(),
    )
    .query(async ({ input }) => {
      const db = await conn();
      const limit = input?.limit ?? 24;
      const where = input?.platform
        ? and(eq(socialPosts.published, true), eq(socialPosts.platform, input.platform))
        : eq(socialPosts.published, true);

      return db
        .select()
        .from(socialPosts)
        .where(where)
        .orderBy(desc(socialPosts.pinned), desc(socialPosts.postedAt), desc(socialPosts.id))
        .limit(limit);
    }),

  /** Admin view includes unpublished drafts. */
  listAll: adminProcedure.query(async () => {
    const db = await conn();
    return db
      .select()
      .from(socialPosts)
      .orderBy(desc(socialPosts.pinned), desc(socialPosts.postedAt), desc(socialPosts.id))
      .limit(200);
  }),

  create: adminProcedure.input(postInput).mutation(async ({ input }) => {
    const db = await conn();
    const result = await db.insert(socialPosts).values({
      ...input,
      titleEn: input.titleEn ?? null,
      excerpt: input.excerpt ?? null,
      excerptEn: input.excerptEn ?? null,
      imageUrl: input.imageUrl ?? null,
      priceLabel: input.priceLabel ?? null,
      postedAt: input.postedAt ?? new Date(),
    });
    return {
      success: true,
      id: Number((result as unknown as { insertId?: number }).insertId ?? 0),
    } as const;
  }),

  update: adminProcedure
    .input(postInput.partial().extend({ id: z.number().int().positive() }))
    .mutation(async ({ input }) => {
      const db = await conn();
      const { id, ...patch } = input;
      if (Object.keys(patch).length === 0) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Nothing to update" });
      }
      await db.update(socialPosts).set(patch).where(eq(socialPosts.id, id));
      return { success: true } as const;
    }),

  remove: adminProcedure
    .input(z.object({ id: z.number().int().positive() }))
    .mutation(async ({ input }) => {
      const db = await conn();
      await db.delete(socialPosts).where(eq(socialPosts.id, input.id));
      return { success: true } as const;
    }),
});
