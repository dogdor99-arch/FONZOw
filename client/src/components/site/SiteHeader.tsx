import { useState } from "react";
import { Link } from "wouter";
import { Menu, X } from "lucide-react";
import { useLocale } from "@/contexts/LocaleContext";
import { BRAND } from "@/lib/brand";

export function SiteHeader() {
  const { t, locale, setLocale } = useLocale();
  const [mobileOpen, setMobileOpen] = useState(false);
  const navItems = [
    { href: "/guitars", label: t("FONZO SHOP", "FONZO SHOP"), featured: true },
    { href: "/works", label: t("ผลงาน", "Works") },
    { href: "/artists", label: t("ศิลปิน", "Artists") },
    { href: "/dealers", label: t("ตัวแทนจำหน่าย", "Dealers") },
    { href: "/contact", label: t("ติดต่อเรา", "Contact") },
  ];

  const closeMobile = () => setMobileOpen(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-cream/10 bg-ink/95 backdrop-blur-md">
      <div className="mx-auto flex min-h-[4.5rem] max-w-[1400px] items-center gap-3 px-4 py-3 sm:px-6 lg:px-10">
        <Link href="/" className="flex min-w-0 shrink-0 items-center gap-2.5 transition-opacity hover:opacity-80" onClick={closeMobile}>
          <img
            src={BRAND.logo}
            alt="Fonzo Guitar logo"
            className="h-8 w-auto max-w-[2.2rem] object-contain drop-shadow sm:h-9 sm:max-w-[2.5rem]"
            onError={event => { event.currentTarget.style.display = "none"; }}
          />
          <span className="whitespace-nowrap font-display text-base tracking-[0.12em] text-cream sm:text-xl">Fonzo Guitar</span>
        </Link>

        <nav aria-label="Main navigation" className="hidden min-w-0 flex-1 items-center justify-end gap-1.5 text-[10px] tracking-[0.12em] text-cream/80 lg:flex xl:gap-2.5 xl:text-[11px]">
          {navItems.map(item => (
            <Link
              key={item.href}
              href={item.href}
              className={`inline-flex shrink-0 whitespace-nowrap rounded-sm px-1.5 py-2 transition-colors hover:text-gold xl:px-2 ${item.featured ? "font-semibold text-gold" : ""}`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex shrink-0 items-center gap-2">
          <button
            type="button"
            onClick={() => setLocale(locale === "th" ? "en" : "th")}
            className="rounded-full border border-cream/20 bg-white/5 px-2.5 py-1 text-[11px] text-cream transition hover:border-gold hover:text-gold sm:px-3 sm:text-xs"
            aria-label={locale === "th" ? "Switch to English" : "เปลี่ยนเป็นภาษาไทย"}
          >
            {locale === "th" ? "EN" : "TH"}
          </button>
          <button
            type="button"
            className="inline-flex h-9 w-9 items-center justify-center border border-cream/20 text-cream transition hover:border-gold hover:text-gold lg:hidden"
            onClick={() => setMobileOpen(value => !value)}
            aria-expanded={mobileOpen}
            aria-controls="mobile-main-navigation"
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
          >
            {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </div>

      <div id="mobile-main-navigation" className={`${mobileOpen ? "block" : "hidden"} border-t border-cream/10 bg-ink lg:hidden`}>
        <nav aria-label="Mobile navigation" className="mx-auto grid max-w-[1400px] gap-1 px-4 py-3 sm:px-6">
          {navItems.map(item => (
            <Link
              key={item.href}
              href={item.href}
              onClick={closeMobile}
              className={`block whitespace-nowrap px-3 py-3 text-xs tracking-[0.16em] transition-colors hover:bg-white/5 hover:text-gold ${item.featured ? "font-semibold text-gold" : "text-cream/80"}`}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
