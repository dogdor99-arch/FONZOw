import { asc, eq } from "drizzle-orm";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { adminProcedure, publicProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { storagePut } from "../storage";
import { worksItems } from "../../drizzle/schema";

const worksInput = z.object({
  kind: z.enum(["event", "student"]), title: z.string().min(1).max(240), titleEn: z.string().max(240).nullish(),
  eventDate: z.string().max(120).nullish(), description: z.string().max(4000).nullish(), descriptionEn: z.string().max(4000).nullish(),
  imageUrls: z.array(z.string().max(8_000_000)).max(30).default([]), sourceUrl: z.string().url().max(1024).nullish(),
  published: z.boolean().optional(), sortOrder: z.number().int().min(-999).max(999).optional(),
});
const imageUploadInput = z.object({ base64: z.string().min(1), contentType: z.string().regex(/^image\/(jpeg|png|webp|gif)$/) });
async function conn() { const db = await getDb(); if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" }); return db; }

export const worksRouter = router({
  uploadImage: adminProcedure.input(imageUploadInput).mutation(async ({ input }) => {
    const buffer = Buffer.from(input.base64.replace(/^data:[^;]+;base64,/, ""), "base64");
    if (buffer.byteLength > 8 * 1024 * 1024) throw new TRPCError({ code: "BAD_REQUEST", message: "Image must be smaller than 8MB" });
    const ext = input.contentType.split("/")[1] === "jpeg" ? "jpg" : input.contentType.split("/")[1];
    const { url } = await storagePut(`works/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`, buffer, input.contentType);
    return { url };
  }),
  list: publicProcedure.input(z.object({ kind: z.enum(["event", "student"]).optional() }).optional()).query(async ({ input }) => {
    const db = await conn();
    const rows = input?.kind ? await db.select().from(worksItems).where(eq(worksItems.kind, input.kind)).orderBy(asc(worksItems.sortOrder), asc(worksItems.id)).limit(200) : await db.select().from(worksItems).orderBy(asc(worksItems.kind), asc(worksItems.sortOrder), asc(worksItems.id)).limit(300);
    return rows.filter(row => row.published);
  }),
  listAll: adminProcedure.query(async () => { const db = await conn(); return db.select().from(worksItems).orderBy(asc(worksItems.kind), asc(worksItems.sortOrder), asc(worksItems.id)).limit(300); }),
  create: adminProcedure.input(worksInput).mutation(async ({ input }) => { const db = await conn(); const result = await db.insert(worksItems).values({ ...input, titleEn: input.titleEn ?? null, eventDate: input.eventDate ?? null, description: input.description ?? null, descriptionEn: input.descriptionEn ?? null, sourceUrl: input.sourceUrl ?? null, published: input.published ?? true, sortOrder: input.sortOrder ?? 0 }); return { success: true, id: Number((result as unknown as { insertId?: number }).insertId ?? 0) } as const; }),
  update: adminProcedure.input(worksInput.partial().extend({ id: z.number().int().positive() })).mutation(async ({ input }) => { const db = await conn(); const { id, ...patch } = input; if (Object.keys(patch).length === 0) throw new TRPCError({ code: "BAD_REQUEST", message: "Nothing to update" }); await db.update(worksItems).set(patch).where(eq(worksItems.id, id)); return { success: true } as const; }),
  remove: adminProcedure.input(z.object({ id: z.number().int().positive() })).mutation(async ({ input }) => { const db = await conn(); await db.delete(worksItems).where(eq(worksItems.id, input.id)); return { success: true } as const; }),
});
