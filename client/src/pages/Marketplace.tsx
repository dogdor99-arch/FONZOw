import { useMemo, useState } from "react";
import { Link } from "wouter";
import { ArrowLeftRight, Eye, ListPlus, MapPin, PackageSearch, Repeat, Tag } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useLocale } from "@/contexts/LocaleContext";
import { useAuth } from "@/_core/hooks/useAuth";
import { startLogin } from "@/const";
import { PageHeading } from "@/components/site/SiteLayout";
import { Reveal } from "@/components/site/Reveal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const INTENT_LABEL = {
  sell: { th: "ขาย", en: "For sale" },
  trade: { th: "แลกเปลี่ยน", en: "For trade" },
  both: { th: "ขาย / แลกเปลี่ยน", en: "Sale or trade" },
} as const;

const CONDITION_LABEL = {
  new: { th: "ใหม่", en: "New" },
  mint: { th: "สภาพเหมือนใหม่", en: "Mint" },
  excellent: { th: "สภาพดีเยี่ยม", en: "Excellent" },
  good: { th: "สภาพดี", en: "Good" },
  fair: { th: "สภาพพอใช้", en: "Fair" },
} as const;

export default function Marketplace() {
  const { t } = useLocale();
  const { isAuthenticated } = useAuth();
  const [intent, setIntent] = useState<"all" | "sell" | "trade">("all");
  const [query, setQuery] = useState("");

  const { data: listings = [], isLoading } = trpc.marketplace.list.useQuery(
    intent === "all" ? {} : { intent },
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return listings;
    return listings.filter(listing =>
      `${listing.title} ${listing.brand ?? ""} ${listing.model ?? ""} ${listing.location ?? ""}`
        .toLowerCase()
        .includes(q),
    );
  }, [listings, query]);

  return (
    <>
      <PageHeading
        eyebrow={t("ชุมชนคนรักกีตาร์", "Fonzo community")}
        title={t("พื้นที่ซื้อขายแลกเปลี่ยน", "Marketplace")}
        description={t(
          "พื้นที่สำหรับสมาชิกซื้อ ขาย และแลกเปลี่ยนกีตาร์มือสอง ลงประกาศได้ฟรีเมื่อเข้าสู่ระบบ พร้อมพูดคุยกับผู้ขายได้โดยตรง",
          "A space for members to buy, sell and trade pre-owned guitars. Listing is free once you sign in, and you can message sellers directly.",
        )}
        crumbs={[{ label: t("ซื้อขายแลกเปลี่ยน", "Marketplace") }]}
      />

      <section className="mx-auto max-w-[1400px] px-4 py-12 sm:px-6 lg:px-10">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border/70 pb-5">
          <div className="flex flex-wrap gap-2">
            {(
              [
                { key: "all", th: "ทั้งหมด", en: "All" },
                { key: "sell", th: "ขาย", en: "For sale" },
                { key: "trade", th: "แลกเปลี่ยน", en: "For trade" },
              ] as const
            ).map(option => (
              <button
                key={option.key}
                type="button"
                onClick={() => setIntent(option.key)}
                className={cn(
                  "press border px-4 py-2.5 text-[11px] tracking-[0.16em] uppercase",
                  intent === option.key
                    ? "border-brand bg-brand text-brand-foreground"
                    : "border-border text-muted-foreground hover:border-brand/50 hover:text-brand",
                )}>
                {t(option.th, option.en)}
              </button>
            ))}
          </div>

          <div className="flex flex-1 flex-wrap items-center justify-end gap-3">
            <Input
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder={t("ค้นหายี่ห้อ รุ่น หรือจังหวัด", "Search brand, model or city")}
              className="h-11 max-w-xs rounded-none border-border bg-card"
            />
            {isAuthenticated ? (
              <>
                <Button
                  asChild
                  className="press h-11 rounded-none bg-brand px-5 text-[11px] tracking-[0.16em] text-brand-foreground uppercase hover:bg-brand/90">
                  <Link href="/marketplace/new">
                    <ListPlus className="mr-2 h-4 w-4" strokeWidth={1.6} />
                    {t("ลงประกาศ", "Create listing")}
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  className="press h-11 rounded-none border-foreground/25 px-5 text-[11px] tracking-[0.16em] uppercase hover:border-brand hover:text-brand">
                  <Link href="/marketplace/my-listings">{t("ประกาศของฉัน", "My listings")}</Link>
                </Button>
              </>
            ) : (
              <Button
                onClick={() => startLogin()}
                className="press h-11 rounded-none bg-brand px-5 text-[11px] tracking-[0.16em] text-brand-foreground uppercase hover:bg-brand/90">
                {t("เข้าสู่ระบบเพื่อลงประกาศ", "Sign in to list")}
              </Button>
            )}
          </div>
        </div>

        {isLoading ? (
          <div className="mt-10 grid gap-x-5 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i}>
                <div className="aspect-[4/3] animate-pulse bg-secondary" />
                <div className="mt-4 h-4 w-2/3 animate-pulse bg-secondary" />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="mt-16 border border-border bg-card p-14 text-center">
            <PackageSearch className="mx-auto h-8 w-8 text-muted-foreground" strokeWidth={1.3} />
            <p className="mt-5 font-display text-xl">
              {listings.length === 0
                ? t("ยังไม่มีประกาศในตลาด", "No listings yet")
                : t("ไม่พบประกาศที่ค้นหา", "No matching listings")}
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              {listings.length === 0
                ? t(
                    "เป็นคนแรกที่ลงประกาศขายหรือแลกเปลี่ยนกีตาร์ของคุณ",
                    "Be the first to list a guitar for sale or trade.",
                  )
                : t("ลองปรับคำค้นหาใหม่", "Try a different search term.")}
            </p>
            {isAuthenticated ? (
              <Button
                asChild
                className="press mt-7 h-11 rounded-none bg-brand px-6 text-[11px] tracking-[0.18em] text-brand-foreground uppercase">
                <Link href="/marketplace/new">{t("ลงประกาศ", "Create listing")}</Link>
              </Button>
            ) : (
              <Button
                onClick={() => startLogin()}
                className="press mt-7 h-11 rounded-none bg-brand px-6 text-[11px] tracking-[0.18em] text-brand-foreground uppercase">
                {t("เข้าสู่ระบบ", "Sign in")}
              </Button>
            )}
          </div>
        ) : (
          <div className="mt-10 grid gap-x-5 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((listing, index) => (
              <Reveal key={listing.id} delay={Math.min(index, 6) * 45}>
                <Link href={`/marketplace/${listing.id}`} className="group block">
                  <div className="relative aspect-[4/3] overflow-hidden bg-secondary/70">
                    {listing.images[0] ? (
                      <img
                        src={listing.images[0]}
                        alt={listing.title}
                        loading="lazy"
                        className="h-full w-full object-cover transition-transform duration-700 [transition-timing-function:cubic-bezier(0.23,1,0.32,1)] group-hover:scale-[1.04]"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-xs text-muted-foreground">
                        {t("ไม่มีรูปภาพ", "No photo")}
                      </div>
                    )}
                    <span className="absolute left-3 top-3 inline-flex items-center gap-1.5 bg-ink/85 px-2.5 py-1 text-[10px] tracking-[0.14em] text-cream uppercase">
                      {listing.intent === "trade" ? (
                        <ArrowLeftRight className="h-3 w-3" />
                      ) : listing.intent === "both" ? (
                        <Repeat className="h-3 w-3" />
                      ) : (
                        <Tag className="h-3 w-3" />
                      )}
                      {t(INTENT_LABEL[listing.intent].th, INTENT_LABEL[listing.intent].en)}
                    </span>
                    {listing.status === "reserved" && (
                      <span className="absolute right-3 top-3 bg-gold px-2.5 py-1 text-[10px] tracking-[0.14em] text-ink uppercase">
                        {t("จองแล้ว", "Reserved")}
                      </span>
                    )}
                  </div>

                  <div className="pt-4">
                    <p className="text-[10px] tracking-[0.2em] text-muted-foreground uppercase">
                      {[listing.brand, listing.year].filter(Boolean).join(" · ") ||
                        t(CONDITION_LABEL[listing.condition].th, CONDITION_LABEL[listing.condition].en)}
                    </p>
                    <h3 className="mt-1.5 font-display text-[1.0625rem] leading-snug transition-colors group-hover:text-brand">
                      {listing.title}
                    </h3>
                    <div className="mt-2 flex items-center justify-between text-sm">
                      <span className="text-foreground/85">
                        {listing.price
                          ? `฿${Number(listing.price).toLocaleString("en-US")}`
                          : t("แลกเปลี่ยนเท่านั้น", "Trade only")}
                      </span>
                      <span className="inline-flex items-center gap-3 text-xs text-muted-foreground">
                        {listing.location && (
                          <span className="inline-flex items-center gap-1">
                            <MapPin className="h-3 w-3" strokeWidth={1.6} />
                            {listing.location}
                          </span>
                        )}
                        <span className="inline-flex items-center gap-1">
                          <Eye className="h-3 w-3" strokeWidth={1.6} />
                          {listing.viewCount}
                        </span>
                      </span>
                    </div>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        )}
      </section>
    </>
  );
}

