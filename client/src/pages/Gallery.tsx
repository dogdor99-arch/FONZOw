import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Play, X } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useLocale } from "@/contexts/LocaleContext";
import { PageHeading } from "@/components/site/SiteLayout";
import { Reveal } from "@/components/site/Reveal";
import { SocialGrid } from "@/components/site/SocialGrid";
import { cn } from "@/lib/utils";

export default function Gallery() {
  const { t } = useLocale();
  const { data: albums = [], isLoading: albumsLoading } = trpc.fonzo.gallery.albums.useQuery();
  const [activeAlbum, setActiveAlbum] = useState<string | null>(null);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  useEffect(() => {
    if (!activeAlbum && albums.length > 0) setActiveAlbum(albums[0].code);
  }, [albums, activeAlbum]);

  const { data: items = [], isLoading: itemsLoading } = trpc.fonzo.gallery.items.useQuery(
    { albumCode: activeAlbum ?? "" },
    { enabled: Boolean(activeAlbum) },
  );

  const current = lightboxIndex !== null ? items[lightboxIndex] : null;

  useEffect(() => {
    if (lightboxIndex === null) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setLightboxIndex(null);
      if (event.key === "ArrowRight") setLightboxIndex(i => (i === null ? null : (i + 1) % items.length));
      if (event.key === "ArrowLeft")
        setLightboxIndex(i => (i === null ? null : (i - 1 + items.length) % items.length));
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [lightboxIndex, items.length]);

  return (
    <>
      <PageHeading
        eyebrow={t("ภาพและวิดีโอ", "Photos & videos")}
        title="Gallery"
        description={t(
          "รวบรวมภาพเครื่องดนตรีและช่วงเวลาของผู้เล่นที่เลือก Fonzo เป็นเครื่องดนตรีคู่กาย",
          "A collection of instrument photography and moments from the players who choose Fonzo.",
        )}
        crumbs={[{ label: "Gallery" }]}
      />

      <section className="mx-auto max-w-[1400px] px-4 py-12 sm:px-6 lg:px-10">
        <div className="flex flex-wrap gap-2 border-b border-border/70 pb-6">
          {albumsLoading
            ? Array.from({ length: 2 }).map((_, i) => (
                <div key={i} className="h-10 w-28 animate-pulse bg-secondary" />
              ))
            : albums.map(album => (
                <button
                  key={album.code}
                  type="button"
                  onClick={() => setActiveAlbum(album.code)}
                  className={cn(
                    "press border px-5 py-2.5 text-[11px] tracking-[0.18em] uppercase",
                    activeAlbum === album.code
                      ? "border-brand bg-brand text-brand-foreground"
                      : "border-border text-muted-foreground hover:border-brand/50 hover:text-brand",
                  )}>
                  {album.name}
                  <span className="ml-2 opacity-70">{album.itemCount}</span>
                </button>
              ))}
        </div>

        <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {itemsLoading
            ? Array.from({ length: 12 }).map((_, i) => (
                <div key={i} className="aspect-square animate-pulse bg-secondary" />
              ))
            : items.map((item, index) => (
                <Reveal key={item.code} delay={Math.min(index, 8) * 40}>
                  <button
                    type="button"
                    onClick={() => setLightboxIndex(index)}
                    className="group relative block aspect-square w-full overflow-hidden bg-secondary">
                    <img
                      src={item.type === "Video" ? (item.poster ?? item.url) : item.url}
                      alt={t("ภาพในแกลเลอรี", "Gallery image")}
                      loading="lazy"
                      className="h-full w-full object-cover transition-transform duration-700 [transition-timing-function:cubic-bezier(0.23,1,0.32,1)] group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-ink/0 transition-colors duration-300 group-hover:bg-ink/20" />
                    {item.type === "Video" && (
                      <span className="absolute inset-0 flex items-center justify-center">
                        <span className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-cream/70 bg-ink/45 backdrop-blur-sm">
                          <Play className="h-4 w-4 text-cream" fill="currentColor" />
                        </span>
                      </span>
                    )}
                  </button>
                </Reveal>
              ))}
        </div>

        {!itemsLoading && items.length === 0 && (
          <p className="mt-10 text-muted-foreground">
            {t("ยังไม่มีสื่อในอัลบั้มนี้", "This album has no media yet.")}
          </p>
        )}
      </section>

      {/* Live social wall closes the page so visitors see current activity too. */}
      <div className="rule-top">
        <SocialGrid limit={8} className="py-16 lg:py-20" />
      </div>

      {/* Lightbox */}
      {current && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-ink/92 p-4">
          <button
            type="button"
            onClick={() => setLightboxIndex(null)}
            aria-label={t("ปิด", "Close")}
            className="press absolute right-5 top-5 inline-flex h-11 w-11 items-center justify-center text-cream/80 hover:text-cream">
            <X className="h-6 w-6" strokeWidth={1.4} />
          </button>
          <button
            type="button"
            aria-label={t("ก่อนหน้า", "Previous")}
            onClick={() => setLightboxIndex(i => (i === null ? null : (i - 1 + items.length) % items.length))}
            className="press absolute left-3 inline-flex h-12 w-12 items-center justify-center text-cream/70 hover:text-cream sm:left-8">
            <ChevronLeft className="h-7 w-7" strokeWidth={1.4} />
          </button>
          <button
            type="button"
            aria-label={t("ถัดไป", "Next")}
            onClick={() => setLightboxIndex(i => (i === null ? null : (i + 1) % items.length))}
            className="press absolute right-3 inline-flex h-12 w-12 items-center justify-center text-cream/70 hover:text-cream sm:right-8">
            <ChevronRight className="h-7 w-7" strokeWidth={1.4} />
          </button>

          <div className="max-h-[85vh] w-full max-w-5xl">
            {current.type === "Video" ? (
              <video
                src={current.url}
                poster={current.poster ?? undefined}
                controls
                autoPlay
                className="max-h-[85vh] w-full bg-black"
              />
            ) : (
              <img
                src={current.url}
                alt={t("ภาพในแกลเลอรี", "Gallery image")}
                className="mx-auto max-h-[85vh] w-auto object-contain"
              />
            )}
            <p className="mt-4 text-center text-xs text-cream/60">
              {(lightboxIndex ?? 0) + 1} / {items.length}
            </p>
          </div>
        </div>
      )}
    </>
  );
}
