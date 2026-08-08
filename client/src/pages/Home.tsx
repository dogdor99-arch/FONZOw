/**
 * Homepage — rebuilt as a numbered editorial sequence.
 *
 * The layout is deliberately asymmetric: a dark full-bleed hero with the brand
 * statement set against workshop photography, then chapters that alternate
 * between wide photographic panels and tighter product grids. The newsroom sits
 * high in the page because live activity is what gives a shop credibility.
 */

import { Link } from "wouter";
import { ArrowRight, ArrowUpRight, Award, Hammer, Sparkles } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useLocale } from "@/contexts/LocaleContext";
import { BRAND } from "@/lib/brand";
import { Reveal } from "@/components/site/Reveal";
import { ProductCard, ProductCardSkeleton } from "@/components/site/ProductCard";
import { SectionHeading } from "@/components/site/SectionHeading";
import { SocialGrid } from "@/components/site/SocialGrid";
import { ChannelStrip } from "@/components/site/ChannelStrip";
import { NowTicker } from "@/components/site/NowTicker";
import { Button } from "@/components/ui/button";

const MEDIA = "/api/fonzo-media";
const HERO_IMAGE = `${MEDIA}/album_img/8b8eaac7-69a9-4c90-bb16-63e52a8f1e9f.jpg`;
const HERO_INSET = `${MEDIA}/album_img/7fecea5e-a8e0-4cce-886e-49a4466ce229.jpg`;
const CRAFT_A = `${MEDIA}/album_img/b83efbc3-2917-40ce-9fc1-d9e68167a1f7.jpg`;
const CRAFT_B = `${MEDIA}/album_img/c2bce7da-465f-46a8-bb6a-81e1979f6867.jpg`;
const CRAFT_C = `${MEDIA}/album_img/b55095ca-101e-4191-9734-9a9573981355.jpg`;
const FOUNDER_PORTRAIT = `${MEDIA}/about_us/a7fd6d1b-2fc1-49f2-a426-b89c00e1a16c.jpg`;
const ATELIER_IMAGE = `${MEDIA}/brand_story/78dc4a29-c00f-4342-b42c-b584a1c4625b.jpg`;
const PLAYER_IMAGE = `${MEDIA}/album_img/2d1d8371-4a41-44e2-b019-bcec233d0dda.jpg`;

export default function Home() {
  const { locale, t } = useLocale();
  const { data: types = [] } = trpc.fonzo.guitars.types.useQuery();
  const { data: guitars = [], isLoading } = trpc.fonzo.guitars.list.useQuery();
  const { data: catalogs = [] } = trpc.fonzo.content.catalogs.useQuery();

  const featured = guitars.filter(g => g.popular).slice(0, 8);
  const showcase = (featured.length >= 4 ? featured : guitars.slice(0, 8)).slice(0, 6);
  const priced = guitars.filter(g => g.price !== null).slice(0, 3);
  const catalog = catalogs[0];

  return (
    <>
      {/* ═════════ Hero ═════════ */}
      <section className="surface-deep relative overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={HERO_IMAGE}
            alt=""
            className="ken-burns h-full w-full object-cover opacity-30"
          />
          <div className="absolute inset-0 bg-linear-to-t from-ink via-ink/70 to-ink/45" />
        </div>

        <div className="relative mx-auto max-w-[1400px] px-4 pt-20 pb-16 sm:px-6 lg:px-10 lg:pt-32 lg:pb-24">
          <div className="grid gap-14 lg:grid-cols-[1.15fr_0.85fr] lg:items-end lg:gap-20">
            <div>
              <Reveal>
                <p className="eyebrow text-gold/85">
                  {t("ตั้งแต่ พ.ศ. 2560 · กรุงเทพฯ", "Est. 2017 · Bangkok")}
                </p>
              </Reveal>
              <Reveal delay={70}>
                <h1 className="mt-7 text-[2.6rem] leading-[1.02] text-cream sm:text-[3.6rem] lg:text-[4.75rem]">
                  {t("กีตาร์ที่สร้างจาก", "Guitars born from")}
                  <br />
                  <em className="not-italic text-gold">
                    {t("ประสบการณ์เวทีโลก", "world-stage experience")}
                  </em>
                </h1>
              </Reveal>
              <Reveal delay={130}>
                <p className="mt-9 max-w-xl text-[15px] leading-[1.95] text-cream/70">
                  {t(
                    "ก่อตั้งโดยเบิร์ด เอกชัย เจียรกุล คนไทยและคนเอเชียคนแรกที่คว้ารางวัลชนะเลิศ GFA International Concert Artist Competition ทุกโครงสร้างและวัสดุคัดเลือกร่วมกับช่างทำกีตาร์ระดับโลก",
                    "Founded by Bird Ekachai Jearakul — the first Thai and first Asian to win the GFA International Concert Artist Competition. Every structure and material is selected alongside world-renowned luthiers.",
                  )}
                </p>
              </Reveal>
              <Reveal delay={190}>
                <div className="mt-11 flex flex-wrap items-center gap-3">
                  <Button
                    asChild
                    className="press h-12 rounded-none bg-cream px-8 text-[11px] font-semibold tracking-[0.2em] text-ink uppercase hover:bg-cream/90">
                    <Link href="/guitar">{t("ชมกีตาร์ทั้งหมด", "Explore guitars")}</Link>
                  </Button>
                  <Button
                    asChild
                    variant="outline"
                    className="press h-12 rounded-none border-cream/30 px-8 text-[11px] font-semibold tracking-[0.2em] text-cream uppercase hover:border-gold hover:bg-cream/5 hover:text-gold">
                    <Link href="/shop">{t("ซื้อออนไลน์", "Shop online")}</Link>
                  </Button>
                  <a
                    href="#newsroom"
                    className="link-underline ml-1 inline-flex items-center gap-2 text-[11px] tracking-[0.18em] text-cream/60 uppercase hover:text-cream">
                    {t("ความเคลื่อนไหวล่าสุด", "Latest activity")}
                    <ArrowRight className="h-3.5 w-3.5" strokeWidth={1.7} />
                  </a>
                </div>
              </Reveal>
            </div>

            <Reveal delay={250}>
              <div className="relative">
                <div className="ml-auto hidden w-full max-w-[320px] overflow-hidden lg:block">
                  <img src={HERO_INSET} alt="" className="aspect-3/4 w-full object-cover" />
                </div>
                <dl className="mt-10 grid grid-cols-3 gap-6 border-t border-cream/15 pt-8 lg:mt-8">
                  <HeroStat label={t("รุ่นกีตาร์", "Models")} value={guitars.length || "—"} />
                  <HeroStat label={t("คอลเลกชัน", "Collections")} value={types.length || "—"} />
                  <HeroStat label={t("ประเทศ", "Made in")} value={t("ไทย", "Thailand")} />
                </dl>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Live ticker sits directly under the hero, still on the dark surface. */}
      <NowTicker />

      {/* ═════════ 01 · Live image wall (Instagram / TikTok / Facebook / YouTube) ═════════ */}
      <SocialGrid index="01" limit={12} className="py-20 lg:py-28" />

      {/* Official channels */}
      <ChannelStrip />

      {/* ═════════ 02 · Craft ═════════ */}
      <section className="mx-auto max-w-[1400px] px-4 py-20 sm:px-6 lg:px-10 lg:py-28">
        <Reveal>
          <SectionHeading
            index="02"
            eyebrow={t("เหตุผลที่เลือก Fonzo", "Why Fonzo")}
            title={t("งานฝีมือที่วัดได้ในทุกมิลลิเมตร", "Craft you can measure")}
            description={t(
              "ทุกตัวถูกทดลองเล่นและปรับเสียงก่อนออกจำหน่าย โดยยึดมาตรฐานเดียวกับกีตาร์ระดับคอนเสิร์ต",
              "Every instrument is played, voiced and checked to concert-grade standards before it leaves the workshop.",
            )}
          />
        </Reveal>

        <div className="mt-14 grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center lg:gap-16">
          <div className="grid grid-cols-2 gap-3">
            <Reveal>
              <img src={CRAFT_B} alt="" loading="lazy" className="aspect-3/4 w-full object-cover" />
            </Reveal>
            <div className="grid gap-3">
              <Reveal delay={70}>
                <img src={CRAFT_A} alt="" loading="lazy" className="aspect-4/3 w-full object-cover" />
              </Reveal>
              <Reveal delay={130}>
                <img src={CRAFT_C} alt="" loading="lazy" className="aspect-4/3 w-full object-cover" />
              </Reveal>
            </div>
          </div>

          <div className="divide-y divide-border/70">
            {[
              {
                icon: Award,
                title: t("ออกแบบโดยศิลปินระดับโลก", "Designed by a world-class artist"),
                body: t(
                  "ทุกรุ่นผ่านการทดลองเล่นและปรับแต่งโดยเบิร์ด เอกชัย เจียรกุล ก่อนออกจำหน่าย",
                  "Every model is played, tested and voiced by Bird Ekachai Jearakul before release.",
                ),
              },
              {
                icon: Hammer,
                title: t("โครงสร้างระดับช่างทำมือ", "Luthier-grade construction"),
                body: t(
                  "โครงสร้างอ้างอิงจากช่างทำชื่อดังในสเปน เยอรมัน และอเมริกา ทั้งแบบดั้งเดิมและสมัยใหม่",
                  "Bracing referenced from renowned makers in Spain, Germany and the USA — traditional and modern.",
                ),
              },
              {
                icon: Sparkles,
                title: t("การันตีคุณภาพเสียง", "Guaranteed tone"),
                body: t(
                  "คัดเลือกไม้และวัสดุคุณภาพสูง พร้อมตรวจสอบเสียงทุกตัวก่อนส่งมอบให้ลูกค้า",
                  "High-grade tonewoods, with each instrument sound-checked before delivery.",
                ),
              },
            ].map((item, index) => (
              <Reveal key={item.title} delay={index * 70}>
                <div className="flex gap-6 py-7 first:pt-0">
                  <item.icon className="mt-1 h-5 w-5 shrink-0 text-gold" strokeWidth={1.4} />
                  <div>
                    <h3 className="font-display text-xl leading-snug">{item.title}</h3>
                    <p className="mt-2.5 text-sm leading-relaxed text-muted-foreground">{item.body}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ═════════ 03 · Collections ═════════ */}
      <section className="rule-top bg-cream/50">
        <div className="mx-auto max-w-[1400px] px-4 py-20 sm:px-6 lg:px-10 lg:py-28">
          <Reveal>
            <SectionHeading
              index="03"
              eyebrow={t("คอลเลกชัน", "Collections")}
              title={t("เลือกตามแนวการเล่นของคุณ", "Find your voice")}
              action={{ label: t("ดูทั้งหมด", "View all"), href: "/guitar" }}
            />
          </Reveal>

          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {types.map((type, index) => (
              <Reveal key={type.code} delay={index * 60}>
                <Link href={`/guitar?type=${type.code}`} className="group lift block">
                  <div className="relative aspect-4/5 overflow-hidden bg-secondary">
                    {type.image && (
                      <img
                        src={type.image}
                        alt={type.name}
                        loading="lazy"
                        className="h-full w-full object-cover transition-transform duration-700 [transition-timing-function:cubic-bezier(0.23,1,0.32,1)] group-hover:scale-[1.06]"
                      />
                    )}
                    <div className="absolute inset-0 bg-linear-to-t from-ink/85 via-ink/15 to-transparent" />
                    <div className="absolute inset-x-0 bottom-0 p-5">
                      <p className="text-[10px] tracking-[0.2em] text-cream/65 uppercase">
                        {type.count} {t("รุ่น", "models")}
                      </p>
                      <h3 className="mt-1.5 flex items-center gap-2 font-display text-2xl text-cream">
                        {type.name}
                        <ArrowUpRight
                          className="h-4 w-4 -translate-x-1 opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100"
                          strokeWidth={1.6}
                        />
                      </h3>
                    </div>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ═════════ 04 · Featured instruments ═════════ */}
      <section className="rule-top">
        <div className="mx-auto max-w-[1400px] px-4 py-20 sm:px-6 lg:px-10 lg:py-28">
          <Reveal>
            <SectionHeading
              index="04"
              eyebrow={t("คัดสรรพิเศษ", "Curated")}
              title={t("รุ่นที่น่าจับตามอง", "Instruments to know")}
              action={{ label: t("ดูกีตาร์ทั้งหมด", "All guitars"), href: "/guitar" }}
            />
          </Reveal>

          <div className="mt-12 grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
            {isLoading
              ? Array.from({ length: 3 }).map((_, i) => <ProductCardSkeleton key={i} />)
              : showcase.map((product, index) => (
                  <Reveal key={product.code} delay={index * 50}>
                    <ProductCard product={product} basePath="/guitar" />
                  </Reveal>
                ))}
          </div>
        </div>
      </section>

      {/* ═════════ 05 · Founder ═════════ */}
      <section className="rule-top bg-cream/50">
        <div className="mx-auto grid max-w-[1400px] items-center gap-12 px-4 py-20 sm:px-6 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20 lg:px-10 lg:py-28">
          <Reveal>
            <div className="relative">
              <img
                src={FOUNDER_PORTRAIT}
                alt={t(BRAND.founder.th, BRAND.founder.en)}
                className="w-full object-cover"
              />
              <div className="pointer-events-none absolute -right-5 -bottom-5 hidden h-28 w-28 border border-gold/50 lg:block" />
            </div>
          </Reveal>
          <Reveal delay={80}>
            <div className="flex items-baseline gap-4">
              <span className="section-index">05</span>
              <p className="eyebrow">{t("ผู้ก่อตั้ง", "Founder")}</p>
            </div>
            <h2 className="mt-4 text-3xl sm:text-[2.6rem]">
              {locale === "th" ? BRAND.founder.th : BRAND.founder.en}
            </h2>
            <blockquote className="mt-8 border-l border-gold/60 pl-6 font-display text-xl leading-relaxed italic">
              {t(
                "“สำหรับผม กีตาร์ไม่ใช่เพียงเครื่องดนตรี แต่มันคือชีวิตทั้งหมด คือหัวใจและจิตวิญญาณในตัวผม”",
                "“For me, the guitar is not just a musical instrument, it is my whole life, it is the heart and soul within me.”",
              )}
            </blockquote>
            <p className="mt-8 text-[15px] leading-[1.9] text-muted-foreground">
              {t(
                "ทุกปีเบิร์ดเดินทางไปพบช่างทำกีตาร์ระดับโลกในหลายประเทศ นำองค์ความรู้และประสบการณ์เหล่านั้นมาสร้างแบรนด์กีตาร์ของตัวเอง เพื่อให้ผู้ที่รักกีตาร์ได้ครอบครองเครื่องดนตรีคุณภาพสูงในราคาที่สมเหตุสมผล",
                "Each year Bird travels to meet some of the world's finest luthiers, translating that knowledge into his own guitar brand so that players can own a top-quality instrument at a reasonable price.",
              )}
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Button
                asChild
                variant="outline"
                className="press h-11 rounded-none border-foreground/25 px-6 text-[11px] tracking-[0.18em] uppercase hover:border-brand hover:text-brand">
                <Link href="/founder">{t("อ่านประวัติทั้งหมด", "Read the full story")}</Link>
              </Button>
              <Button
                asChild
                variant="ghost"
                className="press h-11 rounded-none px-6 text-[11px] tracking-[0.18em] text-brand uppercase">
                <Link href="/brand-story">{t("เรื่องราวแบรนด์", "Brand story")}</Link>
              </Button>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ═════════ 06 · Ready to play ═════════ */}
      {priced.length > 0 && (
        <section className="rule-top">
          <div className="mx-auto max-w-[1400px] px-4 py-20 sm:px-6 lg:px-10 lg:py-28">
            <Reveal>
              <SectionHeading
                index="06"
                eyebrow={t("พร้อมจัดส่ง", "Ready to play")}
                title={t("รุ่นที่แสดงราคาชัดเจน", "Priced and available")}
                description={t(
                  "สั่งซื้อได้ทันทีผ่านร้านทางการบน Shopee และ Lazada หรือสอบถามทีมงานทาง Facebook",
                  "Order right away from our official Shopee and Lazada stores, or ask the team on Facebook.",
                )}
                action={{ label: t("ดูช่องทางสั่งซื้อ", "Where to buy"), href: "/shop" }}
              />
            </Reveal>
            <div className="mt-12 grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
              {priced.map((product, index) => (
                <Reveal key={product.code} delay={index * 50}>
                  <ProductCard product={product} basePath="/guitar" />
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ═════════ 07 · Catalogue panel ═════════ */}
      <section className="rule-top">
        <div className="mx-auto grid max-w-[1400px] gap-0 lg:grid-cols-2">
          <div className="relative min-h-[340px] lg:min-h-[520px]">
            <img
              src={ATELIER_IMAGE}
              alt={t("เรื่องราวแบรนด์ Fonzo", "Fonzo brand story")}
              loading="lazy"
              className="absolute inset-0 h-full w-full object-cover"
            />
          </div>
          <div className="flex flex-col justify-center bg-cream/60 px-4 py-16 sm:px-6 lg:px-16 lg:py-20">
            <Reveal>
              <div className="flex items-baseline gap-4">
                <span className="section-index">07</span>
                <p className="eyebrow">{t("แคตตาล็อก", "Catalogue")}</p>
              </div>
              <h2 className="mt-4 text-3xl sm:text-[2.4rem]">
                {t("ศึกษารายละเอียดทุกรุ่นอย่างละเอียด", "Study every model in detail")}
              </h2>
              <p className="mt-6 max-w-xl text-[15px] leading-[1.9] text-muted-foreground">
                {t(
                  "ดาวน์โหลดโบรชัวร์ฉบับล่าสุดเพื่อดูสเปควัสดุ โครงสร้าง และรายละเอียดของแต่ละซีรีส์ หรือทักหาเราเพื่อขอคำแนะนำแบบตัวต่อตัว",
                  "Download the latest brochure for materials, bracing and series-by-series detail — or reach out for a one-to-one consultation.",
                )}
              </p>
              <div className="mt-9 flex flex-wrap gap-3">
                {catalog?.fileUrl && (
                  <Button
                    asChild
                    className="press h-11 rounded-none bg-brand px-6 text-[11px] tracking-[0.18em] text-brand-foreground uppercase hover:bg-brand/90">
                    <a href={catalog.fileUrl} target="_blank" rel="noreferrer">
                      {t("เปิดโบรชัวร์", "Open brochure")}
                    </a>
                  </Button>
                )}
                <Button
                  asChild
                  variant="outline"
                  className="press h-11 rounded-none border-foreground/25 px-6 text-[11px] tracking-[0.18em] uppercase hover:border-brand hover:text-brand">
                  <Link href="/catalog">{t("ดูหน้าแคตตาล็อก", "Catalogue page")}</Link>
                </Button>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ═════════ 08 · Marketplace ═════════ */}
      <section className="surface-deep relative overflow-hidden">
        <img
          src={PLAYER_IMAGE}
          alt=""
          loading="lazy"
          className="absolute inset-0 h-full w-full object-cover opacity-15"
        />
        <div className="relative mx-auto grid max-w-[1400px] items-center gap-12 px-4 py-20 sm:px-6 lg:grid-cols-[1.15fr_0.85fr] lg:gap-20 lg:px-10 lg:py-28">
          <Reveal>
            <div className="flex items-baseline gap-4">
              <span className="section-index">08</span>
              <p className="eyebrow text-cream/55">{t("ชุมชนคนรักกีตาร์", "Community")}</p>
            </div>
            <h2 className="mt-4 text-3xl text-cream sm:text-[2.6rem]">
              {t("ตลาดซื้อขายและแลกเปลี่ยนกีตาร์", "The Fonzo trading floor")}
            </h2>
            <p className="mt-7 max-w-xl text-[15px] leading-[1.95] text-cream/70">
              {t(
                "พื้นที่สำหรับนักสะสมและผู้เล่นที่ต้องการซื้อ ขาย หรือแลกเปลี่ยนกีตาร์มือสอง ลงประกาศฟรีเมื่อเข้าสู่ระบบ พร้อมพูดคุยกับผู้ขายได้โดยตรง",
                "A space for collectors and players to buy, sell or trade pre-owned instruments. Sign in to list for free and message sellers directly.",
              )}
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Button
                asChild
                className="press h-11 rounded-none bg-cream px-6 text-[11px] tracking-[0.18em] text-ink uppercase hover:bg-cream/90">
                <Link href="/marketplace">{t("เข้าสู่ตลาดซื้อขาย", "Enter marketplace")}</Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="press h-11 rounded-none border-cream/30 px-6 text-[11px] tracking-[0.18em] text-cream uppercase hover:border-gold hover:bg-cream/5 hover:text-gold">
                <Link href="/marketplace/new">{t("ลงประกาศขาย", "Post a listing")}</Link>
              </Button>
            </div>
          </Reveal>

          <Reveal delay={80}>
            <div className="border border-cream/15 bg-ink/40 p-8 backdrop-blur-sm">
              <p className="font-display text-5xl text-gold">{guitars.length || "—"}</p>
              <p className="mt-2 text-sm text-cream/65">
                {t("รุ่นกีตาร์ในแคตตาล็อกอย่างเป็นทางการ", "models in the official catalogue")}
              </p>
              <div className="my-7 h-px bg-cream/15" />
              <p className="text-sm leading-relaxed text-cream/65">
                {t(
                  "ทุกประกาศต้องเข้าสู่ระบบก่อนลง เพื่อให้การซื้อขายโปร่งใสและตรวจสอบได้",
                  "Every listing requires sign-in, keeping trades transparent and accountable.",
                )}
              </p>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}

function HeroStat({ label, value }: { label: string; value: string | number }) {
  return (
    <div>
      <dt className="text-[10px] tracking-[0.18em] text-cream/45 uppercase">{label}</dt>
      <dd className="mt-2.5 font-display text-lg text-cream sm:text-xl">{value}</dd>
    </div>
  );
}
