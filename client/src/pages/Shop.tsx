import { useMemo, useState } from "react";
import { Link } from "wouter";
import { ExternalLink, Facebook, MessageCircle, PackageSearch, Phone, Search } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useLocale } from "@/contexts/LocaleContext";
import { PageHeading } from "@/components/site/SiteLayout";
import { Reveal } from "@/components/site/Reveal";
import { BuyChannels } from "@/components/site/BuyChannels";
import { BRAND } from "@/lib/brand";
import {
  FACEBOOK_MESSENGER_URL,
  LAZADA_STORE_URL,
  MARKETPLACE_LINK_COUNT,
  SHOPEE_STORE_URL,
  hasMarketplaceListing,
} from "@shared/fonzo/marketplace";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

/**
 * "Where to buy" hub.
 *
 * Fonzo fulfils online orders through its official Shopee and Lazada stores,
 * so this page is a directory of the models that already have a live listing
 * rather than a self-hosted checkout. Each row links straight out to the
 * marketplace listing for that exact model.
 */
export default function Shop() {
  const { t, locale } = useLocale();
  const { data: guitars = [], isLoading: loadingGuitars } = trpc.fonzo.guitars.list.useQuery();
  const { data: accessories = [], isLoading: loadingAccessories } =
    trpc.fonzo.accessories.list.useQuery();
  const [query, setQuery] = useState("");
  const [group, setGroup] = useState<"guitar" | "accessory">("guitar");

  const isLoading = loadingGuitars || loadingAccessories;

  const listed = useMemo(() => {
    const source = group === "guitar" ? guitars : accessories;
    const q = query.trim().toLowerCase();
    return source
      .filter(item => hasMarketplaceListing(item.code))
      .filter(item => {
        if (!q) return true;
        return `${item.name} ${item.nameEn} ${item.code} ${item.typeName}`.toLowerCase().includes(q);
      });
  }, [group, guitars, accessories, query]);

  return (
    <>
      <PageHeading
        eyebrow={t("ช่องทางสั่งซื้อ", "Where to buy")}
        title={t("สั่งซื้อออนไลน์", "Buy online")}
        index="10"
        description={t(
          "Fonzo จำหน่ายออนไลน์ผ่านร้านทางการบน Shopee และ Lazada ซึ่งรองรับการชำระเงินหลายรูปแบบ ผ่อนชำระ และติดตามสถานะพัสดุได้ในระบบเดียว",
          "Fonzo sells online through its official Shopee and Lazada stores, which handle multiple payment methods, instalments and parcel tracking in one place.",
        )}
        crumbs={[{ label: t("สั่งซื้อออนไลน์", "Buy online") }]}
      />

      {/* Store cards */}
      <section className="mx-auto max-w-[1400px] px-4 pt-12 sm:px-6 lg:px-10">
        <div className="grid gap-4 lg:grid-cols-3">
          <a
            href={SHOPEE_STORE_URL}
            target="_blank"
            rel="noreferrer"
            className="press group flex flex-col justify-between border border-border bg-card p-7 transition-colors duration-200 hover:border-[#ee4d2d]/50">
            <div>
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-[#ee4d2d]/10 text-[#ee4d2d]">
                <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden="true">
                  <path
                    d="M4.4 7.6h15.2l-1 12.1a1.6 1.6 0 0 1-1.6 1.5H7a1.6 1.6 0 0 1-1.6-1.5L4.4 7.6Z"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M8.7 7.6V6.3a3.3 3.3 0 0 1 6.6 0v1.3"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                </svg>
              </span>
              <h2 className="mt-5 font-display text-xl">Shopee</h2>
              <p className="mt-1 text-xs tracking-[0.14em] text-muted-foreground uppercase">
                fonzo_guitar
              </p>
              <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                {t(
                  "ร้านทางการ รองรับผ่อน 0% บัตรเครดิต โอนเงิน และเก็บเงินปลายทาง",
                  "Official store with instalments, cards, transfer and cash on delivery.",
                )}
              </p>
            </div>
            <span className="mt-6 inline-flex items-center gap-2 text-[11px] tracking-[0.18em] text-[#ee4d2d] uppercase">
              {t("เปิดร้าน Shopee", "Open Shopee store")}
              <ExternalLink className="h-3.5 w-3.5" strokeWidth={1.8} />
            </span>
          </a>

          <a
            href={LAZADA_STORE_URL}
            target="_blank"
            rel="noreferrer"
            className="press group flex flex-col justify-between border border-border bg-card p-7 transition-colors duration-200 hover:border-[#0f146d]/50">
            <div>
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-[#0f146d]/10 text-[#0f146d]">
                <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden="true">
                  <path
                    d="M12 2.6 20.4 7v10L12 21.4 3.6 17V7L12 2.6Z"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M9.6 8.7v6.6h5"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
              <h2 className="mt-5 font-display text-xl">Lazada</h2>
              <p className="mt-1 text-xs tracking-[0.14em] text-muted-foreground uppercase">
                Fonzo Guitar
              </p>
              <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                {t(
                  "ร้านทางการ พร้อมคูปองส่วนลดตามแคมเปญและระบบติดตามพัสดุ",
                  "Official store with campaign vouchers and full parcel tracking.",
                )}
              </p>
            </div>
            <span className="mt-6 inline-flex items-center gap-2 text-[11px] tracking-[0.18em] text-[#0f146d] uppercase">
              {t("เปิดร้าน Lazada", "Open Lazada store")}
              <ExternalLink className="h-3.5 w-3.5" strokeWidth={1.8} />
            </span>
          </a>

          <div className="flex flex-col justify-between border border-border bg-secondary/45 p-7">
            <div>
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-[#1877f2]/10 text-[#1877f2]">
                <Facebook className="h-5 w-5" strokeWidth={1.7} />
              </span>
              <h2 className="mt-5 font-display text-xl">{t("สอบถามก่อนซื้อ", "Talk to us first")}</h2>
              <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                {t(
                  "รุ่นสั่งทำ งานพิเศษ หรือขอคำแนะนำเรื่องไม้และเสียง ทีมงานตอบทาง Facebook และ Line ทุกวัน",
                  "For custom builds, special orders or advice on tonewoods, our team replies daily on Facebook and Line.",
                )}
              </p>
            </div>
            <div className="mt-6 space-y-2.5">
              <a
                href={FACEBOOK_MESSENGER_URL}
                target="_blank"
                rel="noreferrer"
                className="press flex items-center gap-2.5 border border-[#1877f2]/40 px-4 py-3 text-[11px] tracking-[0.16em] text-[#1877f2] uppercase transition-colors hover:bg-[#1877f2]/8">
                <Facebook className="h-4 w-4" strokeWidth={1.7} />
                {t("สอบถามทาง Facebook", "Ask on Facebook")}
              </a>
              <a
                href={BRAND.contact.line}
                target="_blank"
                rel="noreferrer"
                className="press flex items-center gap-2.5 border border-foreground/20 px-4 py-3 text-[11px] tracking-[0.16em] uppercase transition-colors hover:border-brand hover:text-brand">
                <MessageCircle className="h-4 w-4" strokeWidth={1.7} />
                {t("คุยผ่าน Line", "Chat on Line")}
              </a>
              <p className="flex items-center gap-2 pt-1 text-[11px] text-muted-foreground">
                <Phone className="h-3.5 w-3.5 text-gold" strokeWidth={1.7} />
                {BRAND.contact.phones.join(" · ")}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Listed models */}
      <section className="mx-auto max-w-[1400px] px-4 py-14 sm:px-6 lg:px-10">
        <div className="flex flex-wrap items-end justify-between gap-6 border-b border-border/70 pb-6">
          <div>
            <p className="eyebrow">{t("รายการที่ขายออนไลน์", "Listed online")}</p>
            <h2 className="mt-3 text-2xl sm:text-3xl">
              {t("เลือกรุ่นแล้วสั่งซื้อได้ทันที", "Pick a model and order in one tap")}
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">
              {t(
                `ปัจจุบันมี ${MARKETPLACE_LINK_COUNT} รุ่นที่เปิดขายบนแพลตฟอร์ม รุ่นอื่นสั่งซื้อได้โดยติดต่อทีมงานหรือชมที่โชว์รูม`,
                `${MARKETPLACE_LINK_COUNT} models currently have live marketplace listings. Other models can be ordered through our team or seen at the showroom.`,
              )}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {(
              [
                { key: "guitar" as const, label: t("กีตาร์", "Guitars") },
                { key: "accessory" as const, label: t("อุปกรณ์เสริม", "Accessories") },
              ]
            ).map(tab => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setGroup(tab.key)}
                className={cn(
                  "press border px-5 py-2.5 text-[11px] tracking-[0.16em] uppercase transition-colors",
                  group === tab.key
                    ? "border-brand bg-brand text-brand-foreground"
                    : "border-border text-muted-foreground hover:border-brand/50 hover:text-brand",
                )}>
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="relative mt-6 max-w-md">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder={t("ค้นหารุ่นหรือรหัสสินค้า", "Search model or reference")}
            className="h-11 rounded-none border-border bg-card pl-9"
          />
        </div>

        {isLoading ? (
          <div className="mt-10 space-y-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-24 animate-pulse bg-secondary" />
            ))}
          </div>
        ) : listed.length === 0 ? (
          <div className="mt-12 border border-border bg-card p-14 text-center">
            <PackageSearch className="mx-auto h-8 w-8 text-muted-foreground" strokeWidth={1.3} />
            <p className="mt-5 font-display text-xl">
              {t("ไม่พบรายการที่ค้นหา", "No matching listings")}
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              {group === "accessory"
                ? t(
                    "อุปกรณ์เสริมส่วนใหญ่จำหน่ายที่โชว์รูมและสอบถามทาง Facebook ได้",
                    "Most accessories are sold at the showroom — ask us on Facebook.",
                  )
                : t("ลองปรับคำค้นหาใหม่", "Try a different search term.")}
            </p>
            <Link
              href={group === "accessory" ? "/accessories" : "/guitar"}
              className="press mt-7 inline-block bg-brand px-6 py-3 text-[11px] tracking-[0.18em] text-brand-foreground uppercase">
              {t("ชมแคตตาล็อกทั้งหมด", "Browse the catalogue")}
            </Link>
          </div>
        ) : (
          <>
            <p className="mt-6 text-xs tracking-[0.14em] text-muted-foreground uppercase">
              {listed.length} {t("รายการ", listed.length === 1 ? "item" : "items")}
            </p>
            <ul className="mt-6 divide-y divide-border/70 border-y border-border/70">
              {listed.map((item, index) => {
                const title = locale === "th" ? item.name || item.nameEn : item.nameEn || item.name;
                const basePath = group === "guitar" ? "/guitar" : "/accessories";
                return (
                  <Reveal key={item.code} delay={Math.min(index, 8) * 30}>
                    <li className="grid gap-5 py-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center lg:gap-10">
                      <Link href={`${basePath}/${item.code}`} className="group flex min-w-0 items-center gap-5">
                        <div className="h-20 w-20 shrink-0 overflow-hidden bg-secondary/70">
                          {item.image ? (
                            <img
                              src={item.image}
                              alt={title}
                              loading="lazy"
                              className="h-full w-full object-cover transition-transform duration-700 [transition-timing-function:cubic-bezier(0.23,1,0.32,1)] group-hover:scale-[1.06]"
                            />
                          ) : null}
                        </div>
                        <div className="min-w-0">
                          <p className="text-[10px] tracking-[0.2em] text-muted-foreground uppercase">
                            {item.typeName}
                            {item.seriesName ? ` · ${item.seriesName}` : ""}
                          </p>
                          <h3 className="mt-1 truncate font-display text-[1.0625rem] transition-colors group-hover:text-brand">
                            {title}
                          </h3>
                          <p className="mt-1 text-sm text-foreground/80">
                            {item.price !== null
                              ? `฿${item.price.toLocaleString("en-US")}`
                              : t("สอบถามราคา", "Price on enquiry")}
                          </p>
                        </div>
                      </Link>
                      <BuyChannels
                        code={item.code}
                        title={item.nameEn || item.name}
                        variant="row"
                        className="lg:w-[320px]"
                      />
                    </li>
                  </Reveal>
                );
              })}
            </ul>
          </>
        )}
      </section>
    </>
  );
}
