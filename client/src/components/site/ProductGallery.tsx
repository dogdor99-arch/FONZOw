/**
 * Product gallery — a quiet, gallery-wall presentation.
 *
 * One large plate with the active photograph, a horizontally scrolling strip of
 * thumbnails underneath, and a full-screen lightbox for close inspection.
 * Keyboard arrows move between frames once the lightbox is open.
 */

import { useCallback, useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Expand, X } from "lucide-react";
import { useLocale } from "@/contexts/LocaleContext";
import { cn } from "@/lib/utils";

export function ProductGallery({
  images,
  alt,
}: {
  images: { url: string }[];
  alt: string;
}) {
  const { t } = useLocale();
  const [active, setActive] = useState(0);
  const [zoomed, setZoomed] = useState(false);
  const total = images.length;

  useEffect(() => {
    setActive(0);
    setZoomed(false);
  }, [alt, total]);

  const step = useCallback(
    (delta: number) => {
      if (total === 0) return;
      setActive(prev => ((prev + delta) % total + total) % total);
    },
    [total],
  );

  useEffect(() => {
    if (!zoomed) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setZoomed(false);
      if (event.key === "ArrowRight") step(1);
      if (event.key === "ArrowLeft") step(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [zoomed, step]);

  if (total === 0) {
    return (
      <div className="flex aspect-4/5 items-center justify-center bg-secondary/60 text-sm text-muted-foreground">
        {t("ไม่มีรูปภาพ", "No image")}
      </div>
    );
  }

  return (
    <div>
      {/* `max-h-[70vh]` keeps a portrait instrument from pushing the spec column
          off-screen on short viewports; the aspect ratio drives width-based
          sizing everywhere else. */}
      <div className="group relative aspect-4/5 max-h-[70vh] w-full overflow-hidden bg-linear-to-b from-secondary/40 to-secondary/80">
        <img
          src={images[active].url}
          alt={alt}
          className="h-full w-full object-contain p-6 transition-transform duration-500 sm:p-10"
        />

        <button
          type="button"
          onClick={() => setZoomed(true)}
          aria-label={t("ดูภาพขนาดเต็ม", "View full size")}
          className="press absolute top-4 right-4 inline-flex h-10 w-10 items-center justify-center bg-cream/80 text-ink/70 opacity-0 backdrop-blur-sm transition-opacity duration-200 group-hover:opacity-100 focus-visible:opacity-100">
          <Expand className="h-4 w-4" strokeWidth={1.5} />
        </button>

        {total > 1 && (
          <>
            <GalleryArrow side="left" onClick={() => step(-1)} />
            <GalleryArrow side="right" onClick={() => step(1)} />
            <span className="pointer-events-none absolute bottom-4 left-1/2 -translate-x-1/2 bg-cream/75 px-3 py-1 text-[10px] tracking-[0.18em] text-ink/60 uppercase backdrop-blur-sm">
              {active + 1} / {total}
            </span>
          </>
        )}
      </div>

      {total > 1 && (
        <div className="mt-3 -mx-1 flex gap-2 overflow-x-auto px-1 pb-2 [scrollbar-width:thin]">
          {images.map((image, index) => (
            <button
              key={`${image.url}-${index}`}
              type="button"
              onClick={() => setActive(index)}
              aria-label={`${alt} ${index + 1}`}
              aria-current={index === active}
              className={cn(
                "press relative h-16 w-16 shrink-0 overflow-hidden bg-secondary/60 transition-opacity duration-200 sm:h-20 sm:w-20",
                index === active ? "opacity-100" : "opacity-55 hover:opacity-90",
              )}>
              <img src={image.url} alt="" loading="lazy" className="h-full w-full object-cover" />
              <span
                className={cn(
                  "absolute inset-x-0 bottom-0 h-[2px] transition-colors duration-200",
                  index === active ? "bg-brand" : "bg-transparent",
                )}
              />
            </button>
          ))}
        </div>
      )}

      {zoomed && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={alt}
          className="fixed inset-0 z-100 flex items-center justify-center bg-ink/95 p-4 sm:p-10"
          onClick={() => setZoomed(false)}>
          <img
            src={images[active].url}
            alt={alt}
            onClick={event => event.stopPropagation()}
            className="max-h-full max-w-full object-contain"
          />
          <button
            type="button"
            onClick={() => setZoomed(false)}
            aria-label={t("ปิด", "Close")}
            className="press absolute top-5 right-5 inline-flex h-11 w-11 items-center justify-center text-cream/70 hover:text-cream">
            <X className="h-5 w-5" strokeWidth={1.5} />
          </button>
          {total > 1 && (
            <>
              <button
                type="button"
                onClick={event => {
                  event.stopPropagation();
                  step(-1);
                }}
                aria-label={t("ภาพก่อนหน้า", "Previous")}
                className="press absolute left-3 inline-flex h-12 w-12 items-center justify-center text-cream/70 hover:text-cream sm:left-8">
                <ChevronLeft className="h-6 w-6" strokeWidth={1.4} />
              </button>
              <button
                type="button"
                onClick={event => {
                  event.stopPropagation();
                  step(1);
                }}
                aria-label={t("ภาพถัดไป", "Next")}
                className="press absolute right-3 inline-flex h-12 w-12 items-center justify-center text-cream/70 hover:text-cream sm:right-8">
                <ChevronRight className="h-6 w-6" strokeWidth={1.4} />
              </button>
              <span className="absolute bottom-6 left-1/2 -translate-x-1/2 text-[10px] tracking-[0.2em] text-cream/50 uppercase">
                {active + 1} / {total}
              </span>
            </>
          )}
        </div>
      )}
    </div>
  );
}

function GalleryArrow({ side, onClick }: { side: "left" | "right"; onClick: () => void }) {
  const { t } = useLocale();
  const Icon = side === "left" ? ChevronLeft : ChevronRight;
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={side === "left" ? t("ภาพก่อนหน้า", "Previous") : t("ภาพถัดไป", "Next")}
      className={cn(
        "press absolute top-1/2 inline-flex h-11 w-11 -translate-y-1/2 items-center justify-center bg-cream/80 text-ink/60 opacity-0 backdrop-blur-sm transition-opacity duration-200 group-hover:opacity-100 focus-visible:opacity-100 hover:text-brand",
        side === "left" ? "left-3" : "right-3",
      )}>
      <Icon className="h-5 w-5" strokeWidth={1.4} />
    </button>
  );
}
