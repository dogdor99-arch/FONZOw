/**
 * Social image wall — the latest visuals from Fonzo's Instagram, TikTok,
 * Facebook and YouTube in a single mosaic.
 *
 * Thumbnails come from `social.feed`, which resolves each permalink live via
 * provider oEmbed / Open Graph and proxies the image through this origin. That
 * means when Fonzo changes a Reel cover the wall follows without a code change,
 * and no platform CDN token ever reaches the browser.
 *
 * Clicking a tile opens the official embed in a lightbox rather than navigating
 * away, so visitors keep their place in the page; the permalink stays available
 * for people who want the full post.
 */

import { useEffect, useMemo, useState } from "react";
import { ArrowUpRight, Play, X } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useLocale } from "@/contexts/LocaleContext";
import { CHANNELS } from "@/lib/brand";
import { CHANNEL_TINT, ChannelIcon } from "./ChannelIcon";
import { PostEmbed, isEmbeddable } from "./PostEmbed";
import { Reveal } from "./Reveal";
import { cn } from "@/lib/utils";

/** Only the visual platforms belong on the wall; marketplaces have their own strip. */
const WALL_PLATFORMS = ["instagram", "tiktok", "facebook", "youtube"] as const;
type WallPlatform = (typeof WALL_PLATFORMS)[number];
type Filter = "all" | WallPlatform;

type Tile = {
  id: string;
  platform: string;
  url: string;
  title: string | null;
  image: string | null;
  authorName: string | null;
  isVideo: boolean;
  postedAt: Date | null;
  pinned: boolean;
  live: boolean;
};

export function SocialGrid({
  limit = 12,
  heading = true,
  index,
  className,
}: {
  limit?: number;
  /** Set false when the parent already renders a section heading. */
  heading?: boolean;
  /** Chapter number shown beside the eyebrow, matching the homepage sequence. */
  index?: string;
  className?: string;
}) {
  const { locale, t } = useLocale();
  const [filter, setFilter] = useState<Filter>("all");
  const [active, setActive] = useState<Tile | null>(null);

  const input = useMemo(() => ({ limit }), [limit]);
  const { data: tiles = [], isLoading } = trpc.social.feed.useQuery(input, {
    staleTime: 5 * 60 * 1000,
  });

  const present = useMemo(() => {
    const set = new Set(tiles.map(tile => tile.platform));
    return WALL_PLATFORMS.filter(platform => set.has(platform));
  }, [tiles]);

  const visible = useMemo(
    () => (filter === "all" ? tiles : tiles.filter(tile => tile.platform === filter)),
    [tiles, filter],
  );

  // Escape closes the lightbox; body scroll is locked while it is open.
  useEffect(() => {
    if (!active) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setActive(null);
    };
    window.addEventListener("keydown", onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = previous;
    };
  }, [active]);

  const channelName = (platform: string) =>
    CHANNELS.find(channel => channel.key === platform)?.name ?? platform;

  return (
    <section id="social" className={cn("mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-10", className)}>
      {heading && (
        <Reveal>
          <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              {index && <span className="section-index">{index}</span>}
              <p className="eyebrow inline-flex items-center gap-2">
                <span className="relative inline-flex h-1.5 w-1.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand/60" />
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-brand" />
                </span>
                {t("ฟีดล่าสุด", "Live feed")}
              </p>
              <h2 className="mt-3 text-3xl leading-tight sm:text-4xl">
                {t("ภาพล่าสุดจากช่องทางของ Fonzo", "The latest from Fonzo's channels")}
              </h2>
              <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground">
                {t(
                  "ภาพและคลิปดึงสดจาก Instagram, TikTok, Facebook และ YouTube ของเรา แตะเพื่อดูโพสต์เต็ม",
                  "Images and clips pulled live from our Instagram, TikTok, Facebook and YouTube. Tap to open the full post.",
                )}
              </p>
            </div>

            <div className="flex flex-wrap gap-1.5">
              {present.length > 1 && (
                <FilterChip active={filter === "all"} onClick={() => setFilter("all")}>
                  {t("ทั้งหมด", "All")}
                </FilterChip>
              )}
              {present.map(platform => (
                <FilterChip
                  key={platform}
                  active={filter === platform}
                  onClick={() => setFilter(platform)}>
                  <ChannelIcon channel={platform} className="h-3 w-3" />
                  {channelName(platform)}
                </FilterChip>
              ))}
            </div>
          </div>
        </Reveal>
      )}

      {isLoading ? (
        <div className="mt-10 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4 lg:gap-3">
          {Array.from({ length: 8 }).map((_, index) => (
            <div key={index} className="aspect-square animate-pulse bg-secondary/70" />
          ))}
        </div>
      ) : visible.length === 0 ? (
        <EmptyWall />
      ) : (
        <div className="mt-10 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4 lg:gap-3">
          {visible.map((tile, index) => (
            <Reveal key={tile.id} delay={Math.min(index, 8) * 40}>
              <SocialTile
                tile={tile as Tile}
                label={channelName(tile.platform)}
                onOpen={() => setActive(tile as Tile)}
              />
            </Reveal>
          ))}
        </div>
      )}

      {/* Follow row keeps the wall actionable even when a visitor wants the source. */}
      <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3">
        <span className="text-[11px] tracking-[0.16em] text-muted-foreground uppercase">
          {t("ติดตามเรา", "Follow us")}
        </span>
        {CHANNELS.filter(channel =>
          (WALL_PLATFORMS as readonly string[]).includes(channel.key),
        ).map(channel => (
          <a
            key={channel.key}
            href={channel.url}
            target="_blank"
            rel="noreferrer"
            className="press inline-flex items-center gap-2 text-[11px] tracking-[0.14em] uppercase transition-colors duration-200 hover:text-brand">
            <span style={{ color: CHANNEL_TINT[channel.key] }}>
              <ChannelIcon channel={channel.key} className="h-3.5 w-3.5" />
            </span>
            {channel.name}
          </a>
        ))}
      </div>

      {active && (
        <Lightbox
          tile={active}
          label={channelName(active.platform)}
          locale={locale}
          onClose={() => setActive(null)}
        />
      )}
    </section>
  );
}

function SocialTile({
  tile,
  label,
  onOpen,
}: {
  tile: Tile;
  label: string;
  onOpen: () => void;
}) {
  const { t } = useLocale();
  const [failed, setFailed] = useState(false);
  const canEmbed = isEmbeddable(tile.platform, tile.url);
  const showImage = tile.image && !failed;

  const content = (
    <>
      {showImage ? (
        <img
          src={tile.image!}
          alt={tile.title ?? label}
          loading="lazy"
          onError={() => setFailed(true)}
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center bg-secondary/60">
          <span style={{ color: CHANNEL_TINT[tile.platform] }}>
            <ChannelIcon channel={tile.platform} className="h-10 w-10 opacity-25" />
          </span>
        </div>
      )}

      {/* Caption veil: only paints on hover so the mosaic stays clean at rest. */}
      <div className="absolute inset-0 bg-gradient-to-t from-ink/85 via-ink/15 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

      <span
        className="absolute top-2.5 left-2.5 flex h-7 w-7 items-center justify-center bg-background/90 backdrop-blur-sm"
        style={{ color: CHANNEL_TINT[tile.platform] }}>
        <ChannelIcon channel={tile.platform} className="h-3.5 w-3.5" />
      </span>

      {tile.isVideo && (
        <span className="absolute top-2.5 right-2.5 flex h-7 w-7 items-center justify-center bg-ink/70 text-cream backdrop-blur-sm">
          <Play className="h-3 w-3 fill-current" strokeWidth={0} />
        </span>
      )}

      {tile.title && (
        <p className="absolute inset-x-3 bottom-3 line-clamp-3 text-[11px] leading-relaxed text-cream opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          {tile.title}
        </p>
      )}
    </>
  );

  // Embeddable posts open in place; the rest go straight to the source.
  return canEmbed ? (
    <button
      type="button"
      onClick={onOpen}
      aria-label={tile.title ?? t("ดูโพสต์", "View post")}
      className="press group relative block aspect-square w-full overflow-hidden bg-secondary/60 focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:outline-none">
      {content}
    </button>
  ) : (
    <a
      href={tile.url}
      target="_blank"
      rel="noreferrer"
      aria-label={tile.title ?? t("เปิดโพสต์", "Open post")}
      className="press group relative block aspect-square w-full overflow-hidden bg-secondary/60 focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:outline-none">
      {content}
    </a>
  );
}

function Lightbox({
  tile,
  label,
  locale,
  onClose,
}: {
  tile: Tile;
  label: string;
  locale: "th" | "en";
  onClose: () => void;
}) {
  const { t } = useLocale();
  const posted = tile.postedAt
    ? new Date(tile.postedAt).toLocaleDateString(locale === "th" ? "th-TH" : "en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={label}
      onClick={onClose}
      className="fixed inset-0 z-100 flex items-center justify-center bg-ink/92 p-4 backdrop-blur-sm">
      <div
        onClick={event => event.stopPropagation()}
        className="flex max-h-full w-full max-w-lg flex-col overflow-hidden bg-background">
        <div className="flex items-center justify-between gap-3 border-b border-border/70 px-4 py-3">
          <div className="flex items-center gap-2 text-[11px] tracking-[0.14em] uppercase">
            <span style={{ color: CHANNEL_TINT[tile.platform] }}>
              <ChannelIcon channel={tile.platform} className="h-3.5 w-3.5" />
            </span>
            <span className="text-foreground/75">{tile.authorName ?? label}</span>
            {posted && (
              <>
                <span className="text-muted-foreground/60">·</span>
                <span className="text-muted-foreground normal-case">{posted}</span>
              </>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label={t("ปิด", "Close")}
            className="press text-muted-foreground transition-colors hover:text-brand">
            <X className="h-4 w-4" strokeWidth={1.8} />
          </button>
        </div>

        <div className="overflow-y-auto">
          <PostEmbed platform={tile.platform} url={tile.url} />
        </div>

        <div className="flex items-center justify-between gap-3 border-t border-border/70 px-4 py-3">
          <p className="line-clamp-2 text-xs leading-relaxed text-muted-foreground">
            {tile.title ?? ""}
          </p>
          <a
            href={tile.url}
            target="_blank"
            rel="noreferrer"
            className="press inline-flex shrink-0 items-center gap-1.5 text-[11px] tracking-[0.14em] text-brand uppercase hover:underline">
            {t("เปิดในแอป", "Open in app")}
            <ArrowUpRight className="h-3.5 w-3.5" strokeWidth={1.8} />
          </a>
        </div>
      </div>
    </div>
  );
}

function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "press inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-[11px] tracking-[0.12em] uppercase transition-colors duration-200",
        active
          ? "border-brand bg-brand text-brand-foreground"
          : "border-border text-muted-foreground hover:border-brand/40 hover:text-brand",
      )}>
      {children}
    </button>
  );
}

function EmptyWall() {
  const { t } = useLocale();
  return (
    <div className="mt-10 border border-dashed border-border bg-cream/40 px-6 py-14 text-center">
      <p className="text-sm text-muted-foreground">
        {t(
          "ยังไม่มีโพสต์ในฟีด — เพิ่มลิงก์โพสต์จาก Instagram, TikTok หรือ Facebook ได้ที่หน้าจัดการร้าน",
          "The feed is empty — add Instagram, TikTok or Facebook post links from the shop console.",
        )}
      </p>
    </div>
  );
}
