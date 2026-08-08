/**
 * Order registry + tracking.
 *
 * Shopify owns payment and fulfilment; this router keeps a local shadow record
 * so buyers (including guests) can look an order up with an order number and
 * email, and so the shop team can publish a status timeline.
 */

import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { adminProcedure, protectedProcedure, publicProcedure, router } from "../_core/trpc";
import {
  createOrder,
  findOrder,
  listAllOrders,
  listOrderEvents,
  listOrdersForUser,
  updateOrder,
} from "../fonzoDb";

const statusEnum = z.enum(["pending", "paid", "in_production", "shipped", "delivered", "cancelled"]);

export const ordersRouter = router({
  /** Called after a shopper returns from Shopify checkout. */
  register: publicProcedure
    .input(
      z.object({
        orderNumber: z.string().min(1).max(40),
        email: z.string().email().max(320),
        cartId: z.string().max(255).optional(),
        totalAmount: z.string().max(24).optional(),
        currencyCode: z.string().max(8).optional(),
        items: z
          .array(
            z.object({
              title: z.string(),
              variantTitle: z.string().optional(),
              quantity: z.number().int().positive(),
              unitPrice: z.string().optional(),
              image: z.string().optional(),
            }),
          )
          .optional(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const normalizedNumber = input.orderNumber.trim().replace(/^#/, "");
      const existing = await findOrder(normalizedNumber, input.email);
      if (existing) return { success: true, id: existing.id, alreadyRegistered: true } as const;

      const result = await createOrder({
        orderNumber: normalizedNumber,
        email: input.email.toLowerCase(),
        userId: ctx.user?.id ?? null,
        cartId: input.cartId || null,
        totalAmount: input.totalAmount || null,
        currencyCode: input.currencyCode || "THB",
        status: "paid",
        itemsJson: input.items ? JSON.stringify(input.items) : null,
      });
      return { success: true, id: result.id, alreadyRegistered: false } as const;
    }),

  /** Guest-friendly lookup: order number + email. */
  track: publicProcedure
    .input(z.object({ orderNumber: z.string().min(1).max(40), email: z.string().email().max(320) }))
    .query(async ({ input }) => {
      const order = await findOrder(input.orderNumber, input.email);
      if (!order) return null;
      const events = await listOrderEvents(order.id);
      return {
        orderNumber: order.orderNumber,
        status: order.status,
        trackingNumber: order.trackingNumber,
        carrier: order.carrier,
        note: order.note,
        totalAmount: order.totalAmount,
        currencyCode: order.currencyCode,
        createdAt: order.createdAt,
        updatedAt: order.updatedAt,
        items: order.itemsJson ? (JSON.parse(order.itemsJson) as unknown[]) : [],
        events: events.map(event => ({
          status: event.status,
          description: event.description,
          createdAt: event.createdAt,
        })),
      };
    }),

  mine: protectedProcedure.query(({ ctx }) => listOrdersForUser(ctx.user.id)),

  listAll: adminProcedure.query(() => listAllOrders()),

  setStatus: adminProcedure
    .input(
      z.object({
        id: z.number().int().positive(),
        status: statusEnum.optional(),
        trackingNumber: z.string().max(120).nullish(),
        carrier: z.string().max(80).nullish(),
        note: z.string().max(1000).nullish(),
      }),
    )
    .mutation(async ({ input }) => {
      const { id, ...patch } = input;
      if (Object.keys(patch).length === 0) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Nothing to update" });
      }
      await updateOrder(id, patch);
      return { success: true } as const;
    }),
});

