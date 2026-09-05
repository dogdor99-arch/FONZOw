import { useMemo } from "react";
import { Award, ExternalLink, Music2 } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useLocale } from "@/contexts/LocaleContext";
import { BRAND } from "@/lib/brand";
import { PageHeading } from "@/components/site/SiteLayout";
import { Reveal } from "@/components/site/Reveal";
import { RichText } from "@/components/site/RichText";

export default function Artists() {
  const { locale, t } = useLocale();
  const { data: founderArticles = [], isLoading: founderLoading } = trpc.fonzo.content.founder.useQuery();
  const { data: albums = [], isLoading: albumsLoading } = trpc.fonzo.gallery.albums.useQuery();
  const founder = founderArticles.find(article => article.locale === locale) ?? founderArticles[0];
  const playersAlbum = useMemo(
    () => albums.find(album => /player|artist|student|ผู้เล่น|นักเรียน/i.test(album.name)) ?? albums[1],
    [albums],
  );
  const { data: playerItems = [], isLoading: playersLoading } = trpc.fonzo.gallery.items.useQuery(
    { albumCode: playersAlbum?.code ?? "" },
    { enabled: Boolean(playersAlbum?.code) },
  );

  return (
    <>
      <PageHeading
        eyebrow={t("ศิลปินและผู้เล่น", "Artists & players")}
        title="Artists"
        description={t(
          "พื้นที่สำหรับศิลปิน ผู้เล่น และนักเรียนที่ร่วมเดินทางกับ Fonzo ผ่านเสียงดนตรีและการเรียนรู้",
          "A space for the artists, players and students who share Fonzo's journey through music and learning.",
        )}
        crumbs={[{ label: "Artists" }]}
        index="06"
      />

      <section className="mx-auto max-w-[1400px] px-4 py-16 sm:px-6 lg:px-10 lg:py-24">
        <div className="grid gap-12 lg:grid-cols-[0.72fr_1.28fr] lg:gap-20">
          <Reveal>
            <div className="sticky top-28">
              <div className="overflow-hidden bg-secondary">
                {founder?.image ? (
                  <img src={founder.image} alt={locale === "th" ? BRAND.founder.th : BRAND.founder.en} className="w-full object-cover" loading="lazy" />
                ) : (
                  <div className="flex aspect-[4/5] items-center justify-center text-muted-foreground">{t("กำลังโหลดภาพ", "Loading image")}</div>
                )}
              </div>
              <p className="mt-7 eyebrow">{t("ศิลปินหลักของแบรนด์", "The brand's principal artist")}</p>
              <h2 className="mt-3 font-display text-3xl">{locale === "th" ? BRAND.founder.th : BRAND.founder.en}</h2>
              <div className="mt-5 gold-rule" />
              <div className="mt-6 space-y-4 text-sm text-muted-foreground">
                <p className="flex gap-3"><Award className="mt-0.5 h-4 w-4 shrink-0 text-brand" />{t("ผู้ชนะเลิศ GFA Guitar Foundation of America International Concert Artist Competition 2014", "Winner of the GFA Guitar Foundation of America International Concert Artist Competition 2014")}</p>
                <p className="flex gap-3"><Music2 className="mt-0.5 h-4 w-4 shrink-0 text-brand" />{t("ผู้ก่อตั้งและผู้ควบคุมคุณภาพเสียงของ Fonzo Guitar", "Founder and tonal director of Fonzo Guitar")}</p>
              </div>
            </div>
          </Reveal>

          <Reveal delay={80}>
            <div className="max-w-[46rem]">
              {founderLoading ? <div className="space-y-4">{Array.from({ length: 10 }).map((_, index) => <div key={index} className="h-4 animate-pulse bg-secondary" style={{ width: `${88 - (index % 4) * 9}%` }} />)}</div> : founder ? <RichText html={founder.html} /> : <p className="text-muted-foreground">{t("ยังไม่มีข้อมูลศิลปิน", "Artist information is not available yet.")}</p>}
            </div>
          </Reveal>
        </div>
      </section>

      <section className="rule-top bg-cream/50">
        <div className="mx-auto max-w-[1400px] px-4 py-16 sm:px-6 lg:px-10 lg:py-24">
          <div className="flex flex-wrap items-end justify-between gap-6 border-b border-border/70 pb-6">
            <div>
              <p className="eyebrow">{t("เครือข่ายผู้เล่น", "Player network")}</p>
              <h2 className="mt-3 font-display text-3xl sm:text-4xl">{t("ศิลปินและนักเรียนที่ร่วมเดินทางกับ Fonzo", "Artists and students in the Fonzo community")}</h2>
            </div>
            {playersAlbum && <span className="text-xs text-muted-foreground">{playersAlbum.itemCount} {t("ภาพ", "items")}</span>}
          </div>
          <p className="mt-6 max-w-2xl text-sm leading-relaxed text-muted-foreground">{t("ภาพส่วนนี้ดึงจากคลัง Players ของแบรนด์ หากต้องการเพิ่มชื่อศิลปิน ประวัติ หรือภาพเฉพาะบุคคล สามารถส่งข้อมูลให้เราเติมเป็นโปรไฟล์แยกได้", "This section is sourced from the brand's Players archive. Individual artist profiles can be added when names, biographies or dedicated images are provided.")}</p>
          <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {albumsLoading || playersLoading ? Array.from({ length: 8 }).map((_, index) => <div key={index} className="aspect-square animate-pulse bg-secondary" />) : playerItems.slice(0, 24).map((item, index) => <Reveal key={item.code} delay={Math.min(index, 8) * 35}><a href={item.url} target="_blank" rel="noreferrer" className="group relative block aspect-square overflow-hidden bg-secondary"><img src={item.type === "Video" ? item.poster ?? item.url : item.url} alt={t("ภาพผู้เล่นของ Fonzo", "Fonzo player")} loading="lazy" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" /><span className="absolute inset-x-3 bottom-3 flex items-center justify-between text-[10px] tracking-[0.16em] text-white opacity-0 transition-opacity group-hover:opacity-100"><span className="bg-ink/70 px-2 py-1 uppercase">{item.type === "Video" ? "Video" : "View"}</span><ExternalLink className="h-3.5 w-3.5" /></span></a></Reveal>)}
          </div>
        </div>
      </section>
    </>
  );
}
