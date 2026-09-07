import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

type Props = { src: string; alt?: string; className?: string; imageClassName?: string; loading?: "eager" | "lazy" };

export function ImageLightbox({ src, alt = "", className = "", imageClassName = "", loading = "eager" }: Props) {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => { if (event.key === "Escape") setOpen(false); };
    document.addEventListener("keydown", onKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.removeEventListener("keydown", onKeyDown); document.body.style.overflow = previousOverflow; };
  }, [open]);

  const overlay = open && typeof document !== "undefined" ? createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4 sm:p-10" role="dialog" aria-modal="true" aria-label="Image preview" onClick={() => setOpen(false)}>
      <button type="button" onClick={() => setOpen(false)} className="absolute left-4 top-4 z-10 flex h-11 w-11 items-center justify-center rounded-full bg-white/15 text-white transition hover:bg-white/30" aria-label="Close image"><X className="h-6 w-6" /></button>
      <img src={src} alt={alt} className="max-h-[92vh] max-w-[94vw] object-contain" onClick={event => event.stopPropagation()} />
    </div>,
    document.body,
  ) : null;

  return <>
    <button type="button" onClick={() => setOpen(true)} className={`block h-full w-full cursor-zoom-in ${className}`} aria-label="Open image">
      <img src={src} alt={alt} loading={loading} className={imageClassName || "h-full w-full object-contain"} />
    </button>
    {overlay}
  </>;
}
