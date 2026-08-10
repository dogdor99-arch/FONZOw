import { Link } from "wouter";
import { useLocale } from "@/contexts/LocaleContext";

// โลโก้ Fonzo ตัวจริงจากไฟล์ F.png (Base64) คมชัด ไม่แตก 100%
export const FONZO_LOGO_BASE64 = "/fonzo-logo.png";

export function SiteHeader() {
  const { t, locale, setLocale } = useLocale();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-cream/10 bg-ink/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-[1400px] items-center justify-between px-4 py-3.5 sm:px-6 lg:px-10">
        
        {/* Brand Logo & Name */}
        <Link href="/" className="flex items-center gap-3 transition-opacity hover:opacity-80">
          <div className="flex h-10 w-10 items-center justify-center rounded-full border border-gold/40 bg-black/80 p-1.5 shadow-inner">
            <img 
              src={FONZO_LOGO_BASE64} 
              alt="Fonzo Logo" 
              className="h-full w-full object-contain filter brightness-0 invert drop-shadow" 
            />
          </div>
          <span className="font-display text-xl tracking-wider text-cream">Fonzo Guitar</span>
        </Link>

        {/* Navigation Menu */}
        <nav className="hidden md:flex items-center gap-8 text-sm text-cream/80">
          <Link href="/guitars" className="hover:text-gold transition">{t("กีตาร์ทั้งหมด", "Guitars")}</Link>
          <Link href="/accessories" className="hover:text-gold transition">{t("อุปกรณ์เสริม", "Accessories")}</Link>
          <Link href="/dealers" className="hover:text-gold transition">{t("ตัวแทนจำหน่าย", "Dealers")}</Link>
          <Link href="/founder" className="hover:text-gold transition">{t("เรื่องราวแบรนด์", "Our Story")}</Link>
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