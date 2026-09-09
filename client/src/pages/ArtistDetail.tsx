import { ArrowLeft, ChevronLeft, ChevronRight, Guitar, Images } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Link, useParams } from "wouter";
import { trpc } from "@/lib/trpc";
import { useLocale } from "@/contexts/LocaleContext";
import { ImageLightbox } from "@/components/site/ImageLightbox";

export default function ArtistDetail() {
  const { id } = useParams();
  const { locale, t } = useLocale();
  const { data: artists = [], isLoading } = trpc.artists.list.useQuery();
  const artist = artists.find(item => String(item.id) === String(id));
  const galleryRef = useRef<HTMLDivElement>(null);
  const [galleryPaused, setGalleryPaused] = useState(false);
  const gallery = artist ? [...(artist.galleryUrls || []), artist.collaborationImageUrl].filter(Boolean) as string[] : [];
  const scrollGallery = (amount: number) => galleryRef.current?.scrollBy({ left: amount, behavior: "smooth" });

  useEffect(() => {
    if (gallery.length < 2 || galleryPaused) return;
    const timer = window.setInterval(() => {
      const node = galleryRef.current;
      if (!node) return;
      const step = Math.min(360, node.clientWidth * 0.72);
      const next = node.scrollLeft + step;
      node.scrollTo({ left: next >= node.scrollWidth - node.clientWidth - 4 ? 0 : next, behavior: "smooth" });
    }, 8500);
    return () => window.clearInterval(timer);
  }, [gallery.length, galleryPaused]);

  if (isLoading) return <div className="mx-auto max-w-6xl px-4 py-24">Loading...</div>;
  if (!artist) return <div className="mx-auto max-w-2xl px-4 py-24 text-center"><h1 className="font-display text-3xl">{t("ไม่พบข้อมูลศิลปิน", "Artist not found")}</h1><Link href="/artists" className="mt-6 inline-flex bg-brand px-5 py-3 text-xs uppercase tracking-widest text-brand-foreground">{t("กลับไปศิลปิน", "Back to artists")}</Link></div>;

  const title = locale === "th" ? artist.name : artist.nameEn || artist.name;
  const role = locale === "th" ? artist.role : artist.roleEn || artist.role;
  const bio = locale === "th" ? artist.bio : artist.bioEn || artist.bio;

  return <>
    <section className="border-b border-border/70 bg-cream/40 px-4 py-3 sm:px-6 lg:px-10"><div className="mx-auto max-w-[1400px] lg:pl-12"><Link href="/artists" className="inline-flex items-center text-[10px] uppercase tracking-[0.14em] text-muted-foreground hover:text-brand"><ArrowLeft className="mr-1.5 h-3.5 w-3.5" />{t("กลับไปศิลปินของ Fonzo", "Back to Fonzo artists")}</Link><p className="mt-2 text-[10px] tracking-[0.16em] text-brand uppercase">{role || "Fonzo Artist"}</p><h1 className="mt-1 font-display text-3xl leading-none sm:text-4xl">{title}</h1>{artist.guitar && <div className="mt-3 flex items-center gap-2 text-sm text-foreground/75"><span>{artist.guitar}</span>{artist.guitarUrl && <a href={artist.guitarUrl} target="_blank" rel="noreferrer" aria-label={t("ดูกีตาร์รุ่นนี้", "View this guitar")} className="text-brand hover:text-gold"><Guitar className="h-4 w-4" /></a>}</div>}</div></section>
    <main className="mx-auto max-w-[1500px] px-4 py-8 sm:px-6 lg:px-10 lg:py-10"><div className="grid min-h-[470px] items-center gap-6 lg:grid-cols-[1.02fr_0.98fr] lg:gap-10"><div className="relative flex min-h-[330px] items-center justify-center overflow-hidden bg-[radial-gradient(circle_at_center,rgba(194,151,78,0.16),transparent_62%)] sm:min-h-[440px] lg:min-h-[540px] lg:px-10"><ImageLightbox src={artist.imageUrl || "/fonzo-logo.png"} alt={title} imageClassName="h-full max-h-[620px] w-full object-contain object-center mix-blend-multiply" /></div><div className="lg:pt-8"><p className="eyebrow text-brand">{t("ข้อมูลศิลปิน", "Artist profile")}</p>{bio && <p className="mt-6 whitespace-pre-line text-base leading-[1.95] text-muted-foreground">{bio}</p>}</div></div>
      <section className="mt-14 border-t border-border/70 pt-8"><div className="flex items-center gap-3"><Images className="h-5 w-5 text-brand" /><h2 className="font-display text-2xl sm:text-3xl">{t("ภาพประกอบ", "Supporting images")}</h2></div>{gallery.length ? <div className="relative mt-6"><button type="button" onClick={() => scrollGallery(-440)} className="absolute left-2 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center border border-border bg-cream/90 text-brand shadow-sm transition hover:border-brand hover:bg-brand hover:text-brand-foreground" aria-label={t("ภาพก่อนหน้า", "Previous image")}><ChevronLeft className="h-5 w-5" /></button><div ref={galleryRef} onMouseEnter={() => setGalleryPaused(true)} onMouseLeave={() => setGalleryPaused(false)} className="flex snap-x gap-4 overflow-x-auto pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">{gallery.map((image, index) => <div key={`${image}-${index}`} className="h-64 w-[78vw] max-w-[420px] shrink-0 snap-start overflow-hidden bg-secondary sm:h-80"><ImageLightbox src={image} alt={`${title} ${index + 1}`} imageClassName="h-full w-full object-cover" loading="lazy" /></div>)}</div><button type="button" onClick={() => scrollGallery(440)} className="absolute right-2 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center border border-border bg-cream/90 text-brand shadow-sm transition hover:border-brand hover:bg-brand hover:text-brand-foreground" aria-label={t("ภาพถัดไป", "Next image")}><ChevronRight className="h-5 w-5" /></button></div> : <p className="mt-5 text-sm text-muted-foreground">{t("ยังไม่มีภาพประกอบ", "No supporting images yet")}</p>}</section>
    </main>
  </>;
}
