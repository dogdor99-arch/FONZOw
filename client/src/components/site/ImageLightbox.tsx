import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Maximize2, X } from "lucide-react";

type Props = { src: string; alt?: string; className?: string; imageClassName?: string; loading?: "eager" | "lazy" };

export function ImageLightbox({ src, alt = "", className = "", imageClassName = "", loading = "eager" }: Props) {
  const [open, setOpen] = useState(false);
  const [zoomed, setZoomed] = useState(false);
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => { if (event.key === "Escape") setOpen(false); };
    document.addEventListener("keydown", onKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.removeEventListener("keydown", onKeyDown); document.body.style.overflow = previousOverflow; };
  }, [open]);
  useEffect(() => { if (!open) setZoomed(false); }, [open]);
  const overlay = open && typeof document !== "undefined" ? createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4 sm:p-10" role="dialog" aria-modal="true" aria-label="Image preview" onClick={() => setOpen(false)}>
      <button type="button" onClick={() => setOpen(false)} className="absolute left-4 top-4 z-10 flex h-11 w-11 items-center justify-center rounded-full bg-white/15 text-white transition hover:bg-white/30" aria-label="Close image"><X className="h-6 w-6" /></button>
      <div className="group relative max-h-[92vh] max-w-[94vw] overflow-auto rounded-sm" onClick={event => event.stopPropagation()}><img src={src} alt={alt} onClick={() => setZoomed(value => !value)} className={`max-h-none max-w-none cursor-zoom-in object-contain transition-transform duration-200 hover:scale-[2.5] ${zoomed ? "scale-[2.5] cursor-zoom-out" : ""}`} style={{ transformOrigin: "center center" }} /><span className="pointer-events-none absolute bottom-3 left-1/2 flex -translate-x-1/2 items-center gap-2 rounded-full bg-black/65 px-3 py-1.5 text-[10px] tracking-[0.08em] text-white/85 opacity-0 transition group-hover:opacity-100"><Maximize2 className="h-3.5 w-3.5" />{zoomed ? "คลิกอีกครั้งเพื่อย่อ" : "คลิกหรือเลื่อนเมาส์เพื่อขยายรายละเอียด"}</span></div>
    </div>,
    document.body,
  ) : null;

  return <><button type="button" onClick={() => setOpen(true)} className={`block h-full w-full cursor-zoom-in ${className}`} aria-label="Open image"><img src={src} alt={alt} loading={loading} className={imageClassName || "h-full w-full object-contain"} /></button>{overlay}</>;
}
