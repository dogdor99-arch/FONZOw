/**
 * Social feed API.
 *
 * The homepage grid needs one thing: a list of tiles with an image, a caption and
 * a permalink. Those come from two sources, merged here:
 *
 * - **Curated posts** stored in `socialPosts` (the /admin panel). Their thumbnail
 *   is resolved live from the provider, so when Fonzo swaps a Reel's cover image
 *   the site follows without anyone touching the database.
 * - **Connected accounts** via Instagram Graph / Facebook Page API, active only
 *   when the matching token is configured. This is the true "latest feed" tier.
 *
 * Resolution failures never fail the request: a tile without a thumbnail still
 * renders as a typographic card that links out.
 */

import { z } from "zod";
import { and, desc, eq, inArray } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { adminProcedure, publicProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { socialPosts } from "../../drizzle/schema";
import {
  detectPlatform,
  normaliseUrl,
  resolveSocialPost,
  socialTokenStatus,
  type SocialPlatform,
} from "../_core/socialOembed";
import { socialMediaProxyUrl } from "../_core/socialMedia";

const feedPlatforms = ["instagram", "tiktok", "facebook", "youtube"] as const;

export type SocialTile = {
  id: string;
  platform: SocialPlatform;
  url: string;
  title: string | null;
  /** Same-origin thumbnail URL, or null when nothing could be resolved. */
  image: string | null;
  authorName: string | null;
  isVideo: boolean;
  postedAt: Date | null;
  pinned: boolean;
  /** True when the tile came from a connected account rather than curation. */
  live: boolean;
};

async function conn() {
  const db = await getDb();
  if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
  return db;
}

/** Instagram Graph: newest media for the connected business account. */
async function instagramLiveMedia(limit: number): Promise<SocialTile[]> {
  const token = process.env.IG_ACCESS_TOKEN;
  const userId = process.env.IG_USER_ID || "me";
  if (!token) return [];

  try {
    const fields = "id,caption,media_type,media_url,permalink,thumbnail_url,timestamp";
    const response = await fetch(
      `https://graph.facebook.com/v21.0/${userId}/media?fields=${fields}&limit=${limit}&access_token=${token}`,
    );
    if (!response.ok) return [];
    const payload = (await response.json()) as {
      data?: Array<{
        id: string;
        caption?: string;
        media_type?: string;
        media_url?: string;
        permalink?: string;
        thumbnail_url?: string;
        timestamp?: string;
      }>;
    };

    return (payload.data ?? [])
      .filter(item => item.permalink)
      .map(item => ({
        id: `ig-${item.id}`,
        platform: "instagram" as const,
        url: item.permalink!,
        title: item.caption?.replace(/\s+/g, " ").trim().slice(0, 180) || null,
        image: socialMediaProxyUrl(item.thumbnail_url || item.media_url || null),
        authorName: "Fonzo Guitar",
        isVideo: item.media_type === "VIDEO",
        postedAt: item.timestamp ? new Date(item.timestamp) : null,
        pinned: false,
        live: true,
      }));
  } catch {
    return [];
  }
}

/** Facebook Page: newest photos posted by the page. */
async function facebookLiveMedia(limit: number): Promise<SocialTile[]> {
  const token = process.env.FB_PAGE_ACCESS_TOKEN;
  const pageId = process.env.FB_PAGE_ID;
  if (!token || !pageId) return [];

  try {
    const fields = "id,message,full_picture,permalink_url,created_time,attachments{media_type}";
    const response = await fetch(
      `https://graph.facebook.com/v21.0/${pageId}/posts?fields=${fields}&limit=${limit}&access_token=${token}`,
    );
    if (!response.ok) return [];
    const payload = (await response.json()) as {
      data?: Array<{
        id: string;
        message?: string;
        full_picture?: string;
        permalink_url?: string;
        created_time?: string;
        attachments?: { data?: Array<{ media_type?: string }> };
      }>;
    };

    return (payload.data ?? [])
      .filter(item => item.permalink_url && item.full_picture)
      .map(item => ({
        id: `fb-${item.id}`,
        platform: "facebook" as const,
        url: item.permalink_url!,
        title: item.message?.replace(/\s+/g, " ").trim().slice(0, 180) || null,
        image: socialMediaProxyUrl(item.full_picture ?? null),
        authorName: "Fonzo Guitar",
        isVideo: item.attachments?.data?.[0]?.media_type === "video",
        postedAt: item.created_time ? new Date(item.created_time) : null,
        pinned: false,
        live: true,
      }));
  } catch {
    return [];
  }
}

export const socialRouter = router({
  /** Which credentialed integrations are wired up — drives the admin hint copy. */
  status: publicProcedure.query(() => socialTokenStatus()),

  /**
   * The image grid. Curated posts first (pinned, then newest), with live account
   * media appended when tokens exist. Duplicated permalinks are collapsed.
   */
  feed: publicProcedure
    .input(
      z
        .object({
          platform: z.enum(feedPlatforms).optional(),
          limit: z.number().int().min(1).max(48).default(18),
        })
        .optional(),
    )
    .query(async ({ input }) => {
      const limit = input?.limit ?? 18;
      const db = await conn();

      const where = input?.platform
        ? and(eq(socialPosts.published, true), eq(socialPosts.platform, input.platform))
        : and(eq(socialPosts.published, true), inArray(socialPosts.platform, [...feedPlatforms]));

      const rows = await db
        .select()
        .from(socialPosts)
        .where(where)
        .orderBy(desc(socialPosts.pinned), desc(socialPosts.postedAt), desc(socialPosts.id))
        .limit(limit);

      const curated: SocialTile[] = await Promise.all(
        rows.map(async row => {
          // A stored imageUrl wins: the team may have picked a better still.
          let image = row.imageUrl ? socialMediaProxyUrl(row.imageUrl) : null;
          let title = row.title;
          let author: string | null = null;
          let isVideo = false;

          const resolved = await resolveSocialPost(row.url).catch(() => null);
          if (resolved) {
            if (!image) image = socialMediaProxyUrl(resolved.thumbnailUrl);
            if (!title) title = resolved.title ?? row.title;
            author = resolved.authorName;
            isVideo = resolved.isVideo;
          }

          return {
            id: `post-${row.id}`,
            platform: row.platform as SocialPlatform,
            url: row.url,
            title,
            image,
            authorName: author,
            isVideo,
            postedAt: row.postedAt ?? null,
            pinned: Boolean(row.pinned),
            live: false,
          };
        }),
      );

      const live = input?.platform
        ? input.platform === "instagram"
          ? await instagramLiveMedia(limit)
          : input.platform === "facebook"
            ? await facebookLiveMedia(limit)
            : []
        : [...(await instagramLiveMedia(limit)), ...(await facebookLiveMedia(limit))];

      const seen = new Set(curated.map(tile => normaliseUrl(tile.url)));
      const merged = [...curated];
      for (const tile of live) {
        const key = normaliseUrl(tile.url);
        if (seen.has(key)) continue;
        seen.add(key);
        merged.push(tile);
      }

      // Pinned curation stays on top; everything else is chronological.
      merged.sort((a, b) => {
        if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
        return (b.postedAt?.getTime() ?? 0) - (a.postedAt?.getTime() ?? 0);
      });

      return merged.slice(0, limit);
    }),

  /**
   * Admin helper: paste a post URL, get back what the site would show. Lets the
   * team confirm a link resolves before saving it.
   */
  preview: adminProcedure
    .input(z.object({ url: z.string().url().max(1024) }))
    .mutation(async ({ input }) => {
      const resolved = await resolveSocialPost(input.url);
      return {
        platform: resolved.platform,
        url: resolved.url,
        title: resolved.title,
        authorName: resolved.authorName,
        image: socialMediaProxyUrl(resolved.thumbnailUrl),
        isVideo: resolved.isVideo,
        source: resolved.source,
      };
    }),

  /** Classifies a URL without any network call — used by the admin form. */
  detect: adminProcedure
    .input(z.object({ url: z.string().min(4).max(1024) }))
    .query(({ input }) => ({
      platform: detectPlatform(input.url),
      url: normaliseUrl(input.url),
    })),
});
