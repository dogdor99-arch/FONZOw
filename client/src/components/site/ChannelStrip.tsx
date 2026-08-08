/**
 * Channel strip — a compact row linking to every official Fonzo storefront and
 * social account, so a visitor can jump to whichever platform they already buy on.
 */

import { ArrowUpRight } from "lucide-react";
import { CHANNELS } from "@/lib/brand";
import { useLocale } from "@/contexts/LocaleContext";
import { CHANNEL_TINT, ChannelIcon } from "./ChannelIcon";

export function ChannelStrip() {
  const { locale, t } = useLocale();

  return (
    <section className="border-y border-border/60 bg-cream/60">
      <div className="mx-auto max-w-[1400px] px-4 py-10 sm:px-6 lg:px-10">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="lg:max-w-[260px]">
            <p className="eyebrow">{t("ช่องทางทางการ", "Official channels")}</p>
            <p className="mt-2 text-sm text-muted-foreground">
              {t(
                "เลือกซื้อและติดตาม Fonzo ได้ทุกแพลตฟอร์ม",
                "Shop and follow Fonzo on every platform.",
              )}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-px bg-border/60 sm:grid-cols-3 lg:flex-1 lg:grid-cols-6">
            {CHANNELS.map(channel => (
              <a
                key={channel.key}
                href={channel.url}
                target="_blank"
                rel="noreferrer"
                className="group relative flex flex-col gap-2 bg-background px-4 py-5 transition-colors duration-200 hover:bg-cream">
                <span
                  className="inline-flex h-7 w-7 items-center justify-center text-foreground/45 transition-colors duration-200 group-hover:text-(--tint)"
                  style={{ ["--tint" as string]: CHANNEL_TINT[channel.key] }}>
                  <ChannelIcon channel={channel.key} className="h-5 w-5" />
                </span>
                <span className="text-[11px] font-medium tracking-[0.14em] uppercase">
                  {channel.name}
                </span>
                <span className="text-[11px] leading-snug text-muted-foreground">
                  {locale === "th" ? channel.note.th : channel.note.en}
                </span>
                <ArrowUpRight
                  className="absolute top-4 right-4 h-3.5 w-3.5 text-foreground/20 transition-all duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-brand"
                  strokeWidth={1.6}
                />
              </a>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
