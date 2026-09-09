import { asc, eq } from "drizzle-orm";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { adminProcedure, publicProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { uploadImageToCloudinary } from "../cloudinary";
import { artistProfiles } from "../../drizzle/schema";

const optionalUrl = z.preprocess(value => { if (typeof value !== "string") return value; const trimmed = value.trim(); if (!trimmed) return null; try { new URL(trimmed); return trimmed; } catch { return null; } }, z.string().max(1024).nullish());
const artistInput = z.object({ name: z.string().min(1).max(180), nameEn: z.string().max(180).nullish(), role: z.string().max(240).nullish(), roleEn: z.string().max(240).nullish(), bio: z.string().max(4000).nullish(), bioEn: z.string().max(4000).nullish(), imageUrl: z.string().max(8_000_000).nullish(), collaborationImageUrl: z.string().max(8_000_000).nullish(), galleryUrls: z.array(z.string().max(8_000_000)).max(30).default([]), sourceUrl: optionalUrl, guitar: z.string().max(240).nullish(), guitarUrl: optionalUrl, published: z.boolean().optional(), sortOrder: z.number().int().min(-999).max(999).optional() });
const imageUploadInput = z.object({ base64: z.string().min(1), contentType: z.string().regex(/^image\/(jpeg|png|webp|gif)$/) });
const GUITAR_PREFIX = "__FONZO_GUITAR__";
function packGuitar(name: string | null | undefined, url: string | null | undefined) { return url ? `${GUITAR_PREFIX}${JSON.stringify({ name: name ?? "", url })}` : (name ?? null); }
function unpackArtist(row: typeof artistProfiles.$inferSelect) { const raw = row.guitar ?? ""; if (!raw.startsWith(GUITAR_PREFIX)) return { ...row, guitarUrl: null }; try { const parsed = JSON.parse(raw.slice(GUITAR_PREFIX.length)) as { name?: string; url?: string }; return { ...row, guitar: parsed.name ?? "", guitarUrl: parsed.url ?? null }; } catch { return { ...row, guitarUrl: null }; } }
async function conn() { const db = await getDb(); if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" }); return db; }

export const artistsRouter = router({
  uploadImage: adminProcedure.input(imageUploadInput).mutation(async ({ input }) => ({ url: await uploadImageToCloudinary(input.base64, input.contentType, "fonzo/artists") })),
  list: publicProcedure.query(async () => { const db = await conn(); const rows = await db.select().from(artistProfiles).where(eq(artistProfiles.published, true)).orderBy(asc(artistProfiles.sortOrder), asc(artistProfiles.id)).limit(60); return rows.map(unpackArtist); }),
  listAll: adminProcedure.query(async () => { const db = await conn(); const rows = await db.select().from(artistProfiles).orderBy(asc(artistProfiles.sortOrder), asc(artistProfiles.id)).limit(200); return rows.map(unpackArtist); }),
  create: adminProcedure.input(artistInput).mutation(async ({ input }) => { const db = await conn(); const { guitarUrl, ...rest } = input; try { const result = await db.insert(artistProfiles).values({ ...rest, nameEn: input.nameEn ?? null, role: input.role ?? null, roleEn: input.roleEn ?? null, bio: input.bio ?? null, bioEn: input.bioEn ?? null, imageUrl: input.imageUrl ?? null, collaborationImageUrl: input.collaborationImageUrl ?? null, sourceUrl: input.sourceUrl ?? null, guitar: packGuitar(input.guitar, guitarUrl) }); return { success: true, id: Number((result as unknown as { insertId?: number }).insertId ?? 0) } as const; } catch (error) { const cause = (error as { cause?: { message?: string; code?: string; errno?: number; sqlMessage?: string } }).cause; const details = cause?.sqlMessage || cause?.message || (error instanceof Error ? error.message : "Unknown database error"); throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: `Artist insert failed [${cause?.code || "DB_ERROR"}]: ${details}` }); } }),
  update: adminProcedure.input(artistInput.partial().extend({ id: z.number().int().positive() })).mutation(async ({ input }) => { const db = await conn(); const { id, guitarUrl, guitar, ...patch } = input; const dbPatch = { ...patch, ...(guitar !== undefined || guitarUrl !== undefined ? { guitar: packGuitar(guitar, guitarUrl) } : {}) }; if (Object.keys(dbPatch).length === 0) throw new TRPCError({ code: "BAD_REQUEST", message: "Nothing to update" }); await db.update(artistProfiles).set(dbPatch).where(eq(artistProfiles.id, id)); return { success: true } as const; }),
  remove: adminProcedure.input(z.object({ id: z.number().int().positive() })).mutation(async ({ input }) => { const db = await conn(); await db.delete(artistProfiles).where(eq(artistProfiles.id, input.id)); return { success: true } as const; }),
});
