import { useState } from "react";
import { ArrowLeft, ArrowRight, ExternalLink, Music2 } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useLocale } from "@/contexts/LocaleContext";
import { PageHeading } from "@/components/site/SiteLayout";
import { Reveal } from "@/components/site/Reveal";
import { FEATURED_ARTISTS } from "@/lib/artistContent";

export default function Artists() {
  const { locale, t } = useLocale();
  const { data: managedArtists = [] } = trpc.artists.list.useQuery();
  const [active, setActive] = useState(0);

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
        collaborationImage: artist.collaborationImageUrl ?? artist.imageUrl ?? undefined,
        sourceUrl: artist.sourceUrl ?? "https://www.facebook.com/Fonzoguitar",
        guitar: artist.guitar ?? undefined,
      }))
    : FEATURED_ARTISTS.map(artist => ({ ...artist, collaborationImage: artist.image }));

  const current = artists[active] ?? artists[0];
  const title = current ? (locale === "th" ? current.name : current.nameEn) : "Artists";
  const role = current ? (locale === "th" ? current.role : current.roleEn) : "Fonzo Artist";
  const description = current ? (locale === "th" ? current.description : current.descriptionEn) : "";

  const move = (direction: number) => {
    if (!artists.length) return;
    setActive(index => (index + direction + artists.length) % artists.length);
  };

  return (
    <>
      <PageHeading
        eyebrow={t("ศิลปินและผู้เล่น", "Artists & players")}
        title="Artists"
        description={t("โปรไฟล์ของศิลปินและผู้เล่นที่ร่วมสร้างเสียงและเรื่องราวไปกับ Fonzo", "Profiles of the artists and players who shape Fonzo's sound and story.")}
        crumbs={[{ label: "Artists" }]}
        index="06"
      />

      <section className="mx-auto max-w-[1400px] px-4 pb-20 sm:px-6 lg:px-10 lg:pb-28">
        <div className="border-y border-border/70 py-5">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div><p className="eyebrow text-brand">{t("Fonzo Artists", "Fonzo Artists")}</p><p className="mt-2 text-sm text-muted-foreground">{t("เลื่อนทีละคนเพื่อดูข้อมูลและภาพการร่วมงานกับแบรนด์", "Move one profile at a time to view each artist and collaboration.")}</p></div>
            <a href="https://www.facebook.com/Fonzoguitar" target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-[11px] tracking-[0.14em] text-brand uppercase hover:text-gold">{t("ดูเพจ FONZO", "Visit FONZO on Facebook")}<ExternalLink className="h-3.5 w-3.5" /></a>
          </div>
        </div>

        {current ? <div className="mt-8 overflow-hidden border border-border bg-card">
          <div className="flex transition-transform duration-300 [transition-timing-function:cubic-bezier(0.23,1,0.32,1)]" style={{ transform: `translateX(-${active * 100}%)` }}>
            {artists.map((artist, index) => {
              const artistTitle = locale === "th" ? artist.name : artist.nameEn;
              const artistRole = locale === "th" ? artist.role : artist.roleEn;
              const artistBio = locale === "th" ? artist.description : artist.descriptionEn;
              return <article key={artist.id} className="min-w-full">
                <div className="grid lg:grid-cols-[0.82fr_1.18fr]">
                  <div className="grid gap-px bg-border sm:grid-cols-2 lg:grid-cols-1">
                    <div className="relative aspect-[4/3] overflow-hidden bg-secondary lg:aspect-[4/3]">
                      {artist.image ? <img src={artist.image} alt={artistTitle} loading={index === active ? "eager" : "lazy"} className="h-full w-full object-cover" onError={event => { event.currentTarget.style.display = "none"; }} /> : <ImagePlaceholder label={t("รูปศิลปิน", "Artist portrait")} />}
                      <span className="absolute left-4 top-4 bg-ink/75 px-2.5 py-1 text-[10px] tracking-[0.15em] text-cream uppercase">{t("โปรไฟล์ศิลปิน", "Artist profile")}</span>
                    </div>
                    <div className="relative aspect-[4/3] overflow-hidden bg-secondary lg:aspect-[4/3]">
                      {artist.collaborationImage ? <img src={artist.collaborationImage} alt={t(`ภาพ ${artistTitle} ร่วมงานกับ Fonzo`, `${artistTitle} with Fonzo`)} loading="lazy" className="h-full w-full object-cover" onError={event => { event.currentTarget.style.display = "none"; }} /> : <ImagePlaceholder label={t("ภาพร่วมงานกับแบรนด์", "Brand collaboration")} />}
                      <span className="absolute left-4 top-4 bg-brand/85 px-2.5 py-1 text-[10px] tracking-[0.15em] text-brand-foreground uppercase">{t("ร่วมงานกับ Fonzo", "With Fonzo")}</span>
                    </div>
                  </div>

                  <div className="flex min-h-[430px] flex-col justify-between p-7 sm:p-10 lg:p-14">
                    <div><p className="eyebrow text-brand">{artistRole}</p><h2 className="mt-4 font-display text-4xl leading-tight sm:text-5xl">{artistTitle}</h2><div className="mt-6 h-px w-16 bg-gold" /><p className="mt-7 max-w-xl text-[15px] leading-[1.95] text-muted-foreground">{artistBio || t("เพิ่มประวัติและข้อมูลการร่วมงานได้จากหน้า Admin", "Add the biography and collaboration details from Admin.")}</p>{artist.guitar && <p className="mt-7 border-l border-gold/60 pl-4 text-xs tracking-[0.12em] text-foreground/70">{artist.guitar}</p>}</div>
                    <div className="mt-10 flex flex-wrap items-center gap-4"><a href={artist.sourceUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 border border-border px-4 py-3 text-[11px] tracking-[0.14em] text-brand uppercase transition-colors hover:border-brand hover:bg-brand hover:text-brand-foreground">{t("ดูคอนเทนต์ต้นฉบับ", "View original content")}<ExternalLink className="h-3.5 w-3.5" /></a><span className="inline-flex items-center gap-2 text-xs text-muted-foreground"><Music2 className="h-4 w-4 text-gold" />{index + 1} / {artists.length}</span></div>
                  </div>
                </div>
              </article>;
            })}
          </div>
        </div> : <div className="mt-8 border border-border p-12 text-center text-muted-foreground">{t("ยังไม่มีข้อมูลศิลปิน", "No artist profiles yet")}</div>}

        {artists.length > 1 && <div className="mt-5 flex items-center justify-between border-b border-border/70 pb-5"><div className="flex gap-2">{artists.map((artist, index) => <button key={artist.id} type="button" onClick={() => setActive(index)} aria-label={`${t("ดูโปรไฟล์", "View profile")} ${index + 1}`} className={`h-1.5 transition-all ${index === active ? "w-12 bg-brand" : "w-5 bg-border hover:bg-gold/60"}`} />)}</div><div className="flex gap-2"><button type="button" onClick={() => move(-1)} className="flex h-10 w-10 items-center justify-center border border-border text-brand transition hover:border-brand hover:bg-brand hover:text-brand-foreground" aria-label={t("ศิลปินก่อนหน้า", "Previous artist")}><ArrowLeft className="h-4 w-4" /></button><button type="button" onClick={() => move(1)} className="flex h-10 w-10 items-center justify-center border border-border text-brand transition hover:border-brand hover:bg-brand hover:text-brand-foreground" aria-label={t("ศิลปินถัดไป", "Next artist")}><ArrowRight className="h-4 w-4" /></button></div></div>}
      </section>
    </>
  );
}

function ImagePlaceholder({ label }: { label: string }) {
  return <div className="flex h-full min-h-48 flex-col items-center justify-center gap-3 text-muted-foreground"><Music2 className="h-8 w-8 text-gold/70" strokeWidth={1.3} /><span className="eyebrow">{label}</span></div>;
}
