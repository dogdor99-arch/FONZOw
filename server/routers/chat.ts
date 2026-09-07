import { and, asc, desc, eq } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { adminProcedure, publicProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { chatMessages, chatRooms } from "../../drizzle/schema";

const tokenInput = z.object({ token: z.string().min(24).max(96) });
const bodyInput = z.string().trim().min(1, "Message is required").max(4000);

async function dbOrThrow() {
  const db = await getDb();
  if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
  return db;
}

async function findRoom(token: string) {
  const db = await dbOrThrow();
  const rows = await db.select().from(chatRooms).where(eq(chatRooms.visitorToken, token)).limit(1);
  return rows[0];
}

export const chatRouter = router({
  room: publicProcedure.input(tokenInput).query(async ({ input }) => {
    const room = await findRoom(input.token);
    if (!room) return null;
    const db = await dbOrThrow();
    const messages = await db.select().from(chatMessages).where(eq(chatMessages.roomId, room.id)).orderBy(asc(chatMessages.createdAt));
    return { room, messages };
  }),

  start: publicProcedure.input(z.object({
    token: z.string().min(24).max(96),
    name: z.string().trim().min(1).max(160),
    email: z.string().trim().email().max(320).optional().or(z.literal("")),
    phone: z.string().trim().max(40).optional(),
  })).mutation(async ({ input }) => {
    const db = await dbOrThrow();
    const existing = await db.select().from(chatRooms).where(eq(chatRooms.visitorToken, input.token)).limit(1);
    if (existing[0]) {
      await db.update(chatRooms).set({ name: input.name, email: input.email || null, phone: input.phone || null, status: "open" }).where(eq(chatRooms.id, existing[0].id));
      return { room: { ...existing[0], name: input.name, email: input.email || null, phone: input.phone || null, status: "open" as const } };
    }
    const result = await db.insert(chatRooms).values({ visitorToken: input.token, name: input.name, email: input.email || null, phone: input.phone || null });
    const id = Number((result as unknown as { insertId?: number }).insertId ?? 0);
    const room = await db.select().from(chatRooms).where(eq(chatRooms.id, id)).limit(1);
    return { room: room[0] };
  }),

  send: publicProcedure.input(z.object({ token: z.string().min(24).max(96), body: bodyInput })).mutation(async ({ input }) => {
    const room = await findRoom(input.token);
    if (!room) throw new TRPCError({ code: "NOT_FOUND", message: "Chat room not found" });
    const db = await dbOrThrow();
    const result = await db.insert(chatMessages).values({ roomId: room.id, senderType: "visitor", body: input.body });
    await db.update(chatRooms).set({ lastMessageAt: new Date(), status: "open" }).where(eq(chatRooms.id, room.id));
    return { id: Number((result as unknown as { insertId?: number }).insertId ?? 0) };
  }),

  rooms: adminProcedure.query(async () => {
    const db = await dbOrThrow();
    return db.select().from(chatRooms).orderBy(desc(chatRooms.lastMessageAt)).limit(200);
  }),

  messages: adminProcedure.input(z.object({ roomId: z.number().int().positive() })).query(async ({ input }) => {
    const db = await dbOrThrow();
    await db.update(chatMessages).set({ readAt: new Date() }).where(and(eq(chatMessages.roomId, input.roomId), eq(chatMessages.senderType, "visitor")));
    return db.select().from(chatMessages).where(eq(chatMessages.roomId, input.roomId)).orderBy(asc(chatMessages.createdAt));
  }),

  reply: adminProcedure.input(z.object({ roomId: z.number().int().positive(), body: bodyInput })).mutation(async ({ input }) => {
    const db = await dbOrThrow();
    const room = await db.select().from(chatRooms).where(eq(chatRooms.id, input.roomId)).limit(1);
    if (!room[0]) throw new TRPCError({ code: "NOT_FOUND", message: "Chat room not found" });
    const result = await db.insert(chatMessages).values({ roomId: input.roomId, senderType: "admin", body: input.body });
    await db.update(chatRooms).set({ lastMessageAt: new Date(), status: "open" }).where(eq(chatRooms.id, input.roomId));
    return { id: Number((result as unknown as { insertId?: number }).insertId ?? 0) };
  }),

  close: adminProcedure.input(z.object({ roomId: z.number().int().positive() })).mutation(async ({ input }) => {
    const db = await dbOrThrow();
    await db.update(chatRooms).set({ status: "closed" }).where(eq(chatRooms.id, input.roomId));
    return { success: true as const };
  }),

  reopen: adminProcedure.input(z.object({ roomId: z.number().int().positive() })).mutation(async ({ input }) => {
    const db = await dbOrThrow();
    await db.update(chatRooms).set({ status: "open" }).where(eq(chatRooms.id, input.roomId));
    return { success: true as const };
  }),

  remove: adminProcedure.input(z.object({ roomId: z.number().int().positive() })).mutation(async ({ input }) => {
    const db = await dbOrThrow();
    await db.delete(chatMessages).where(eq(chatMessages.roomId, input.roomId));
    await db.delete(chatRooms).where(eq(chatRooms.id, input.roomId));
    return { success: true as const };
  }),
});
