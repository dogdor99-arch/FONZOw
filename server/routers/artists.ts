import { z } from "zod";
import { and, asc, eq } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { adminProcedure, publicProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { uploadImageToCloudinary } from "../cloudinary";
import { artistProfiles } from "../../drizzle/schema";

const artistInput = z.object({ name: z.string().min(1).max(180), nameEn: z.string().max(180).nullish(), role: z.string().max(240).nullish(), roleEn: z.string().max(240).nullish(), bio: z.string().max(4000).nullish(), bioEn: z.string().max(4000).nullish(), imageUrl: z.string().max(8_000_000).nullish(), collaborationImageUrl: z.string().max(8_000_000).nullish(), sourceUrl: z.string().url().max(1024).nullish(), guitar: z.string().max(240).nullish(), published: z.boolean().optional(), sortOrder: z.number().int().min(-999).max(999).optional() });
const imageUploadInput = z.object({ base64: z.string().min(1), contentType: z.string().regex(/^image\/(jpeg|png|webp|gif)$/) });
async function conn() { const db = await getDb(); if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" }); return db; }

export const artistsRouter = router({
  uploadImage: adminProcedure.input(imageUploadInput).mutation(async ({ input }) => ({ url: await uploadImageToCloudinary(input.base64, input.contentType, "fonzo/artists") })),
  list: publicProcedure.query(async () => { const db = await conn(); return db.select().from(artistProfiles).where(eq(artistProfiles.published, true)).orderBy(asc(artistProfiles.sortOrder), asc(artistProfiles.id)).limit(60); }),
  listAll: adminProcedure.query(async () => { const db = await conn(); return db.select().from(artistProfiles).orderBy(asc(artistProfiles.sortOrder), asc(artistProfiles.id)).limit(200); }),
  create: adminProcedure.input(artistInput).mutation(async ({ input }) => { const db = await conn(); const result = await db.insert(artistProfiles).values({ ...input, nameEn: input.nameEn ?? null, role: input.role ?? null, roleEn: input.roleEn ?? null, bio: input.bio ?? null, bioEn: input.bioEn ?? null, imageUrl: input.imageUrl ?? null, collaborationImageUrl: input.collaborationImageUrl ?? null, sourceUrl: input.sourceUrl ?? null, guitar: input.guitar ?? null }); return { success: true, id: Number((result as unknown as { insertId?: number }).insertId ?? 0) } as const; }),
  update: adminProcedure.input(artistInput.partial().extend({ id: z.number().int().positive() })).mutation(async ({ input }) => { const db = await conn(); const { id, ...patch } = input; if (Object.keys(patch).length === 0) throw new TRPCError({ code: "BAD_REQUEST", message: "Nothing to update" }); await db.update(artistProfiles).set(patch).where(eq(artistProfiles.id, id)); return { success: true } as const; }),
  remove: adminProcedure.input(z.object({ id: z.number().int().positive() })).mutation(async ({ input }) => { const db = await conn(); await db.delete(artistProfiles).where(eq(artistProfiles.id, input.id)); return { success: true } as const; }),
});
