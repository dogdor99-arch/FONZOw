import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Minus, Plus, RotateCcw, X } from "lucide-react";

type Props = { src: string; alt?: string; className?: string; imageClassName?: string; loading?: "eager" | "lazy" };

export function ImageLightbox({ src, alt = "", className = "", imageClassName = "", loading = "eager" }: Props) {
  const [open, setOpen] = useState(false);
  const [zoom, setZoom] = useState(1);
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => { if (event.key === "Escape") setOpen(false); };
    document.addEventListener("keydown", onKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.removeEventListener("keydown", onKeyDown); document.body.style.overflow = previousOverflow; };
  }, [open]);
  useEffect(() => { if (!open) setZoom(1); }, [open]);

  const overlay = open && typeof document !== "undefined" ? createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4 sm:p-10" role="dialog" aria-modal="true" aria-label="Image preview" onClick={() => setOpen(false)}>
      <button type="button" onClick={() => setOpen(false)} className="absolute left-4 top-4 z-10 flex h-11 w-11 items-center justify-center rounded-full bg-white/15 text-white transition hover:bg-white/30" aria-label="Close image"><X className="h-6 w-6" /></button>
      <div className="absolute right-4 top-4 z-10 flex items-center gap-1 rounded-full bg-black/45 p-1 text-white" onClick={event => event.stopPropagation()}><button type="button" onClick={() => setZoom(value => Math.max(1, value - 0.25))} className="flex h-9 w-9 items-center justify-center rounded-full transition hover:bg-white/20" aria-label="Zoom out"><Minus className="h-4 w-4" /></button><span className="min-w-12 text-center text-xs tabular-nums">{Math.round(zoom * 100)}%</span><button type="button" onClick={() => setZoom(value => Math.min(3, value + 0.25))} className="flex h-9 w-9 items-center justify-center rounded-full transition hover:bg-white/20" aria-label="Zoom in"><Plus className="h-4 w-4" /></button><button type="button" onClick={() => setZoom(1)} className="flex h-9 w-9 items-center justify-center rounded-full transition hover:bg-white/20" aria-label="Reset zoom"><RotateCcw className="h-4 w-4" /></button></div>
      <div className="max-h-[92vh] max-w-[94vw] overflow-auto" onClick={event => event.stopPropagation()}><img src={src} alt={alt} className="max-h-none max-w-none object-contain transition-transform duration-200" style={{ transform: `scale(${zoom})`, transformOrigin: "center center" }} /></div>
    </div>,
    document.body,
  ) : null;

  return <><button type="button" onClick={() => setOpen(true)} className={`block h-full w-full cursor-zoom-in ${className}`} aria-label="Open image"><img src={src} alt={alt} loading={loading} className={imageClassName || "h-full w-full object-contain"} /></button>{overlay}</>;
}
