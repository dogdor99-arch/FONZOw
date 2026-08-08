import { describe, expect, it } from "vitest";
import { TRPCError } from "@trpc/server";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

function ctx(user?: Partial<NonNullable<TrpcContext["user"]>>): TrpcContext {
  return {
    user: user
      ? ({
          id: 1,
          openId: "test-user",
          email: "test@example.com",
          name: "Test User",
          loginMethod: "manus",
          role: "user",
          createdAt: new Date(),
          updatedAt: new Date(),
          lastSignedIn: new Date(),
          ...user,
        } as NonNullable<TrpcContext["user"]>)
      : undefined,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: () => {} } as unknown as TrpcContext["res"],
  };
}

/**
 * The marketplace is community content, so the authorisation boundary matters
 * more than the happy path: browsing is open, everything that writes or reads
 * private data requires a signed-in member.
 */
describe("marketplace authorisation", () => {
  it("allows anonymous visitors to browse listings", async () => {
    const caller = appRouter.createCaller(ctx());
    const listings = await caller.marketplace.list({});
    expect(Array.isArray(listings)).toBe(true);
  }, 30_000);

  it("rejects anonymous listing creation", async () => {
    const caller = appRouter.createCaller(ctx());

    await expect(
      caller.marketplace.create({
        title: "Anonymous listing attempt",
        intent: "sell",
        condition: "excellent",
        description: "Should never be stored.",
        images: [],
      }),
    ).rejects.toBeInstanceOf(TRPCError);
  });

  it("rejects anonymous access to private views", async () => {
    const caller = appRouter.createCaller(ctx());

    await expect(caller.marketplace.mine()).rejects.toBeInstanceOf(TRPCError);
    await expect(caller.marketplace.messages.inbox()).rejects.toBeInstanceOf(TRPCError);
  });

  it("rejects anonymous messaging", async () => {
    const caller = appRouter.createCaller(ctx());

    await expect(
      caller.marketplace.messages.send({ listingId: 1, body: "hello" }),
    ).rejects.toBeInstanceOf(TRPCError);
  });
});

describe("order tracking", () => {
  it("reports not found for an unknown order/email pair", async () => {
    const caller = appRouter.createCaller(ctx());

    const result = await caller.orders.track({
      orderNumber: "FZ-does-not-exist-000",
      email: "nobody@example.com",
    });

    expect(result).toBeNull();
  });

  it("requires admin rights to change an order status", async () => {
    const caller = appRouter.createCaller(ctx({ role: "user" }));

    await expect(
      caller.orders.setStatus({ orderId: 1, status: "shipped" }),
    ).rejects.toBeInstanceOf(TRPCError);
  });

  it("keeps the shop console data behind admin rights", async () => {
    const anonymous = appRouter.createCaller(ctx());
    const member = appRouter.createCaller(ctx({ role: "user" }));

    await expect(anonymous.orders.listAll()).rejects.toBeInstanceOf(TRPCError);
    await expect(member.orders.listAll()).rejects.toBeInstanceOf(TRPCError);
    await expect(anonymous.enquiry.list()).rejects.toBeInstanceOf(TRPCError);
    await expect(member.enquiry.list()).rejects.toBeInstanceOf(TRPCError);
  });

  it("lets an admin read orders and enquiries", async () => {
    const admin = appRouter.createCaller(ctx({ role: "admin" }));

    const [orders, enquiries] = await Promise.all([admin.orders.listAll(), admin.enquiry.list()]);

    expect(Array.isArray(orders)).toBe(true);
    expect(Array.isArray(enquiries)).toBe(true);
  }, 30_000);
});

describe("enquiries", () => {
  it("validates the contact form payload", async () => {
    const caller = appRouter.createCaller(ctx());

    await expect(
      caller.enquiry.submit({ name: "", email: "not-an-email", message: "" }),
    ).rejects.toBeTruthy();
  });
});
