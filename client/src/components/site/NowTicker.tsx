/**
 * A thin ticker announcing the newest activity across channels.
 *
 * Reads the same curated newsroom feed as the main section, so the headline copy
 * never drifts from what the cards show. Renders nothing until there is content.
 */

import { trpc } from "@/lib/trpc";
import { useLocale } from "@/contexts/LocaleContext";
import { CHANNELS } from "@/lib/brand";
import { ChannelIcon } from "./ChannelIcon";

export function NowTicker() {
  const { locale, t } = useLocale();
  const { data: posts = [] } = trpc.newsroom.feed.useQuery({ limit: 10 });

  if (posts.length === 0) return null;

  const items = posts.map(post => ({
    id: post.id,
    platform: post.platform,
    url: post.url,
    label: locale === "th" ? post.title : post.titleEn || post.title,
    channel: CHANNELS.find(channel => channel.key === post.platform)?.name ?? post.platform,
  }));

  // Duplicated once so the -50% translation loops seamlessly.
  const loop = [...items, ...items];

  return (
    <div className="marquee relative overflow-hidden border-b border-cream/12 bg-ink text-cream">
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-linear-to-r from-ink to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-linear-to-l from-ink to-transparent" />

      <div className="flex items-center">
        <span className="z-10 hidden shrink-0 items-center gap-2 bg-brand px-5 py-2.5 text-[10px] tracking-[0.22em] text-brand-foreground uppercase sm:inline-flex">
          <span className="relative inline-flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand-foreground/70" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-brand-foreground" />
          </span>
          {t("ล่าสุด", "Now")}
        </span>

        <div className="marquee-track flex w-max items-center gap-10 py-2.5 pl-6 whitespace-nowrap">
          {loop.map((item, index) => (
            <a
              key={`${item.id}-${index}`}
              href={item.url}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2.5 text-[11px] tracking-[0.06em] text-cream/70 transition-colors duration-200 hover:text-cream">
              <ChannelIcon channel={item.platform} className="h-3 w-3 shrink-0 opacity-60" />
              <span className="tracking-[0.18em] text-cream/45 uppercase">{item.channel}</span>
              <span className="text-cream/25">/</span>
              <span>{item.label}</span>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}

