import { useMemo, useState } from "react";
import { CalendarDays, ChevronDown, Images, MoveRight, Users } from "lucide-react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { useLocale } from "@/contexts/LocaleContext";
import { Reveal } from "@/components/site/Reveal";

type WorkItem = {
  id: number;
  kind: string;
  title: string;
  titleEn?: string | null;
  description?: string | null;
  descriptionEn?: string | null;
  imageUrl?: string | null;
  imageUrls?: string[] | null;
  eventDate?: string | null;
  sourceUrl?: string | null;
};

function WorkCard({ item, index }: { item: WorkItem; index: number }) {
  const { locale } = useLocale();
  const title = locale === "th" ? item.title : item.titleEn || item.title;
  const image = item.imageUrl || item.imageUrls?.[0];
  return <Reveal key={item.id} delay={index * 45}><article className="group overflow-hidden border border-border/80 bg-card transition hover:-translate-y-1 hover:border-brand/50 hover:shadow-lg"><Link href={`/works/${item.id}`} className="block"><div className="aspect-[5/4] overflow-hidden bg-secondary">{image ? <img src={image} alt={title} loading="lazy" className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.04]" /> : <div className="flex h-full items-center justify-center text-muted-foreground"><Images className="h-8 w-8" strokeWidth={1.2} /></div>}</div><div className="flex items-center justify-between gap-3 p-3 sm:p-4"><h3 className="min-w-0 truncate font-display text-lg leading-tight sm:text-xl">{title}</h3>{item.eventDate && <span className="inline-flex shrink-0 items-center gap-1 text-[10px] tracking-[0.08em] text-brand"><CalendarDays className="h-3 w-3" />{item.eventDate}</span>}</div></Link></article></Reveal>;
}

function WorksRail({ items, emptyLabel, showAll }: { items: WorkItem[]; emptyLabel: string; showAll: boolean }) {
  if (!items.length) return <div className="border border-dashed border-border bg-card p-8 text-center text-sm text-muted-foreground">{emptyLabel}</div>;
  return <div className={showAll ? "grid gap-5 sm:grid-cols-2" : "flex snap-x gap-4 overflow-x-auto pb-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"}>{items.map((item, index) => <div key={item.id} className={showAll ? "" : "w-[88vw] max-w-[440px] shrink-0 snap-start sm:w-[48vw]"}><WorkCard item={item} index={index} /></div>)}</div>;
}

export default function Works() {
  const { t } = useLocale();
  const { data: works = [], isLoading } = trpc.works.list.useQuery();
  const events = useMemo(() => works.filter(item => item.kind === "event") as WorkItem[], [works]);
  const students = useMemo(() => works.filter(item => item.kind === "student") as WorkItem[], [works]);
  const [expanded, setExpanded] = useState<"both" | "events" | "students">("both");
  const [showAll, setShowAll] = useState<"events" | "students" | null>(null);

  const toggle = (section: "events" | "students") => { setExpanded(expanded === section ? "both" : section); setShowAll(null); };
  const renderSection = (section: "events" | "students", items: WorkItem[], icon: typeof CalendarDays, title: string, emptyLabel: string) => {
    const isExpanded = expanded === "both" || expanded === section;
    const Icon = icon;
    const controlLabel = !isExpanded ? t("เปิดดูทั้งหมด", "Open all") : showAll === section ? t("ย่อรายการ", "Show less") : t("แสดงทั้งหมด", "Show all");
    const handleControl = () => { if (!isExpanded) { setExpanded(section); setShowAll(section); } else if (showAll === section) setShowAll(null); else { setExpanded(section); setShowAll(section); } };
    return <article className={`transition-all duration-300 ${isExpanded ? "" : "border-b border-border/70 pb-3"}`}><div className="flex items-center justify-between gap-3"><button type="button" onClick={() => toggle(section)} className="flex min-w-0 items-center gap-2 text-left"><Icon className="h-3.5 w-3.5 shrink-0 text-brand" /><span className={`font-display ${isExpanded ? "text-xl sm:text-2xl" : "text-base sm:text-lg"}`}>{title}</span></button><button type="button" onClick={handleControl} className="inline-flex shrink-0 items-center gap-1.5 text-[9px] font-semibold tracking-[0.12em] text-brand uppercase transition hover:text-gold">{controlLabel}<MoveRight className="h-3 w-3" /></button></div>{isExpanded && <div className="mt-3 border-t border-border/70 pt-4"><div className="mb-3 text-[10px] text-muted-foreground">{items.length} {t("รายการ", "items")}</div>{isLoading ? <div className="grid gap-5 sm:grid-cols-2">{[1, 2, 3].map(item => <div key={item} className="aspect-[5/4] animate-pulse bg-secondary" />)}</div> : <WorksRail items={items} emptyLabel={emptyLabel} showAll={showAll === section} />}</div>}</article>;
  };

  return <><div className="border-b border-border/70 bg-cream/40 px-4 py-4 sm:px-6 lg:px-10"><div className="mx-auto max-w-[1400px] lg:pl-12"><p className="text-[9px] tracking-[0.14em] text-muted-foreground uppercase">{t("หน้าแรก", "Home")} <span className="mx-1.5 text-brand">›</span> Works</p><h1 className="mt-2 font-display text-3xl leading-none sm:text-4xl">Works</h1></div></div><section className="mx-auto max-w-[1400px] px-4 pb-12 pt-3 sm:px-6 lg:px-10 lg:pb-16 lg:pt-5"><div className="grid items-stretch gap-8 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:gap-12"><div className="relative min-h-[30rem] overflow-hidden bg-secondary md:min-h-0"><img src="/works-student-feature.jpg" alt={t("ผลงานนักเรียน", "Student work")} className="h-full w-full object-cover" /></div><div className="flex min-w-0 flex-col justify-center gap-5">{renderSection("students", students, Users, t("นักเรียนของคุณเบิร์ด", "Bird's students"), t("ยังไม่มีข้อมูลนักเรียนในระบบ — เพิ่มได้จาก Admin", "No student profiles yet — add them from Admin."))}{renderSection("events", events, CalendarDays, t("การออกบูทและกิจกรรมของแบรนด์", "Brand events"), t("ยังไม่มี Event ในระบบ — เพิ่มได้จาก Admin", "No events yet — add them from Admin."))}</div></div></section></>;
}
