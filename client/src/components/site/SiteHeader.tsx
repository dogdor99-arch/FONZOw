import { Link } from "wouter";
import { useLocale } from "@/contexts/LocaleContext";
import { BRAND } from "@/lib/brand";

export function SiteHeader() {
  const { t, locale, setLocale } = useLocale();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-cream/10 bg-ink/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-[1400px] items-center justify-between px-4 py-3.5 sm:px-6 lg:px-10">
        
        {/* Brand Logo & Name */}
        <Link href="/" className="flex items-center gap-3 transition-opacity hover:opacity-80">
            <img
              src={BRAND.logo}
              alt="Fonzo Logo"
              className="h-8 w-auto object-contain drop-shadow"
              onError={event => { event.currentTarget.style.display = "none"; }}
            />
          <span className="font-display text-xl tracking-wider text-cream">Fonzo Guitar</span>
        </Link>

        {/* Navigation Menu */}
        <nav className="hidden items-center gap-4 text-[11px] text-cream/80 lg:flex xl:gap-6">
          <Link href="/guitars" className="hover:text-gold transition">{t("GUITAR SHOP", "GUITAR SHOP")}</Link>
          <Link href="/guitar-custom" className="font-semibold text-gold hover:text-cream transition">{t("GUITAR CUSTOM", "GUITAR CUSTOM")}</Link>
          <Link href="/accessories" className="hover:text-gold transition">{t("อุปกรณ์เสริม", "Accessories")}</Link>
          <Link href="/works" className="hover:text-gold transition">{t("ผลงาน", "Works")}</Link>
          <Link href="/artists" className="hover:text-gold transition">{t("ศิลปิน", "Artists")}</Link>
          <Link href="/dealers" className="hover:text-gold transition">{t("ตัวแทนจำหน่าย", "Dealers")}</Link>
          <Link href="/contact" className="hover:text-gold transition">{t("ติดต่อเรา", "Contact")}</Link>
        </nav>

        {/* Language Switcher */}
        <button
          onClick={() => setLocale(locale === "th" ? "en" : "th")}
          className="rounded-full border border-cream/20 bg-white/5 px-3 py-1 text-xs text-cream hover:border-gold hover:text-gold transition"
        >
          {locale === "th" ? "EN" : "TH"}
        </button>

      </div>
    </header>
  );
}