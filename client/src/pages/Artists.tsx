import { useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, ExternalLink, MoveRight, Music2 } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useLocale } from "@/contexts/LocaleContext";
import { PageHeading } from "@/components/site/SiteLayout";
import { FEATURED_ARTISTS } from "@/lib/artistContent";

export default function Artists() {
  const { locale, t } = useLocale();
  const { data: managedArtists = [] } = trpc.artists.list.useQuery();
  const [active, setActive] = useState(0);
  const [switching, setSwitching] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const artists = managedArtists.length > 0
    ? managedArtists.map(artist => ({
        id: String(artist.id),
        name: artist.name,
        nameEn: artist.nameEn ?? artist.name,
        role: artist.role ?? "Fonzo Artist",
        roleEn: artist.roleEn ?? "Fonzo Artist",
        description: artist.bio ?? "",
        descriptionEn: artist.bioEn ?? artist.bio ?? "",
        image: artist.imageUrl ?? undefined,
        collaborationImage: artist.collaborationImageUrl ?? undefined,
        sourceUrl: artist.sourceUrl ?? "https://www.facebook.com/Fonzoguitar",
        guitar: artist.guitar ?? undefined,
      }))
    : FEATURED_ARTISTS.map(artist => ({ ...artist, collaborationImage: artist.image }));

  const current = artists[active] ?? artists[0];

  useEffect(() => () => { if (timeoutRef.current) clearTimeout(timeoutRef.current); }, []);

  const changeArtist = (nextIndex: number) => {
    if (!artists.length || nextIndex === active || switching) return;
    setSwitching(true);
    timeoutRef.current = setTimeout(() => {
      setActive(nextIndex);
      timeoutRef.current = setTimeout(() => setSwitching(false), 80);
    }, 180);
  };

  const move = (direction: number) => {
    if (!artists.length) return;
    changeArtist((active + direction + artists.length) % artists.length);
  };

  if (!current) {
    return <><PageHeading eyebrow={t("ศิลปินและผู้เล่น", "Artists & players")} title="Artists" crumbs={[{ label: "Artists" }]} index="06" /><div className="mx-auto max-w-5xl px-4 py-20 text-center text-muted-foreground">{t("ยังไม่มีข้อมูลศิลปิน", "No artist profiles yet")}</div></>;
  }

  const title = locale === "th" ? current.name : current.nameEn;
  const role = locale === "th" ? current.role : current.roleEn;
  const description = locale === "th" ? current.description : current.descriptionEn;
  const works = [
    current.collaborationImage && { image: current.collaborationImage, label: t("ภาพร่วมงานกับ Fonzo", "Collaboration with Fonzo") },
    current.image && { image: current.image, label: t("ภาพศิลปิน", "Artist portrait") },
  ].filter(Boolean) as { image: string; label: string }[];

  return <>
    <PageHeading eyebrow={t("ศิลปินและผู้เล่น", "Artists & players")} title="Artists" description={t("เสียงและตัวตนของผู้เล่นที่ร่วมเดินทางไปกับ Fonzo", "The voices and identities of players who travel with Fonzo.")} crumbs={[{ label: "Artists" }]} index="06" />
    <main className="overflow-hidden bg-cream/35">
      <section className="mx-auto max-w-[1500px] px-4 pb-20 pt-5 sm:px-6 lg:px-10 lg:pb-28 lg:pt-10">
        <div className={`relative transition duration-300 ease-out ${switching ? "translate-x-5 opacity-0" : "translate-x-0 opacity-100"}`}>
          <div className="grid min-h-[620px] items-center gap-8 lg:grid-cols-[1.08fr_0.92fr] lg:gap-12">
            <div className="relative flex min-h-[390px] items-center justify-center overflow-hidden bg-[radial-gradient(circle_at_center,rgba(194,151,78,0.16),transparent_62%)] sm:min-h-[520px] lg:min-h-[650px]">
              <div className="pointer-events-none absolute left-5 top-5 text-[9px] tracking-[0.2em] text-brand/70 uppercase">{String(active + 1).padStart(2, "0")} / {String(artists.length).padStart(2, "0")}</div>
              {current.image ? <img key={current.id} src={current.image} alt={title} className="h-full max-h-[620px] w-full object-contain object-center mix-blend-multiply transition duration-500" onError={event => { event.currentTarget.style.display = "none"; }} /> : <div className="flex flex-col items-center gap-4 text-muted-foreground"><Music2 className="h-12 w-12 text-gold" strokeWidth={1.1} /><span className="eyebrow">{t("ใส่รูปศิลปินจาก Admin", "Add an artist image from Admin")}</span></div>}
              <div className="pointer-events-none absolute bottom-0 left-1/2 h-px w-3/4 -translate-x-1/2 bg-linear-to-r from-transparent via-brand/40 to-transparent" />
            </div>

            <div className="flex min-h-[430px] flex-col justify-center py-8 lg:py-14">
              <p className="eyebrow text-brand">{role}</p>
              <h2 className="mt-5 max-w-xl font-display text-5xl leading-[0.98] text-foreground sm:text-6xl lg:text-[5.5rem]">{title}</h2>
              <div className="mt-8 h-px w-20 bg-gold" />
              <p className="mt-8 max-w-lg text-[15px] leading-[1.95] text-muted-foreground">{description || t("เพิ่มข้อมูลศิลปินและเรื่องราวการร่วมงานได้จากหน้า Admin", "Add the artist biography and collaboration story from Admin.")}</p>
              {current.guitar && <p className="mt-8 border-l border-gold pl-4 text-xs tracking-[0.14em] text-foreground/65">{current.guitar}</p>}
              <a href={current.sourceUrl} target="_blank" rel="noreferrer" className="mt-10 inline-flex w-fit items-center gap-3 text-[11px] tracking-[0.17em] text-brand uppercase transition-colors hover:text-gold">{t("ดูเรื่องราวต้นฉบับ", "View original story")}<ExternalLink className="h-3.5 w-3.5" /></a>
            </div>
          </div>

          <div className="mt-2 border-t border-border/70 pt-7 lg:mt-6">
            <div className="flex items-end justify-between gap-4"><div><p className="eyebrow text-brand">{t("ผลงานและภาพร่วมงาน", "Works & collaborations")}</p><p className="mt-2 text-sm text-muted-foreground">{t("เลื่อนดูภาพของศิลปินคนนี้ แล้วเลือกคนถัดไปจากแถบด้านล่าง", "Scroll through this artist's work, then choose the next artist below.")}</p></div><span className="hidden items-center gap-2 text-[10px] tracking-[0.15em] text-muted-foreground uppercase sm:flex"><MoveRight className="h-4 w-4 text-gold" />{t("เลื่อนดูผลงาน", "Scroll works")}</span></div>
            <div className="mt-6 flex snap-x gap-4 overflow-x-auto pb-3 [scrollbar-width:thin]">{(works.length ? works : [{ image: "", label: t("เพิ่มรูปผลงานจาก Admin", "Add work image from Admin") }]).map((work, index) => <a key={`${current.id}-${index}`} href={work.image ? current.sourceUrl : undefined} target={work.image ? "_blank" : undefined} rel={work.image ? "noreferrer" : undefined} className="group relative aspect-[16/9] w-[78vw] max-w-[420px] shrink-0 snap-start overflow-hidden bg-secondary sm:w-[38vw] lg:w-[30vw]">{work.image ? <img src={work.image} alt={work.label} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" onError={event => { event.currentTarget.style.display = "none"; }} /> : <div className="flex h-full items-center justify-center text-muted-foreground"><Music2 className="mr-3 h-5 w-5 text-gold" />{work.label}</div>}<span className="absolute inset-x-0 bottom-0 bg-linear-to-t from-ink/80 to-transparent px-4 pb-3 pt-8 text-[10px] tracking-[0.14em] text-cream uppercase">{work.label}</span></a>)}</div>
          </div>
        </div>

        {artists.length > 1 && <div className="mt-8 flex items-center justify-between border-t border-border/70 pt-5"><div className="flex max-w-[70%] gap-2 overflow-x-auto py-1">{artists.map((artist, index) => <button key={artist.id} type="button" onClick={() => changeArtist(index)} className={`shrink-0 border-b-2 px-1 pb-2 text-left text-[11px] tracking-[0.1em] transition-colors ${index === active ? "border-brand text-brand" : "border-transparent text-muted-foreground hover:text-foreground"}`} aria-current={index === active ? "true" : undefined}>{locale === "th" ? artist.name : artist.nameEn}</button>)}</div><div className="flex gap-2"><button type="button" onClick={() => move(-1)} className="flex h-10 w-10 items-center justify-center border border-border text-brand transition hover:border-brand hover:bg-brand hover:text-brand-foreground" aria-label={t("ศิลปินก่อนหน้า", "Previous artist")}><ArrowLeft className="h-4 w-4" /></button><button type="button" onClick={() => move(1)} className="flex h-10 w-10 items-center justify-center border border-border text-brand transition hover:border-brand hover:bg-brand hover:text-brand-foreground" aria-label={t("ศิลปินถัดไป", "Next artist")}><ArrowRight className="h-4 w-4" /></button></div></div>}
      </section>
    </main>
  </>;
}
