import { ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { ChevronRight } from "lucide-react";
import { SiteHeader } from "./SiteHeader";
import { SiteFooter } from "./SiteFooter";
import { FloatingChat } from "./FloatingChat";
import { useLocale } from "@/contexts/LocaleContext";

export type Crumb = { label: string; href?: string };

export function SiteLayout({ children }: { children: ReactNode }) {
  const [location] = useLocation();

  if (location === "/guitars") {
    return <main className="min-h-screen bg-ink">{children}</main>;
  }

  return (
    <div className="flex min-h-screen flex-col paper">
      <SiteHeader />
      <main className="flex-1">{children}</main>
      <SiteFooter />
      {/* Contact launcher rides above every page — Messenger is Fonzo's live channel. */}
      {location !== "/admin" && <FloatingChat />}
    </div>
  );
}

export function PageHeading({
  eyebrow,
  title,
  description,
  crumbs,
  align = "left",
  index,
  aside,
  compact = false,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  crumbs?: Crumb[];
  align?: "left" | "center";
  /** Chapter marker rendered at the top-right, e.g. "04". */
  index?: string;
  /** Optional trailing content (counts, quick links) shown beside the title block. */
  aside?: ReactNode;
  /** Reduced vertical padding for product detail headers. */
  compact?: boolean;
}) {
  const { t } = useLocale();
  return (
    <section className="relative overflow-hidden border-b border-border/70 bg-[linear-gradient(180deg,color-mix(in_oklch,var(--brand)_4%,transparent)_0%,transparent_100%)]">
      <div
        aria-hidden
        className="pointer-events-none absolute -right-24 -top-32 h-[26rem] w-[26rem] rounded-full bg-[radial-gradient(circle,color-mix(in_oklch,var(--brand)_9%,transparent)_0%,transparent_70%)]"
      />
      <div className={`relative mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-10 lg:pl-12 ${compact ? "pb-5 pt-4 lg:pb-6 lg:pt-5" : "pb-8 pt-7 lg:pb-10 lg:pt-9"}`}>
        <nav aria-label="breadcrumb" className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
          <Link href="/" className="tracking-[0.14em] uppercase transition-colors hover:text-brand">
            {t("หน้าแรก", "Home")}
          </Link>
          {(crumbs ?? []).map(crumb => (
            <span key={crumb.label} className="flex items-center gap-1.5">
              <ChevronRight className="h-3 w-3" />
              {crumb.href ? (
                <Link href={crumb.href} className="tracking-[0.14em] uppercase transition-colors hover:text-brand">
                  {crumb.label}
                </Link>
              ) : (
                <span className="tracking-[0.14em] uppercase text-foreground/80">{crumb.label}</span>
              )}
            </span>
          ))}
        </nav>

        <div className={`${compact ? "mt-3" : "mt-5"} flex flex-wrap items-end justify-between gap-x-10 gap-y-4`}>
          <div className={align === "center" ? "mx-auto max-w-3xl text-center" : "max-w-3xl"}>
            {eyebrow && <p className="eyebrow">{eyebrow}</p>}
            <h1 className={`${compact ? "mt-1 text-2xl sm:text-3xl lg:text-[2.35rem]" : "mt-2 text-3xl sm:text-4xl lg:text-[2.85rem]"} leading-[1.05]`}>{title}</h1>
            <div className={align === "center" ? `mx-auto ${compact ? "mt-3" : "mt-4"} gold-rule` : `${compact ? "mt-3" : "mt-4"} gold-rule`} />
            {description && (
              <p className="mt-4 max-w-2xl text-sm leading-relaxed text-muted-foreground">{description}</p>
            )}
          </div>
          {(aside || index) && (
            <div className="flex items-end gap-8">
              {aside}
              {index && (
                <span className="hidden font-display text-[3.5rem] leading-none text-brand/15 lg:block">
                  {index}
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

const storeSections = [
  { href: "/guitars/catalog", labelTh: "กีตาร์", labelEn: "Guitars", icon: "shop" },
  { href: "/guitar-custom", labelTh: "กีตาร์สั่งทำ", labelEn: "Custom", icon: "custom" },
  { href: "/accessories", labelTh: "อุปกรณ์", labelEn: "Accessories", icon: "ass" },
];

function StoreSectionNav() {
  const { locale } = useLocale();
  const [location] = useLocation();
  return <nav aria-label="Store sections" className="ml-auto flex shrink-0 items-center gap-2 border-l border-border/70 pl-3 sm:gap-2.5 sm:pl-5">{storeSections.map(section => { const active = location === section.href || location.startsWith(`${section.href}/`); return <Link key={section.href} href={section.href} aria-label={locale === "th" ? section.labelTh : section.labelEn} className={`group flex h-14 w-14 items-center justify-center overflow-hidden rounded-full border p-1 transition sm:h-16 sm:w-16 ${active ? "border-brand bg-brand" : "border-border bg-card hover:border-brand/60"}`}><img src={`/fonzo-icons/icon-${section.icon}${active ? "-white" : ""}.png`} alt="" className="h-full w-full object-contain" /><span className="sr-only">{locale === "th" ? section.labelTh : section.labelEn}</span></Link>; })}</nav>;
}

export function CompactPageHeading({ eyebrow, title, crumbs = [], storeNav = false }: { eyebrow?: string; title: string; crumbs?: Crumb[]; storeNav?: boolean }) {
  const { t } = useLocale();
  return <section className="border-b border-border/70 bg-cream/40 px-4 py-2.5 sm:px-6 sm:py-3 lg:px-10"><div className="mx-auto max-w-[1400px] lg:pl-12"><nav aria-label="breadcrumb" className="text-[9px] tracking-[0.14em] text-muted-foreground uppercase"><Link href="/" className="transition-colors hover:text-brand">{t("หน้าแรก", "Home")}</Link>{crumbs.map(crumb => <span key={crumb.label}><span className="mx-1.5 text-brand">›</span>{crumb.label}</span>)}</nav><div className="mt-2 flex w-full items-center gap-3 sm:gap-5"><div>{eyebrow && <p className="text-[10px] tracking-[0.16em] text-brand uppercase">{eyebrow}</p>}<h1 className="mt-1 font-display text-3xl leading-none sm:text-4xl">{title}</h1></div>{storeNav && <StoreSectionNav />}</div></div></section>;
}
