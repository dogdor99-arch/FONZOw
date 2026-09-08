import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Minus, Plus, RotateCcw, X } from "lucide-react";

type Props = { src: string; alt?: string; className?: string; imageClassName?: string; loading?: "eager" | "lazy" };

const MIN_SCALE = 1;
const MAX_SCALE = 4;
const SCALE_STEP = 0.5;

export function ImageLightbox({ src, alt = "", className = "", imageClassName = "", loading = "eager" }: Props) {
  const [open, setOpen] = useState(false);
  const [scale, setScale] = useState(MIN_SCALE);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const drag = useRef({ active: false, x: 0, y: 0, startX: 0, startY: 0 });

  const reset = () => {
    setScale(MIN_SCALE);
    setOffset({ x: 0, y: 0 });
  };

  const close = () => {
    setOpen(false);
    reset();
  };

  const changeScale = (next: number) => {
    const clamped = Math.min(MAX_SCALE, Math.max(MIN_SCALE, next));
    setScale(clamped);
    if (clamped === MIN_SCALE) setOffset({ x: 0, y: 0 });
  };

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
      if (event.key === "+" || event.key === "=") changeScale(scale + SCALE_STEP);
      if (event.key === "-") changeScale(scale - SCALE_STEP);
      if (event.key === "0") reset();
    };
    document.addEventListener("keydown", onKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.removeEventListener("keydown", onKeyDown); document.body.style.overflow = previousOverflow; };
  }, [open, scale]);

  const onPointerDown = (event: React.PointerEvent<HTMLImageElement>) => {
    if (scale === MIN_SCALE) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    drag.current = { active: true, x: offset.x, y: offset.y, startX: event.clientX, startY: event.clientY };
  };
  const onPointerMove = (event: React.PointerEvent<HTMLImageElement>) => {
    if (!drag.current.active) return;
    setOffset({ x: drag.current.x + event.clientX - drag.current.startX, y: drag.current.y + event.clientY - drag.current.startY });
  };
  const onPointerUp = () => { drag.current.active = false; };
  const onWheel = (event: React.WheelEvent<HTMLDivElement>) => {
    event.preventDefault();
    changeScale(scale + (event.deltaY < 0 ? SCALE_STEP : -SCALE_STEP));
  };

  const overlay = open && typeof document !== "undefined" ? createPortal(
    <div className="fixed inset-0 z-[100] bg-black/95" role="dialog" aria-modal="true" aria-label="Image preview" onClick={close}>
      <div className="absolute inset-0 flex items-center justify-center overflow-hidden p-12 sm:p-16" onClick={event => event.stopPropagation()} onWheel={onWheel}>
        <img src={src} alt={alt} draggable={false} onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={onPointerUp} onPointerCancel={onPointerUp} onDoubleClick={() => changeScale(scale === MIN_SCALE ? 2 : MIN_SCALE)} className={`max-h-[88vh] max-w-[92vw] select-none object-contain ${scale > MIN_SCALE ? "cursor-grab active:cursor-grabbing" : "cursor-zoom-in"} ${imageClassName}`} style={{ transform: `translate(${offset.x}px, ${offset.y}px) scale(${scale})`, transformOrigin: "center center", transition: drag.current.active ? "none" : "transform 180ms ease-out" }} />
      </div>
      <button type="button" onClick={close} className="absolute right-4 top-4 z-10 flex h-11 w-11 items-center justify-center rounded-full bg-white/15 text-white transition hover:bg-white/30" aria-label="Close image"><X className="h-6 w-6" /></button>
      <div className="absolute bottom-5 left-1/2 z-10 flex -translate-x-1/2 items-center gap-1 rounded-full bg-black/70 p-1 text-white shadow-lg">
        <button type="button" onClick={() => changeScale(scale - SCALE_STEP)} disabled={scale === MIN_SCALE} className="flex h-9 w-9 items-center justify-center rounded-full transition hover:bg-white/15 disabled:opacity-35" aria-label="Zoom out"><Minus className="h-4 w-4" /></button>
        <span className="min-w-12 text-center text-[10px] tracking-[0.1em]">{Math.round(scale * 100)}%</span>
        <button type="button" onClick={() => changeScale(scale + SCALE_STEP)} disabled={scale === MAX_SCALE} className="flex h-9 w-9 items-center justify-center rounded-full transition hover:bg-white/15 disabled:opacity-35" aria-label="Zoom in"><Plus className="h-4 w-4" /></button>
        <button type="button" onClick={reset} className="ml-1 flex h-9 w-9 items-center justify-center rounded-full transition hover:bg-white/15" aria-label="Reset zoom"><RotateCcw className="h-3.5 w-3.5" /></button>
      </div>
      <p className="absolute bottom-6 left-4 hidden text-[10px] tracking-[0.08em] text-white/55 sm:block">เลื่อนเมาส์เพื่อซูม · ลากภาพเพื่ออ่านรายละเอียด · Esc เพื่อปิด</p>
    </div>,
    document.body,
  ) : null;

  return <><button type="button" onClick={() => setOpen(true)} className={`block h-full w-full cursor-zoom-in ${className}`} aria-label="Open image"><img src={src} alt={alt} loading={loading} className={imageClassName || "h-full w-full object-contain"} /></button>{overlay}</>;
}
