/**
 * Newsroom router — access control and normalisation.
 *
 * The public `feed` must be readable by anonymous visitors, while every write
 * path is reserved for staff accounts. These specs pin that boundary so a later
 * refactor cannot quietly open the curation surface to the public.
 */

import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type Ctx = TrpcContext;

function makeContext(role: "anonymous" | "user" | "admin"): Ctx {
  const user =
    role === "anonymous"
      ? null
      : {
          id: role === "admin" ? 1 : 2,
          openId: role === "admin" ? "staff-open-id" : "visitor-open-id",
          email: `${role}@example.com`,
          name: role === "admin" ? "Staff" : "Visitor",
          loginMethod: "manus",
          role: role === "admin" ? ("admin" as const) : ("user" as const),
          createdAt: new Date(),
          updatedAt: new Date(),
          lastSignedIn: new Date(),
        };

  return {
    user,
    req: { protocol: "https", headers: {} },
    res: { clearCookie: () => {}, cookie: () => {} },
  } as unknown as Ctx;
}

describe("newsroom.feed", () => {
  it("is readable without signing in", async () => {
    const caller = appRouter.createCaller(makeContext("anonymous"));
    const posts = await caller.newsroom.feed({ limit: 6 });

    expect(Array.isArray(posts)).toBe(true);
    for (const post of posts) {
      expect(typeof post.id).toBe("number");
      expect(typeof post.platform).toBe("string");
      expect(typeof post.title).toBe("string");
    }
  }, 30_000);

  it("never returns unpublished posts to visitors", async () => {
    const caller = appRouter.createCaller(makeContext("anonymous"));
    const posts = await caller.newsroom.feed({});

    expect(posts.every(post => post.published)).toBe(true);
  }, 30_000);
});

describe("newsroom write access", () => {
  it("rejects anonymous visitors creating a post", async () => {
    const caller = appRouter.createCaller(makeContext("anonymous"));

    await expect(
      caller.newsroom.create({
        platform: "tiktok",
        title: "Unauthorised",
        url: "https://www.tiktok.com/@fonzoguitaroffical",
      }),
    ).rejects.toThrow();
  }, 30_000);

  it("rejects signed-in non-staff accounts creating a post", async () => {
    const caller = appRouter.createCaller(makeContext("user"));

    await expect(
      caller.newsroom.create({
        platform: "facebook",
        title: "Unauthorised",
        url: "https://www.facebook.com/Fonzoguitar/",
      }),
    ).rejects.toThrow();
  }, 30_000);

  it("rejects non-staff accounts listing every post", async () => {
    const caller = appRouter.createCaller(makeContext("user"));

    await expect(caller.newsroom.listAll()).rejects.toThrow();
  }, 30_000);

  it("rejects non-staff accounts removing a post", async () => {
    const caller = appRouter.createCaller(makeContext("user"));

    await expect(caller.newsroom.remove({ id: 1 })).rejects.toThrow();
  }, 30_000);
});
