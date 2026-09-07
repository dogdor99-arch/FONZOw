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
      <FloatingChat />
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
}) {
  const { t } = useLocale();
  return (
    <section className="relative overflow-hidden border-b border-border/70 bg-[linear-gradient(180deg,color-mix(in_oklch,var(--brand)_4%,transparent)_0%,transparent_100%)]">
      <div
        aria-hidden
        className="pointer-events-none absolute -right-24 -top-32 h-[26rem] w-[26rem] rounded-full bg-[radial-gradient(circle,color-mix(in_oklch,var(--brand)_9%,transparent)_0%,transparent_70%)]"
      />
      <div className="relative mx-auto max-w-[1400px] px-4 pb-8 pt-7 sm:px-6 lg:px-10 lg:pb-10 lg:pt-9 lg:pl-4">
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

        <div className="mt-5 flex flex-wrap items-end justify-between gap-x-10 gap-y-4">
          <div className={align === "center" ? "mx-auto max-w-3xl text-center" : "max-w-3xl"}>
            {eyebrow && <p className="eyebrow">{eyebrow}</p>}
            <h1 className="mt-2 text-3xl leading-[1.05] sm:text-4xl lg:text-[2.85rem]">{title}</h1>
            <div className={align === "center" ? "mx-auto mt-4 gold-rule" : "mt-4 gold-rule"} />
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

export function CompactPageHeading({ eyebrow, title, crumbs = [] }: { eyebrow?: string; title: string; crumbs?: Crumb[] }) {
  const { t } = useLocale();
  return <section className="border-b border-border/70 bg-cream/40 px-4 py-4 sm:px-6 lg:px-10"><div className="mx-auto max-w-[1400px] lg:pl-4"><nav aria-label="breadcrumb" className="text-[9px] tracking-[0.14em] text-muted-foreground uppercase"><Link href="/" className="transition-colors hover:text-brand">{t("หน้าแรก", "Home")}</Link>{crumbs.map(crumb => <span key={crumb.label}><span className="mx-1.5 text-brand">›</span>{crumb.label}</span>)}</nav>{eyebrow && <p className="mt-2 text-[10px] tracking-[0.16em] text-brand uppercase">{eyebrow}</p>}<h1 className="mt-1 font-display text-3xl leading-none sm:text-4xl">{title}</h1></div></section>;
}
