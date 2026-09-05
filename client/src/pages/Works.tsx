import { useMemo } from "react";
import { ExternalLink, Images, Users } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useLocale } from "@/contexts/LocaleContext";
import { PageHeading } from "@/components/site/SiteLayout";
import { Reveal } from "@/components/site/Reveal";

function MediaGrid({ albumCode, emptyLabel }: { albumCode?: string; emptyLabel: string }) {
  const { t } = useLocale();
  const { data: items = [], isLoading } = trpc.fonzo.gallery.items.useQuery(
    { albumCode: albumCode ?? "" },
    { enabled: Boolean(albumCode) },
  );

  if (!albumCode) {
    return <p className="border border-border bg-card p-8 text-sm text-muted-foreground">{emptyLabel}</p>;
  }

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
      {isLoading
        ? Array.from({ length: 8 }).map((_, index) => <div key={index} className="aspect-square animate-pulse bg-secondary" />)
        : items.slice(0, 24).map((item, index) => (
            <Reveal key={item.code} delay={Math.min(index, 8) * 35}>
              <a
                href={item.type === "Video" ? item.url : item.url}
                target="_blank"
                rel="noreferrer"
                className="group relative block aspect-square overflow-hidden bg-secondary"
              >
                <img
                  src={item.type === "Video" ? item.poster ?? item.url : item.url}
                  alt={t("ผลงานของ Fonzo", "Fonzo work")}
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <span className="absolute inset-x-3 bottom-3 flex items-center justify-between text-[10px] tracking-[0.16em] text-white opacity-0 transition-opacity group-hover:opacity-100">
                  <span className="bg-ink/70 px-2 py-1 uppercase">{item.type === "Video" ? "Video" : "View"}</span>
                  <ExternalLink className="h-3.5 w-3.5" />
                </span>
              </a>
            </Reveal>
          ))}
    </div>
  );
}

export default function Works() {
  const { t } = useLocale();
  const { data: albums = [], isLoading } = trpc.fonzo.gallery.albums.useQuery();
  const boothAlbum = useMemo(
    () => albums.find(album => /guitar|booth|expo|event|work/i.test(album.name)) ?? albums[0],
    [albums],
  );
  const studentsAlbum = useMemo(
    () => albums.find(album => /player|student|academy|เรียน/i.test(album.name)) ?? albums[1],
    [albums],
  );

  return (
    <>
      <PageHeading
        eyebrow={t("ผลงานของแบรนด์", "Brand works")}
        title="Works"
        description={t(
          "รวมช่วงเวลาที่ Fonzo ออกไปพบผู้คน ทั้งการออกบูท การจัดแสดง และการเรียนรู้ร่วมกับนักเรียนของคุณเบิร์ด",
          "A living record of Fonzo in the world — exhibitions, booth appearances and the learning journey shared with Bird's students.",
        )}
        crumbs={[{ label: "Works" }]}
        index="05"
      />

      <section className="mx-auto max-w-[1400px] px-4 py-16 sm:px-6 lg:px-10 lg:py-24">
        <div className="grid gap-16">
          <article>
            <div className="mb-8 flex items-end justify-between gap-6 border-b border-border/70 pb-5">
              <div>
                <p className="eyebrow inline-flex items-center gap-2"><Images className="h-3.5 w-3.5" /> {t("ผลงานส่วนที่ 01", "Works 01")}</p>
                <h2 className="mt-3 font-display text-3xl sm:text-4xl">{t("ภาพการออกบูทและการจัดแสดง", "Booths and exhibitions")}</h2>
              </div>
              {boothAlbum && <span className="text-xs text-muted-foreground">{boothAlbum.itemCount} {t("ภาพ", "items")}</span>}
            </div>
            {isLoading ? <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">{Array.from({ length: 8 }).map((_, index) => <div key={index} className="aspect-square animate-pulse bg-secondary" />)}</div> : <MediaGrid albumCode={boothAlbum?.code} emptyLabel={t("ยังไม่มีภาพการออกบูทในระบบ", "No booth images are available yet.")} />}
          </article>

          <article>
            <div className="mb-8 flex items-end justify-between gap-6 border-b border-border/70 pb-5">
              <div>
                <p className="eyebrow inline-flex items-center gap-2"><Users className="h-3.5 w-3.5" /> {t("ผลงานส่วนที่ 02", "Works 02")}</p>
                <h2 className="mt-3 font-display text-3xl sm:text-4xl">{t("นักเรียนของคุณเบิร์ด", "Bird's students")}</h2>
              </div>
              {studentsAlbum && <span className="text-xs text-muted-foreground">{studentsAlbum.itemCount} {t("ภาพ", "items")}</span>}
            </div>
            {isLoading ? <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">{Array.from({ length: 8 }).map((_, index) => <div key={index} className="aspect-square animate-pulse bg-secondary" />)}</div> : <MediaGrid albumCode={studentsAlbum?.code} emptyLabel={t("ยังไม่มีภาพนักเรียนในระบบ", "No student images are available yet.")} />}
          </article>
        </div>
      </section>
    </>
  );
}
