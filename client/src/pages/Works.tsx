import { useMemo } from "react";
import { CalendarDays, ExternalLink, Images, MoveRight, Users } from "lucide-react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { useLocale } from "@/contexts/LocaleContext";
import { Reveal } from "@/components/site/Reveal";

function WorksRail({ items, emptyLabel }: { items: any[]; emptyLabel: string }) {
  const { locale, t } = useLocale();
  if (!items.length) return <div className="border border-dashed border-border bg-card p-10 text-center text-sm text-muted-foreground">{emptyLabel}</div>;

  return <div>
    <div className="grid gap-5 md:grid-cols-3">
      {items.map((item, index) => {
        const title = locale === "th" ? item.title : item.titleEn || item.title;
        const description = locale === "th" ? item.description : item.descriptionEn || item.description;
        const image = item.imageUrl || item.imageUrls?.[0];
        return <Reveal key={item.id} delay={index * 60}><article className="group overflow-hidden border border-border/80 bg-card transition hover:-translate-y-1 hover:border-brand/50 hover:shadow-lg"><Link href={`/works/${item.id}`} className="block"><div className="aspect-[4/3] overflow-hidden bg-secondary">{image ? <img src={image} alt={title} loading="lazy" className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.04]" /> : <div className="flex h-full items-center justify-center text-muted-foreground"><Images className="h-8 w-8" strokeWidth={1.2} /></div>}</div></Link><Link href={`/works/${item.id}`} className="block"><div className="p-5"><div className="flex flex-wrap items-center gap-3 text-[10px] tracking-[0.14em] text-brand uppercase">{item.eventDate && <span className="inline-flex items-center gap-1.5"><CalendarDays className="h-3.5 w-3.5" />{item.eventDate}</span>}<span>FONZO / {item.kind === "student" ? "STUDENT" : "EVENT"}</span></div><h3 className="mt-3 font-display text-2xl leading-tight">{title}</h3>{description && <p className="mt-3 line-clamp-4 text-sm leading-relaxed text-muted-foreground">{description}</p>}<span className="mt-5 inline-flex items-center gap-2 text-[10px] font-semibold tracking-[0.14em] text-brand uppercase">{t("ดูข้อมูลแบบเต็ม", "View full details")}<MoveRight className="h-3.5 w-3.5" /></span>{item.sourceUrl && <span className="mt-3 flex items-center gap-2 text-[10px] font-semibold tracking-[0.14em] text-muted-foreground uppercase">{t("มีลิงก์ต้นฉบับ", "Original link available")}<ExternalLink className="h-3.5 w-3.5" /></span>}</div></Link></article></Reveal>;
      })}
    </div>
  </div>;
}

export default function Works() {
  const { t } = useLocale();
  const { data: works = [], isLoading } = trpc.works.list.useQuery();
  const events = useMemo(() => works.filter(item => item.kind === "event"), [works]);
  const students = useMemo(() => works.filter(item => item.kind === "student"), [works]);

  return <>
    <div className="border-b border-border/70 bg-cream/40 px-4 py-4 sm:px-6 lg:px-10"><div className="mx-auto max-w-[1500px]"><p className="text-[9px] tracking-[0.14em] text-muted-foreground uppercase">{t("หน้าแรก", "Home")} <span className="mx-1.5 text-brand">›</span> Works</p><p className="mt-2 text-[10px] tracking-[0.16em] text-brand uppercase">{t("ผลงานของแบรนด์", "Brand works")}</p><h1 className="mt-1 font-display text-3xl leading-none sm:text-4xl">Works</h1></div></div>
    <section className="mx-auto max-w-[1400px] px-4 pb-12 pt-2 sm:px-6 lg:px-10 lg:pb-18 lg:pt-4"><div className="space-y-20">
      <article><div className="mb-7 flex items-end justify-between gap-5 border-b border-border/70 pb-5"><div><p className="eyebrow inline-flex items-center gap-2"><CalendarDays className="h-3.5 w-3.5" /> Events</p><h2 className="mt-2 font-display text-3xl sm:text-4xl">{t("การออกบูทและกิจกรรมของแบรนด์", "Brand events")}</h2></div><span className="hidden text-xs text-muted-foreground sm:block">{t("แสดงทั้งหมด", "All events")}</span></div>{isLoading ? <div className="grid gap-5 md:grid-cols-3">{[1, 2, 3].map(item => <div key={item} className="aspect-[4/3] animate-pulse bg-secondary" />)}</div> : <WorksRail items={events} emptyLabel={t("ยังไม่มี Event ในระบบ — เพิ่มได้จาก Admin", "No events yet — add them from Admin.")} />}</article>
      <article><div className="mb-7 flex items-end justify-between gap-5 border-b border-border/70 pb-5"><div><p className="eyebrow inline-flex items-center gap-2"><Users className="h-3.5 w-3.5" /> Students</p><h2 className="mt-2 font-display text-3xl sm:text-4xl">{t("นักเรียนของคุณเบิร์ด", "Bird's students")}</h2></div></div>{isLoading ? <div className="grid gap-5 md:grid-cols-3">{[1, 2, 3].map(item => <div key={item} className="aspect-[4/3] animate-pulse bg-secondary" />)}</div> : <WorksRail items={students} emptyLabel={t("ยังไม่มีข้อมูลนักเรียนในระบบ — เพิ่มได้จาก Admin", "No student profiles yet — add them from Admin.")} />}</article>
    </div></section>
  </>;
}
