import { useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, Guitar, MoveRight, Music2 } from "lucide-react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { useLocale } from "@/contexts/LocaleContext";

export default function Artists() {
  const { locale, t } = useLocale();
  const { data: managedArtists, isLoading } = trpc.artists.list.useQuery();
  const [active, setActive] = useState(0);
  const [switching, setSwitching] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const artists = (managedArtists ?? []).map(artist => ({
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
    guitarUrl: artist.guitarUrl ?? undefined,
  }));

  const current = artists[active] ?? artists[0];

  useEffect(() => {
    if (artists.length < 2 || isPaused) return;
    const interval = window.setInterval(() => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      setSwitching(true);
      timeoutRef.current = setTimeout(() => {
        setActive(previous => (previous + 1) % artists.length);
        timeoutRef.current = setTimeout(() => setSwitching(false), 220);
      }, 300);
    }, 9000);
    return () => {
      window.clearInterval(interval);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [artists.length, isPaused]);

  const changeArtist = (nextIndex: number) => {
    if (!artists.length || nextIndex === active || switching) return;
    setSwitching(true);
    timeoutRef.current = setTimeout(() => {
      setActive(nextIndex);
      timeoutRef.current = setTimeout(() => setSwitching(false), 180);
    }, 260);
  };

  const move = (direction: number) => {
    if (!artists.length) return;
    changeArtist((active + direction + artists.length) % artists.length);
  };

  if (isLoading) {
    return <><div className="border-b border-border/70 bg-cream/40 px-4 py-4 sm:px-6 lg:px-10"><div className="mx-auto max-w-[1400px] lg:pl-12"><p className="text-[9px] tracking-[0.14em] text-muted-foreground uppercase">หน้าแรก <span className="mx-1.5 text-brand">›</span> Artists</p><h1 className="mt-2 font-display text-3xl leading-none sm:text-4xl">Artists</h1></div></div><main className="mx-auto max-w-5xl px-4 py-20 text-center text-muted-foreground">{t("กำลังโหลดข้อมูลศิลปิน...", "Loading artist profiles...")}</main></>;
  }

  if (!current) {
    return <><div className="border-b border-border/70 bg-cream/40 px-4 py-9 sm:px-6 lg:px-10"><div className="mx-auto max-w-[1400px] lg:pl-12"><p className="text-[10px] tracking-[0.18em] text-muted-foreground uppercase">หน้าแรก <span className="mx-2 text-brand">›</span> Artists</p><h1 className="mt-2 font-display text-4xl leading-none sm:text-5xl">Artists</h1></div></div><div className="mx-auto max-w-5xl px-4 py-20 text-center text-muted-foreground">{t("ยังไม่มีข้อมูลศิลปิน", "No artist profiles yet")}</div></>;
  }

  const title = locale === "th" ? current.name : current.nameEn;
  const role = locale === "th" ? current.role : current.roleEn;
  return <>
    <div className="border-b border-border/70 bg-cream/40 px-4 py-3 sm:px-6 lg:px-10"><div className="mx-auto max-w-[1400px] lg:pl-12"><p className="text-[9px] tracking-[0.14em] text-muted-foreground uppercase">หน้าแรก <span className="mx-1.5 text-brand">›</span> Artists</p><h1 className="mt-2 font-display text-3xl leading-none sm:text-4xl">Artists</h1></div></div>
    <main className="overflow-hidden bg-cream/35">
      <section onMouseEnter={() => setIsPaused(true)} onMouseLeave={() => setIsPaused(false)} className="mx-auto max-w-[1400px] px-4 pb-12 pt-2 sm:px-6 lg:px-10 lg:pb-20 lg:pt-4">
        <div className={`relative transition duration-500 ease-out ${switching ? "translate-x-5 opacity-0" : "translate-x-0 opacity-100"}`}>
          {artists.length > 1 && <><button type="button" onClick={() => move(-1)} className="absolute left-0 top-1/2 z-10 hidden h-11 w-11 -translate-y-1/2 items-center justify-center border border-border bg-cream/85 text-brand shadow-sm backdrop-blur transition hover:border-brand hover:bg-brand hover:text-brand-foreground lg:flex" aria-label={t("ศิลปินก่อนหน้า", "Previous artist")}><ArrowLeft className="h-4 w-4" /></button><button type="button" onClick={() => move(1)} className="absolute right-0 top-1/2 z-10 hidden h-11 w-11 -translate-y-1/2 items-center justify-center border border-border bg-cream/85 text-brand shadow-sm backdrop-blur transition hover:border-brand hover:bg-brand hover:text-brand-foreground lg:flex" aria-label={t("ศิลปินถัดไป", "Next artist")}><ArrowRight className="h-4 w-4" /></button></>}

          <div className="grid min-h-[470px] items-center gap-6 lg:grid-cols-[1.02fr_0.98fr] lg:gap-10">
            <div className="relative flex min-h-[330px] items-center justify-center overflow-hidden bg-[radial-gradient(circle_at_center,rgba(194,151,78,0.16),transparent_62%)] sm:min-h-[440px] lg:min-h-[540px] lg:px-10">
              {current.image ? <Link href={`/artists/${current.id}`} className="block h-full w-full cursor-pointer"><img src={current.image} alt={title} className="h-full max-h-[620px] w-full object-contain object-center mix-blend-multiply transition duration-500 hover:opacity-90" /></Link> : <div className="flex flex-col items-center gap-4 text-muted-foreground"><Music2 className="h-12 w-12 text-gold" strokeWidth={1.1} /><span className="eyebrow">{t("ใส่รูปศิลปินจาก Admin", "Add an artist image from Admin")}</span></div>}
              <div className="pointer-events-none absolute bottom-0 left-1/2 h-px w-3/4 -translate-x-1/2 bg-linear-to-r from-transparent via-brand/40 to-transparent" />
            </div>

            <div className="flex min-h-[350px] flex-col justify-center py-3 lg:py-6">
              <p className="eyebrow text-brand">{role}</p>
              <h2 className="mt-3 max-w-xl font-display text-4xl leading-[0.98] text-foreground sm:text-5xl lg:text-[4.5rem]">{title}</h2>
              <div className="mt-5 h-px w-16 bg-gold" />
              {current.guitar && <div className="mt-8 flex items-center gap-3 border-l border-gold pl-4 text-xs tracking-[0.14em] text-foreground/65"><span>{current.guitar}</span>{current.guitarUrl && <a href={current.guitarUrl} target="_blank" rel="noreferrer" aria-label={t("ดูกีตาร์รุ่นนี้", "View this guitar")} className="text-brand hover:text-gold"><Guitar className="h-5 w-5" /></a>}</div>}
              <Link href={`/artists/${current.id}`} className="mt-4 inline-flex w-fit items-center gap-3 text-[11px] font-semibold tracking-[0.17em] text-brand uppercase transition-colors hover:text-gold">{t("ดูข้อมูลศิลปินแบบเต็ม", "View full artist profile")}<MoveRight className="h-3.5 w-3.5" /></Link>
            </div>
          </div>

        </div>


      </section>
    </main>
  </>;
}
