import { useEffect } from "react";
import { useLocale } from "@/contexts/LocaleContext";
import { CHANNELS } from "@/lib/brand";
import { CHANNEL_TINT, ChannelIcon } from "./ChannelIcon";
import { Reveal } from "./Reveal";
import { cn } from "@/lib/utils";

const WALL_PLATFORMS = ["instagram", "tiktok", "facebook", "youtube"] as const;

export function SocialGrid({
  heading = true,
  index,
  className,
}: {
  limit?: number;
  heading?: boolean;
  index?: string;
  className?: string;
}) {
  const { t } = useLocale();

  // โหลดสคริปต์ Juicer.io เข้ามาทำงานใน React
  useEffect(() => {
    const scriptId = "juicer-script";
    if (!document.getElementById(scriptId)) {
      const script = document.createElement("script");
      script.id = scriptId;
      script.src = "https://www.juicer.io/embed/fonzoguitar/embed-code.js";
      script.async = true;
      script.defer = true;
      document.body.appendChild(script);
    }
  }, []);

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
          </div>
        </Reveal>
      )}

      {/* พื้นที่แสดงผล Juicer Social Feed */}
      <div className="mt-8">
        <ul className="juicer-feed" data-feed-id="fonzoguitar"></ul>
      </div>

      {/* แถบติดตามโซเชียลมีเดียด้านล่าง */}
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
    </section>
  );
}