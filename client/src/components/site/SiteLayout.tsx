import { ReactNode } from "react";
import { Link } from "wouter";
import { ChevronRight } from "lucide-react";
import { SiteHeader } from "./SiteHeader";
import { SiteFooter } from "./SiteFooter";
import { FloatingChat } from "./FloatingChat";
import { useLocale } from "@/contexts/LocaleContext";

export type Crumb = { label: string; href?: string };

export function SiteLayout({ children }: { children: ReactNode }) {
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
      <div className="relative mx-auto max-w-[1400px] px-4 pb-12 pt-10 sm:px-6 lg:px-10 lg:pb-16 lg:pt-14">
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

        <div className="mt-8 flex flex-wrap items-end justify-between gap-x-12 gap-y-8">
          <div className={align === "center" ? "mx-auto max-w-3xl text-center" : "max-w-3xl"}>
            {eyebrow && <p className="eyebrow">{eyebrow}</p>}
            <h1 className="mt-3 text-4xl leading-[1.1] sm:text-5xl lg:text-[3.4rem]">{title}</h1>
            <div className={align === "center" ? "mx-auto mt-6 gold-rule" : "mt-6 gold-rule"} />
            {description && (
              <p className="mt-6 text-[15px] leading-relaxed text-muted-foreground">{description}</p>
            )}
          </div>
          {(aside || index) && (
            <div className="flex items-end gap-8">
              {aside}
              {index && (
                <span className="hidden font-display text-[4.5rem] leading-none text-brand/15 lg:block">
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
