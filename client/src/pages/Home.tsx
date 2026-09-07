import { Link } from "wouter";
import { ArrowUpRight, Award, Hammer, Sparkles } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useLocale } from "@/contexts/LocaleContext";
import { BRAND } from "@/lib/brand";
import { FONZO_CATEGORY_ICONS } from "@/lib/fonzoAssets";
import { Reveal } from "@/components/site/Reveal";
import { SectionHeading } from "@/components/site/SectionHeading";
import { Button } from "@/components/ui/button";

const MEDIA = "/api/fonzo-media";
const FOUNDER_PORTRAIT = `${MEDIA}/about_us/a7fd6d1b-2fc1-49f2-a426-b89c00e1a16c.jpg`;
const FOUNDER_IMAGE = `${MEDIA}/about_us/a7fd6d1b-2fc1-49f2-a426-b89c00e1a16c.jpg`;
const CRAFT_A = `${MEDIA}/album_img/b83efbc3-2917-40ce-9fc1-d9e68167a1f7.jpg`;
const CRAFT_B = `${MEDIA}/album_img/c2bce7da-465f-46a8-bb6a-81e1979f6867.jpg`;
const CRAFT_C = `${MEDIA}/album_img/b55095ca-101e-4191-9734-9a9573981355.jpg`;
const HERO_GUITAR_TEXTURE = `${MEDIA}/album_img/8b8eaac7-69a9-4c90-bb16-63e52a8f1e9f.jpg`;

const SHOP_PATHS = [
  { href: "/guitars/catalog", image: FONZO_CATEGORY_ICONS.ready.white, label: ["กีตาร์สำเร็จรูป", "Ready-to-play guitars"] },
  { href: "/guitar-custom", image: FONZO_CATEGORY_ICONS.custom.white, label: ["กีตาร์สั่งทำ", "Guitar Custom"] },
  { href: "/accessories", image: FONZO_CATEGORY_ICONS.accessories.white, label: ["คาโป้และอุปกรณ์", "Capos & accessories"] },
];


export default function Home() {
  const { locale, t } = useLocale();
  const { data: types = [] } = trpc.fonzo.guitars.types.useQuery();

  return (
    <>
      <section className="surface-deep relative overflow-hidden">
        <div className="absolute inset-0">
          <img src={HERO_GUITAR_TEXTURE} alt="" className="h-full w-full object-cover object-center opacity-25 grayscale" />
          <div className="absolute inset-0 bg-linear-to-r from-ink/90 via-ink/90 to-ink/72" />
          <div className="absolute inset-0 bg-linear-to-t from-ink via-transparent to-ink/25" />
        </div>
        <div className="relative mx-auto grid max-w-[1400px] items-center gap-10 px-4 pb-16 pt-12 sm:px-6 lg:grid-cols-[1.2fr_0.8fr] lg:gap-10 lg:px-10 lg:pb-20 lg:pt-16">
          <div className="max-w-4xl">
            <Reveal><p className="eyebrow text-gold/85">{t("ตั้งแต่ พ.ศ. 2560 · กรุงเทพฯ", "Est. 2017 · Bangkok")}</p></Reveal>
            <Reveal delay={70}><h1 className="mt-7 max-w-3xl text-[2.6rem] leading-[1.02] text-cream sm:text-[3.6rem] lg:text-[4.75rem]">FONZO GUITAR<br /><em className="not-italic text-gold">world-class guitar of Thailand</em></h1></Reveal>
            <Reveal delay={130}><p className="mt-9 max-w-xl text-[15px] leading-[1.95] text-cream/70">{t("โดย เบิร์ด-เอกชัย เจียรกุล คนไทยและคนเอเชียคนแรกที่ได้รับรางวัลชนะเลิศกีตาร์คลาสสิก ‘GFA Guitar Foundation of America International Concert Artist Competition 2014’ รางวัลทรงเกียรติอันถือเป็นที่สุดของการแข่งขันกีตาร์คลาสสิกระดับโลก", "By Bird-Ekachai Jearakul — the first Thai and Asian winner of the GFA Guitar Foundation of America International Concert Artist Competition 2014, one of the world's most prestigious classical guitar competitions.")}</p></Reveal>
            <Reveal delay={190}><div className="mt-10 flex flex-wrap gap-3"><Button asChild className="press h-12 rounded-none bg-cream px-8 text-[11px] font-semibold tracking-[0.2em] text-ink uppercase hover:bg-cream/90"><Link href="/brand-story">{t("ข้อมูลเกี่ยวกับแบรนด์", "About the brand")}</Link></Button><Button asChild variant="outline" className="press h-12 rounded-none border-cream/30 px-8 text-[11px] font-semibold tracking-[0.2em] text-cream uppercase hover:border-gold hover:bg-cream/5 hover:text-gold"><Link href="/brand-presentation">{t("พรีเซนเทชั่นของแบรนด์", "Brand presentation")}</Link></Button></div></Reveal>
          </div>
          <Reveal delay={150}><div className="flex items-center justify-center lg:justify-start lg:pl-8"><img src={BRAND.logo} alt="Fonzo Guitar" className="w-full max-w-[10rem] object-contain opacity-100 drop-shadow-[0_16px_38px_rgba(0,0,0,0.45)] sm:max-w-[13rem] lg:max-w-[15rem]" /></div></Reveal>
        </div>
      </section>

      <section aria-label={t("เลือกทางเข้าร้าน", "Choose a shop category")} className="surface-deep relative overflow-hidden border-y border-cream/10"><div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(194,151,78,0.12),transparent_54%)]" /><div className="relative mx-auto flex max-w-[1400px] flex-col items-center gap-2 px-4 py-3 sm:flex-row sm:justify-between sm:gap-4 sm:px-6 sm:py-5 lg:px-10 lg:py-7"><p className="eyebrow shrink-0 text-gold">FONZO SHOP</p><div className="flex items-center justify-center gap-2 sm:justify-end sm:gap-4 lg:gap-6">{SHOP_PATHS.map(item => <Link key={item.href} href={item.href} aria-label={t(item.label[0], item.label[1])} className="group relative flex h-20 w-20 items-center justify-center rounded-full border border-cream/15 p-3 transition duration-300 hover:-translate-y-1 hover:border-gold hover:bg-cream/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold sm:h-28 sm:w-28 sm:p-4 lg:h-36 lg:w-36 lg:p-5"><img src={item.image} alt="" className="h-full w-full object-contain opacity-90 transition duration-300 group-hover:scale-0 group-hover:opacity-0" /><span className="pointer-events-none absolute inset-0 flex items-center justify-center px-2 text-center text-[10px] leading-tight tracking-[0.1em] text-cream opacity-0 transition duration-300 group-hover:opacity-100">{t(item.label[0], item.label[1])}</span></Link>)}</div></div></section>

      <section className="rule-top bg-cream/50"><div className="mx-auto grid max-w-[1400px] items-center gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16 lg:px-10 lg:py-16"><Reveal><div className="relative overflow-hidden"><img src={FOUNDER_IMAGE} alt={t(BRAND.founder.th, BRAND.founder.en)} className="w-full object-cover object-[center_18%]" /><div className="pointer-events-none absolute -right-5 -bottom-5 hidden h-28 w-28 border border-gold/50 lg:block" /></div></Reveal><Reveal delay={80}><div className="flex items-baseline gap-4"><span className="section-index">05</span><p className="eyebrow">{t("ผู้ก่อตั้ง", "Founder")}</p></div><h2 className="mt-4 text-3xl sm:text-[2.6rem]">{locale === "th" ? BRAND.founder.th : BRAND.founder.en}</h2><blockquote className="mt-6 border-l border-gold/60 pl-6 font-display text-xl leading-relaxed italic">{t("“สำหรับผม กีตาร์ไม่ใช่เพียงเครื่องดนตรี แต่มันคือชีวิตทั้งหมด คือหัวใจและจิตวิญญาณในตัวผม”", "“For me, the guitar is not just an instrument; it is my whole life, the heart and soul within me.”")}</blockquote><p className="mt-6 text-[15px] leading-[1.9] text-muted-foreground">{t("ทุกปีเบิร์ดเดินทางไปพบช่างทำกีตาร์ระดับโลกในหลายประเทศ นำองค์ความรู้และประสบการณ์เหล่านั้นมาสร้างแบรนด์กีตาร์ของตัวเอง เพื่อให้ผู้ที่รักกีตาร์ได้ครอบครองเครื่องดนตรีคุณภาพสูงในราคาที่สมเหตุสมผล", "Each year Bird travels to meet some of the world's finest luthiers, translating that knowledge into his own guitar brand so players can own a top-quality instrument at a reasonable price.")}</p><div className="mt-7"><Button asChild variant="outline" className="press h-11 rounded-none border-foreground/25 px-6 text-[11px] tracking-[0.18em] uppercase hover:border-brand hover:text-brand"><Link href="/founder">{t("อ่านประวัติผู้ก่อตั้ง", "Read the founder story")}</Link></Button></div></Reveal></div></section>

      <section className="rule-top bg-cream/50"><div className="mx-auto max-w-[1400px] px-4 py-12 sm:px-6 lg:px-10 lg:py-16"><Reveal><SectionHeading eyebrow={t("เหตุผลที่ควรเลือก Fonzo", "Why choose Fonzo")} title={t("งานฝีมือที่วัดได้ในทุกมิลลิเมตร", "Craft you can measure")} description={t("ทุกตัวถูกทดลองเล่นและปรับเสียงก่อนออกจำหน่าย โดยยึดมาตรฐานเดียวกับกีตาร์ระดับคอนเสิร์ต", "Every instrument is played, voiced and checked to concert-grade standards before it leaves the workshop.")} /></Reveal><div className="mt-10 grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center lg:gap-14"><div className="grid grid-cols-2 gap-3"><Reveal><img src={CRAFT_B} alt="" loading="lazy" className="aspect-3/4 w-full object-cover" /></Reveal><div className="grid gap-3"><Reveal delay={70}><img src={CRAFT_A} alt="" loading="lazy" className="aspect-4/3 w-full object-cover" /></Reveal><Reveal delay={130}><img src={CRAFT_C} alt="" loading="lazy" className="aspect-4/3 w-full object-cover" /></Reveal></div></div><div className="divide-y divide-border/70">{[{ icon: Award, title: t("ออกแบบโดยศิลปินระดับโลก", "Designed by a world-class artist"), body: t("ทุกรุ่นผ่านการทดลองเล่นและปรับแต่งโดยเบิร์ด เอกชัย เจียรกุล ก่อนออกจำหน่าย", "Every model is played, tested and voiced by Bird Ekachai Jearakul before release.") }, { icon: Hammer, title: t("โครงสร้างระดับช่างทำมือ", "Luthier-grade construction"), body: t("โครงสร้างอ้างอิงจากช่างทำชื่อดังในสเปน เยอรมัน และอเมริกา ทั้งแบบดั้งเดิมและสมัยใหม่", "Bracing referenced from renowned makers in Spain, Germany and the USA — traditional and modern.") }, { icon: Sparkles, title: t("การันตีคุณภาพเสียง", "Guaranteed tone"), body: t("คัดเลือกไม้และวัสดุคุณภาพสูง พร้อมตรวจสอบเสียงทุกตัวก่อนส่งมอบให้ลูกค้า", "High-grade tonewoods, with each instrument sound-checked before delivery.") }].map((item, index) => <Reveal key={item.title} delay={index * 70}><div className="flex gap-6 py-8 first:pt-0 last:pb-0"><item.icon className="mt-1 h-5 w-5 shrink-0 text-gold" strokeWidth={1.4} /><div><h3 className="font-display text-xl leading-snug">{item.title}</h3><p className="mt-3 text-sm leading-[1.9] text-muted-foreground">{item.body}</p></div></div></Reveal>)}</div></div></div></section>

      <section className="rule-top bg-cream/50"><div className="mx-auto max-w-[1400px] px-4 py-20 sm:px-6 lg:px-10 lg:py-28"><Reveal><SectionHeading eyebrow={t("FONZO Collection", "FONZO Collection")} title={t("FONZO Collection", "FONZO Collection")} action={{ label: t("ดูทั้งหมด", "View all"), href: "/guitars/catalog" }} /></Reveal><div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{types.map((type, index) => <Reveal key={type.code} delay={index * 60}><Link href={`/guitars/catalog?type=${type.code}`} className="group lift block"><div className="relative aspect-4/5 overflow-hidden bg-secondary">{type.image && <img src={type.image} alt={type.name} loading="lazy" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.06]" />}<div className="absolute inset-0 bg-linear-to-t from-ink/85 via-ink/15 to-transparent" /><div className="absolute inset-x-0 bottom-0 p-5"><h3 className="mt-1.5 flex items-center gap-2 font-display text-2xl text-cream">{type.name}<ArrowUpRight className="h-4 w-4 -translate-x-1 opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100" /></h3></div></div></Link></Reveal>)}</div></div></section>
    </>
  );
}
