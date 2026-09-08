import { useMemo, useState } from "react";
import { CalendarDays, ChevronDown, ExternalLink, Images, MoveRight, Users } from "lucide-react";
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
  const { locale, t } = useLocale();
  const title = locale === "th" ? item.title : item.titleEn || item.title;
  const description = locale === "th" ? item.description : item.descriptionEn || item.description;
  const image = item.imageUrl || item.imageUrls?.[0];
  return <Reveal key={item.id} delay={index * 45}><article className="group overflow-hidden border border-border/80 bg-card transition hover:-translate-y-1 hover:border-brand/50 hover:shadow-lg"><Link href={`/works/${item.id}`} className="block"><div className="aspect-[4/3] overflow-hidden bg-secondary">{image ? <img src={image} alt={title} loading="lazy" className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.04]" /> : <div className="flex h-full items-center justify-center text-muted-foreground"><Images className="h-8 w-8" strokeWidth={1.2} /></div>}</div></Link><Link href={`/works/${item.id}`} className="block"><div className="p-4 sm:p-5"><div className="flex flex-wrap items-center gap-3 text-[10px] tracking-[0.14em] text-brand uppercase">{item.eventDate && <span className="inline-flex items-center gap-1.5"><CalendarDays className="h-3.5 w-3.5" />{item.eventDate}</span>}<span>FONZO / {item.kind === "student" ? "STUDENT" : "EVENT"}</span></div><h3 className="mt-3 font-display text-xl leading-tight sm:text-2xl">{title}</h3>{description && <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-muted-foreground">{description}</p>}<span className="mt-4 inline-flex items-center gap-2 text-[10px] font-semibold tracking-[0.14em] text-brand uppercase">{t("ดูข้อมูลแบบเต็ม", "View full details")}<MoveRight className="h-3.5 w-3.5" /></span>{item.sourceUrl && <span className="mt-3 flex items-center gap-2 text-[10px] font-semibold tracking-[0.14em] text-muted-foreground uppercase">{t("มีลิงก์ต้นฉบับ", "Original link available")}<ExternalLink className="h-3.5 w-3.5" /></span>}</div></Link></article></Reveal>;
}

function WorksRail({ items, emptyLabel, showAll }: { items: WorkItem[]; emptyLabel: string; showAll: boolean }) {
  if (!items.length) return <div className="border border-dashed border-border bg-card p-8 text-center text-sm text-muted-foreground">{emptyLabel}</div>;
  return <div className={showAll ? "grid gap-5 sm:grid-cols-2 lg:grid-cols-3" : "flex snap-x gap-4 overflow-x-auto pb-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"}>{items.map((item, index) => <div key={item.id} className={showAll ? "" : "w-[82vw] max-w-[360px] shrink-0 snap-start sm:w-[45vw] md:w-[31%]"}><WorkCard item={item} index={index} /></div>)}</div>;
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
    return <article className={`transition-all duration-300 ${isExpanded ? "" : "border-b border-border/70 pb-3"}`}><button type="button" onClick={() => toggle(section)} className="flex w-full items-center justify-between gap-4 text-left"><span className="flex min-w-0 items-center gap-3"><Icon className="h-4 w-4 shrink-0 text-brand" /><span className={`font-display ${isExpanded ? "text-2xl sm:text-4xl" : "text-lg sm:text-xl"}`}>{title}</span></span><span className="flex shrink-0 items-center gap-3 text-[10px] font-semibold tracking-[0.14em] text-brand uppercase"><span className="hidden sm:inline">{isExpanded && expanded !== "both" ? t("ย่อหัวข้อนี้", "Collapse") : t("เปิดดู", "Open")}</span><ChevronDown className={`h-4 w-4 transition-transform ${isExpanded ? "rotate-180" : ""}`} /></span></button>{isExpanded && <div className="mt-5 border-t border-border/70 pt-5"><div className="mb-4 flex items-center justify-between gap-3"><span className="text-xs text-muted-foreground">{items.length} {t("รายการ", "items")}</span><button type="button" onClick={() => setShowAll(showAll === section ? null : section)} className="inline-flex items-center gap-2 text-[10px] font-semibold tracking-[0.14em] text-brand uppercase transition hover:text-gold">{showAll === section ? t("ย่อรายการ", "Show less") : t("แสดงทั้งหมด", "Show all")}<MoveRight className="h-3.5 w-3.5" /></button></div>{isLoading ? <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{[1, 2, 3].map(item => <div key={item} className="aspect-[4/3] animate-pulse bg-secondary" />)}</div> : <WorksRail items={items} emptyLabel={emptyLabel} showAll={showAll === section} />}</div>}</article>;
  };

  const studentImage = students[0]?.imageUrl || students[0]?.imageUrls?.[0];
  return <><div className="border-b border-border/70 bg-cream/40 px-4 py-4 sm:px-6 lg:px-10"><div className="mx-auto max-w-[1400px] lg:pl-12"><p className="text-[9px] tracking-[0.14em] text-muted-foreground uppercase">{t("หน้าแรก", "Home")} <span className="mx-1.5 text-brand">›</span> Works</p><h1 className="mt-2 font-display text-3xl leading-none sm:text-4xl">Works</h1></div></div><section className="mx-auto max-w-[1400px] px-4 pb-12 pt-3 sm:px-6 lg:px-10 lg:pb-16 lg:pt-5"><div className="mb-8 grid items-center gap-6 border-b border-border/70 pb-8 md:grid-cols-[minmax(180px,0.32fr)_1fr] md:gap-10"><div className="aspect-[4/3] overflow-hidden bg-secondary">{studentImage ? <img src={studentImage} alt={t("ผลงานนักเรียน", "Student work")} className="h-full w-full object-cover" /> : <div className="flex h-full items-center justify-center text-center text-xs text-muted-foreground">{t("เพิ่มภาพ 744782138... ในรายการนักเรียนจาก Admin", "Add 744782138... to a student item from Admin")}</div>}</div><div><p className="eyebrow text-brand">{t("ผลงานนักเรียนและผลงานของแบรนด์", "Student and brand work")}</p><p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">{t("ชมเรื่องราวผลงานของนักเรียนก่อน แล้วเลือกดูผลงานกิจกรรมของแบรนด์ได้จากแถบด้านล่าง", "Explore student stories first, then browse Fonzo brand events below.")}</p></div></div><div className="space-y-5">{renderSection("students", students, Users, t("นักเรียนของคุณเบิร์ด", "Bird's students"), t("ยังไม่มีข้อมูลนักเรียนในระบบ — เพิ่มได้จาก Admin", "No student profiles yet — add them from Admin."))}{renderSection("events", events, CalendarDays, t("การออกบูทและกิจกรรมของแบรนด์", "Brand events"), t("ยังไม่มี Event ในระบบ — เพิ่มได้จาก Admin", "No events yet — add them from Admin."))}</div></section></>;
}
