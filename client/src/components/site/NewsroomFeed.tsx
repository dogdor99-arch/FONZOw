/**
 * Newsroom feed — Fonzo activity from every owned channel in one place.
 *
 * Cards are curated by the shop team (see /admin → Newsroom). Where a platform
 * publishes an official embed (TikTok, Facebook, YouTube) the card can open the
 * live post inline; marketplace listings (Shopee, Lazada) link straight out to
 * the storefront, which is the only reliable way to reach live pricing.
 */

import { useMemo, useState } from "react";
import { ArrowUpRight, Radio } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useLocale } from "@/contexts/LocaleContext";
import { CHANNELS } from "@/lib/brand";
import { CHANNEL_TINT, ChannelIcon } from "./ChannelIcon";
import { PostEmbed, isEmbeddable } from "./PostEmbed";
import { Reveal } from "./Reveal";
import { cn } from "@/lib/utils";

type Filter = "all" | (typeof CHANNELS)[number]["key"];

function relativeTime(date: Date, locale: "th" | "en") {
  const diff = Date.now() - new Date(date).getTime();
  const minutes = Math.round(diff / 60000);
  if (minutes < 1) return locale === "th" ? "เมื่อสักครู่" : "just now";
  if (minutes < 60)
    return locale === "th" ? `${minutes} นาทีที่แล้ว` : `${minutes} min ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return locale === "th" ? `${hours} ชั่วโมงที่แล้ว` : `${hours} h ago`;
  const days = Math.round(hours / 24);
  if (days < 30) return locale === "th" ? `${days} วันที่แล้ว` : `${days} d ago`;
  return new Date(date).toLocaleDateString(locale === "th" ? "th-TH" : "en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function NewsroomFeed() {
  const { locale, t } = useLocale();
  const [filter, setFilter] = useState<Filter>("all");
  const [openEmbed, setOpenEmbed] = useState<number | null>(null);

  const { data: posts = [], isLoading } = trpc.newsroom.feed.useQuery({ limit: 24 });

  const platformsWithPosts = useMemo(() => {
    const present = new Set(posts.map(post => post.platform));
    return CHANNELS.filter(channel => present.has(channel.key));
  }, [posts]);

  const visible = useMemo(
    () => (filter === "all" ? posts : posts.filter(post => post.platform === filter)),
    [posts, filter],
  );

  return (
    <section id="newsroom" className="mx-auto max-w-[1400px] px-4 py-20 sm:px-6 lg:px-10 lg:py-28">
      <Reveal>
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="eyebrow inline-flex items-center gap-2">
              <span className="relative inline-flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand/60" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-brand" />
              </span>
              {t("ความเคลื่อนไหว", "Newsroom")}
            </p>
            <h2 className="mt-3 text-3xl leading-tight sm:text-4xl">
              {t("ความเคลื่อนไหวของ Fonzo", "What's happening at Fonzo")}
            </h2>
            <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground">
              {t(
                "รวมงานใหม่ คลิปเสียง รีวิว และสินค้าจากทุกช่องทางของเราไว้ในที่เดียว",
                "New builds, sound clips, reviews and listings from every Fonzo channel, in one place.",
              )}
            </p>
          </div>

          {platformsWithPosts.length > 1 && (
            <div className="flex flex-wrap gap-1.5">
              <FilterChip active={filter === "all"} onClick={() => setFilter("all")}>
                {t("ทั้งหมด", "All")}
              </FilterChip>
              {platformsWithPosts.map(channel => (
                <FilterChip
                  key={channel.key}
                  active={filter === channel.key}
                  onClick={() => setFilter(channel.key)}>
                  <ChannelIcon channel={channel.key} className="h-3 w-3" />
                  {channel.name}
                </FilterChip>
              ))}
            </div>
          )}
        </div>
      </Reveal>

      {isLoading ? (
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-72 animate-pulse bg-secondary/70" />
          ))}
        </div>
      ) : visible.length === 0 ? (
        <EmptyNewsroom />
      ) : (
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map((post, index) => {
            const channel = CHANNELS.find(item => item.key === post.platform);
            const title = locale === "th" ? post.title : post.titleEn || post.title;
            const excerpt = locale === "th" ? post.excerpt : post.excerptEn || post.excerpt;
            const embeddable = isEmbeddable(post.platform, post.url);
            const isOpen = openEmbed === post.id;

            return (
              <Reveal key={post.id} delay={Math.min(index, 6) * 50}>
                <article className="group flex h-full flex-col border border-border/70 bg-background transition-shadow duration-300 hover:shadow-[0_18px_50px_-32px_rgba(28,20,16,0.45)]">
                  {isOpen && embeddable ? (
                    <div className="border-b border-border/70">
                      <PostEmbed platform={post.platform} url={post.url} />
                    </div>
                  ) : (
                    <div className="relative aspect-16/10 overflow-hidden bg-secondary/60">
                      {post.imageUrl ? (
                        <img
                          src={post.imageUrl}
                          alt=""
                          loading="lazy"
                          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                        />
                      ) : (
                        <div
                          className="flex h-full items-center justify-center text-foreground/15"
                          style={{ color: CHANNEL_TINT[post.platform] }}>
                          <ChannelIcon channel={post.platform} className="h-12 w-12 opacity-25" />
                        </div>
                      )}
                      {post.pinned && (
                        <span className="absolute top-3 left-3 bg-brand px-2.5 py-1 text-[10px] tracking-[0.16em] text-brand-foreground uppercase">
                          {t("แนะนำ", "Featured")}
                        </span>
                      )}
                    </div>
                  )}

                  <div className="flex flex-1 flex-col p-5">
                    <div className="flex items-center gap-2 text-[11px] tracking-[0.14em] uppercase">
                      <span style={{ color: CHANNEL_TINT[post.platform] }}>
                        <ChannelIcon channel={post.platform} className="h-3.5 w-3.5" />
                      </span>
                      <span className="text-foreground/70">{channel?.name ?? post.platform}</span>
                      <span className="text-muted-foreground/60">·</span>
                      <span className="text-muted-foreground normal-case">
                        {relativeTime(post.postedAt, locale)}
                      </span>
                    </div>

                    <h3 className="mt-3 font-display text-lg leading-snug">{title}</h3>
                    {excerpt && (
                      <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-muted-foreground">
                        {excerpt}
                      </p>
                    )}

                    <div className="mt-auto flex items-center justify-between gap-3 pt-5">
                      {post.priceLabel ? (
                        <span className="font-display text-base">{post.priceLabel}</span>
                      ) : (
                        <span />
                      )}
                      <div className="flex items-center gap-3">
                        {embeddable && (
                          <button
                            type="button"
                            onClick={() => setOpenEmbed(isOpen ? null : post.id)}
                            className="press inline-flex items-center gap-1.5 text-[11px] tracking-[0.14em] text-muted-foreground uppercase hover:text-brand">
                            <Radio className="h-3 w-3" strokeWidth={1.8} />
                            {isOpen ? t("ปิด", "Close") : t("ดูโพสต์", "View post")}
                          </button>
                        )}
                        <a
                          href={post.url}
                          target="_blank"
                          rel="noreferrer"
                          className="press inline-flex items-center gap-1.5 text-[11px] tracking-[0.14em] text-brand uppercase hover:underline">
                          {post.platform === "shopee" || post.platform === "lazada"
                            ? t("สั่งซื้อ", "Buy")
                            : t("เปิด", "Open")}
                          <ArrowUpRight className="h-3.5 w-3.5" strokeWidth={1.8} />
                        </a>
                      </div>
                    </div>
                  </div>
                </article>
              </Reveal>
            );
          })}
        </div>
      )}
    </section>
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

function EmptyNewsroom() {
  const { locale, t } = useLocale();
  return (
    <div className="mt-12 border border-dashed border-border bg-cream/40 px-6 py-16 text-center">
      <p className="text-sm text-muted-foreground">
        {t(
          "ยังไม่มีคอนเทนต์ในระบบ — ทีมงานสามารถเพิ่มโพสต์จากทุกแพลตฟอร์มได้ที่หน้าจัดการร้าน",
          "No posts yet — the shop team can add content from any platform in the shop console.",
        )}
      </p>
      <div className="mt-7 flex flex-wrap justify-center gap-2">
        {CHANNELS.map(channel => (
          <a
            key={channel.key}
            href={channel.url}
            target="_blank"
            rel="noreferrer"
            className="press inline-flex items-center gap-2 border border-border bg-background px-4 py-2.5 text-[11px] tracking-[0.14em] uppercase transition-colors duration-200 hover:border-brand/40 hover:text-brand">
            <span style={{ color: CHANNEL_TINT[channel.key] }}>
              <ChannelIcon channel={channel.key} className="h-3.5 w-3.5" />
            </span>
            {channel.name}
            <span className="text-muted-foreground normal-case">
              {locale === "th" ? channel.note.th : channel.note.en}
            </span>
          </a>
        ))}
      </div>
    </div>
  );
}
