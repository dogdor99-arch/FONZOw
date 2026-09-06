import { ArrowDown, ArrowUpRight, BookOpen, ChevronRight, ExternalLink, ShieldCheck, Sparkles } from "lucide-react";
import { Link } from "wouter";
import { useLocale } from "@/contexts/LocaleContext";
import { Reveal } from "@/components/site/Reveal";
import { PRESENTATION_CHAPTERS, PRESENTATION_PAGES, presentationShopHref } from "@/lib/presentationData";

const pageMap = new Map(PRESENTATION_PAGES.map(page => [page.page, page]));

export default function BrandPresentation() {
  const { locale, t } = useLocale();

  return (
    <main className="bg-ink text-cream">
      <section className="relative isolate overflow-hidden border-b border-cream/10">
        <img src="/presentation/pages/page-01.jpg" alt="Fonzo Guitar brand presentation" className="absolute inset-0 -z-20 h-full w-full object-cover opacity-30" />
        <div className="absolute inset-0 -z-10 bg-linear-to-b from-ink/65 via-ink/90 to-ink" />
        <div className="mx-auto max-w-[1400px] px-4 pb-20 pt-16 sm:px-6 lg:px-10 lg:pb-28 lg:pt-24">
          <Reveal><p className="eyebrow text-gold">FONZO GUITAR · BRAND PRESENTATION</p></Reveal>
          <Reveal delay={70}><h1 className="mt-7 max-w-4xl font-display text-5xl leading-[0.94] sm:text-7xl lg:text-[8rem]">Luxury in<br /><em className="text-gold">every detail</em></h1></Reveal>
          <Reveal delay={130}><p className="mt-8 max-w-2xl text-base leading-relaxed text-cream/70 sm:text-lg">{t("เรื่องราวของแบรนด์ งานฝีมือ ไม้ เสียง รุ่นกีตาร์ ศิลปิน และการดูแลรักษา เรียบเรียงจาก Fonzo Guitar Presentation ให้ชมได้บนเว็บทั้งคอมพิวเตอร์และมือถือ", "The Fonzo Guitar story, craft, tonewoods, models, players and care guidance — re-edited from the Fonzo Guitar Presentation for a responsive web reading experience.")}</p></Reveal>
          <Reveal delay={190}><div className="mt-10 flex flex-wrap gap-3"><a href="#presentation-index" className="press inline-flex h-12 items-center gap-3 bg-cream px-7 text-[11px] font-semibold tracking-[0.18em] text-ink uppercase transition hover:bg-gold"><BookOpen className="h-4 w-4" />{t("เริ่มอ่าน Presentation", "Start reading")}</a><Link href="/guitar-custom" className="press inline-flex h-12 items-center gap-3 border border-cream/25 px-7 text-[11px] font-semibold tracking-[0.18em] text-cream uppercase transition hover:border-gold hover:text-gold">{t("ไป Guitar Custom", "Explore Guitar Custom")}<ArrowUpRight className="h-4 w-4" /></Link></div></Reveal>
          <a href="#presentation-index" aria-label="Scroll to presentation index" className="mt-16 inline-flex items-center gap-3 text-[10px] tracking-[0.18em] text-cream/55 uppercase"><ArrowDown className="h-4 w-4 text-gold" />{t("เลื่อนเพื่อดูเนื้อหา", "Scroll to explore")}</a>
        </div>
      </section>

      <section id="presentation-index" className="border-b border-cream/10 bg-ink px-4 py-14 sm:px-6 lg:px-10 lg:py-20">
        <div className="mx-auto max-w-[1400px]">
          <div className="flex flex-col justify-between gap-5 border-b border-cream/15 pb-7 sm:flex-row sm:items-end"><div><p className="eyebrow text-gold">FONZO / 32 PAGES</p><h2 className="mt-3 font-display text-3xl sm:text-5xl">{t("สารบัญเรื่องราว", "Story index")}</h2></div><p className="max-w-md text-sm leading-relaxed text-cream/55">{t("เลือกบทที่ต้องการอ่าน หรือเลื่อนต่อเพื่อชมภาพและข้อมูลทั้งหมดจาก Presentation ต้นฉบับ", "Choose a chapter or continue scrolling through all the imagery and information from the original presentation.")}</p></div>
          <div className="mt-8 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">{PRESENTATION_CHAPTERS.map((chapter, index) => <a key={chapter.id} href={`#${chapter.id}`} className="group flex min-h-24 items-end justify-between border border-cream/10 p-4 transition hover:border-gold/70 hover:bg-cream/5"><span><span className="block text-[10px] tracking-[0.16em] text-gold">{chapter.eyebrow}</span><span className="mt-2 block font-display text-lg leading-tight text-cream/90">{chapter.title}</span></span><ChevronRight className="h-4 w-4 text-cream/30 transition group-hover:translate-x-1 group-hover:text-gold" /></a>)}</div>
        </div>
      </section>

      <section className="bg-cream text-ink">
        <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-10">{PRESENTATION_CHAPTERS.map((chapter, chapterIndex) => <article id={chapter.id} key={chapter.id} className="scroll-mt-10 border-b border-ink/10 py-20 sm:py-28 lg:py-36"><div className="grid gap-12 lg:grid-cols-[0.72fr_1.28fr] lg:gap-20"><Reveal><div className="lg:sticky lg:top-24"><p className="eyebrow text-brand">{chapter.eyebrow}</p><h2 className="mt-5 max-w-xl font-display text-4xl leading-[0.95] sm:text-6xl">{chapter.title}</h2><p className="mt-7 max-w-lg text-[15px] leading-[1.9] text-muted-foreground">{chapter.intro}</p><div className="mt-8 space-y-3">{chapter.highlights.map(highlight => <div key={highlight} className="flex gap-3 text-sm leading-relaxed"><Sparkles className="mt-1 h-4 w-4 shrink-0 text-brand" />{highlight}</div>)}</div>{chapter.products && <div className="mt-9 flex flex-wrap gap-2">{chapter.products.map(product => <Link key={product.label} href={presentationShopHref(product.search, product.family)} className="inline-flex items-center gap-2 border border-ink/20 px-3 py-2 text-[10px] tracking-[0.12em] uppercase transition hover:border-brand hover:text-brand">{product.label}<ArrowUpRight className="h-3.5 w-3.5" /></Link>)}</div>}</div></Reveal><div><div className="grid gap-5 sm:grid-cols-2">{chapter.pages.map(pageNumber => { const page = pageMap.get(pageNumber)!; return <Reveal key={page.page} delay={(page.page % 3) * 60}><figure className={`group overflow-hidden bg-secondary ${chapterIndex === 0 && page.page === 1 ? "sm:col-span-2" : ""}`}><img src={page.image} alt={`${chapter.title} — PDF page ${page.page}`} loading={page.page < 3 ? "eager" : "lazy"} className="w-full transition duration-700 group-hover:scale-[1.02]" /><figcaption className="flex items-center justify-between bg-ink px-4 py-3 text-[10px] tracking-[0.14em] text-cream/65 uppercase"><span>Fonzo presentation</span><span>Page {String(page.page).padStart(2, "0")}</span></figcaption></figure></Reveal>})}</div></div></div></article>)}</div>
      </section>

      <section className="bg-ink px-4 py-20 sm:px-6 lg:px-10 lg:py-28"><div className="mx-auto grid max-w-[1400px] items-center gap-10 lg:grid-cols-[1fr_auto]"><div><div className="flex items-center gap-3 text-gold"><ShieldCheck className="h-5 w-5" /><span className="eyebrow">{t("Warranty & Care", "Warranty & Care")}</span></div><h2 className="mt-4 max-w-3xl font-display text-3xl text-cream sm:text-5xl">{t("ดูแลเสียงของคุณให้เดินทางไกล", "Keep your sound travelling further")}</h2><p className="mt-5 max-w-2xl text-sm leading-relaxed text-cream/60">{t("เก็บกีตาร์ในความชื้นประมาณ 45–50% ตรวจสอบความพร้อมก่อนส่งมอบ และติดต่อ FONZO ได้เมื่ออยาก setup ทำความสะอาด ซ่อมแซม หรือเปลี่ยนชิ้นส่วน", "Store the guitar around 45–50% humidity, rely on our pre-shipment inspection, and contact FONZO for setup, cleaning, repair or parts service.")}</p></div><Link href="/contact" className="inline-flex h-12 items-center justify-center gap-3 border border-cream/25 px-7 text-[11px] tracking-[0.18em] text-cream uppercase transition hover:border-gold hover:text-gold">{t("ติดต่อ FONZO", "Contact FONZO")}<ExternalLink className="h-4 w-4" /></Link></div></section>
    </main>
  );
}
