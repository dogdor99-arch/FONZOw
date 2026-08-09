import { useState } from "react";
import { useLocale } from "@/contexts/LocaleContext";
import { Reveal } from "@/components/site/Reveal";
import { SectionHeading } from "@/components/site/SectionHeading";
import { MapPin, Phone, Mail, Globe as GlobeIcon, ExternalLink, Store } from "lucide-react";

const DEALERS_DATA = [
  {
    id: "thailand",
    country: "Thailand",
    city: "Bangkok (HQ)",
    flag: "🇹🇭",
    x: 77.0, // พิกัด % ปักหมุดบนแผนที่โลกจริง
    y: 52.5,
    mainWeb: "https://www.fonzoguitar.com/",
    fb: "Fonzo Guitar",
    ig: "fonzoguitar",
    dealers: [
      {
        name: "Fonzo Guitar Showroom (Headquarters)",
        address: "1338/928 Supalai Prima Riva, Rama 3 Road, Yannawa, Bangkok, Thailand 10120",
        tel: "+66 2051 2223, +66 99 291 1935",
        email: "fonzoguitars@gmail.com"
      }
    ]
  },
  {
    id: "japan",
    country: "Japan",
    city: "Tokyo / Osaka / Fukuoka / Kobe",
    flag: "🇯🇵",
    x: 88.0,
    y: 36.0,
    mainWeb: "https://fonzoguitar.jp/",
    fb: "Fonzo Guitar Japan",
    ig: "fonzojapan",
    dealers: [
      {
        name: "Dolphin Guitars - Tokyo Store",
        address: "150-0021 東京都渋谷区恵比寿西1-10-8 本間ビル4Ｆ",
        tel: "03-6415-3580",
        email: "ebisu@dolphin-gt.co.jp",
        web: "https://www.dolphin-gt.co.jp/"
      },
      {
        name: "Dolphin Guitars - Osaka Store",
        address: "564-0063 大阪府吹田市江坂町1-23-34 第2梓ビル5F",
        tel: "06-6310-6180",
        email: "esaka@dolphin-gt.co.jp",
        web: "https://www.dolphin-gt.co.jp/"
      },
      {
        name: "Dolphin Guitars - Fukuoka Store",
        address: "810-0041 福岡県福岡市中央区大名2-6-40 文學の森ビル2F",
        tel: "09-2752-2275",
        email: "fukuoka@dolphin-gt.co.jp",
        web: "https://www.dolphin-gt.co.jp/"
      },
      {
        name: "Shimamura Music - Kobe Store",
        address: "〒650-0021 兵庫県神戸市中央区三宮町1-5-26三宮オーパ5F・7F",
        tel: "078-327-3611",
        web: "https://www.shimamura.co.jp/"
      },
      {
        name: "Shimamura Music - Okayama Store",
        address: "〒700-0907 岡山県岡山市北区下石井1-2-1イオンモール岡山5F",
        tel: "086-803-5880",
        web: "https://www.shimamura.co.jp/"
      },
      {
        name: "Shimamura Music - Ayagawa Store",
        address: "〒761-2304 香川県綾歌郡綾川町萱原822-1イオンモール綾川2F",
        tel: "087-870-8055",
        web: "https://www.shimamura.co.jp/"
      }
    ]
  },
  {
    id: "usa",
    country: "USA & Canada",
    city: "Austin, Texas",
    flag: "🇺🇸",
    x: 23.5,
    y: 38.0,
    dealers: [
      {
        name: "Guitar Collection",
        address: "Austin, Texas, US 78731",
        email: "theguitarcollection@gmail.com",
        web: "https://www.guitarcollection.com/"
      }
    ]
  },
  {
    id: "australia",
    country: "Australia",
    city: "Sydney, NSW",
    flag: "🇦🇺",
    x: 87.5,
    y: 78.0,
    dealers: [
      {
        name: "Brett Guitar Studio",
        address: "1 Francis Street, Darlinghurst, Sydney, NSW 2010, Australia",
        tel: "+61 434 583 096",
        whatsapp: "+61 434 583 096",
        email: "gbrett40@gmail.com",
        web: "https://www.gomezguitar.com.au/"
      }
    ]
  },
  {
    id: "taiwan",
    country: "Taiwan",
    city: "Taichung City",
    flag: "🇹🇼",
    x: 81.5,
    y: 47.0,
    ig: "fonzoguitartaiwan",
    dealers: [
      {
        name: "Cheng Feng Music",
        address: "2F., No. 138, Wenshan 3rd St., Nantun Dist., Taichung City, Taiwan, 408",
        email: "marketing@cfmusic.com.tw",
        web: "https://cfmusic.com.tw/brands/fonzo-guitar/"
      }
    ]
  },
  {
    id: "hongkong",
    country: "Hong Kong",
    city: "Kwun Tong",
    flag: "🇭🇰",
    x: 79.2,
    y: 47.5,
    dealers: [
      {
        name: "Tab Generation",
        address: "RM 122A, BLOCK A, 1/F, MAI GAR INDUSTRIAL BUILDING, 146 WAI YIP ST KWUN TONG, KL, HONG KONG",
        tel: "+852 98364244",
        email: "chwingmusic@gmail.com",
        web: "https://tabgeneration.com/"
      }
    ]
  },
  {
    id: "china",
    country: "China",
    city: "Zhejiang / Xi'an / Chongqing",
    flag: "🇨🇳",
    x: 75.5,
    y: 40.0,
    dealers: [
      { name: "原声吉他琴行", address: "Ping Chang Hua Fu, Sui Chang County, Li Shui, Zhe Jiang Province, China", tel: "+86 13735986951" },
      { name: "艺佳琴行", address: "No.43 Nan Guo Road, Bei Lin District, Xi An, Shan Xi Province, China", tel: "+86 18691039306" },
      { name: "琴海琴行", address: "No.19 Nan Hu Road, Nan An District, Chong Qing, China", tel: "+86 13108964737" }
    ]
  }
];

export default function Dealers() {
  const { t } = useLocale();
  const [selectedLocation, setSelectedLocation] = useState(DEALERS_DATA[0]);

  return (
    <div className="min-h-screen bg-ink text-cream">
      {/* ═════════ Header ═════════ */}
      <section className="mx-auto max-w-[1400px] px-4 pt-16 pb-8 sm:px-6 lg:px-10">
        <Reveal>
          <SectionHeading
            index="01"
            eyebrow={t("เครือข่ายทางการ", "Official Network")}
            title={t("ตัวแทนจำหน่าย Fonzo Guitars", "Fonzo Authorized Dealers")}
            description={t(
              "สัมผัสและทดลองเล่นกีตาร์ Fonzo ได้ที่โชว์รูมและร้านค้าตัวแทนจำหน่ายชั้นนำทั่วโลก",
              "Experience Fonzo guitars at official showrooms and premier guitar shops worldwide."
            )}
          />
        </Reveal>
      </section>

      {/* ═════════ Real 2D Vector World Map Section ═════════ */}
      <section className="mx-auto max-w-[1400px] px-4 pb-20 sm:px-6 lg:px-10">
        <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-start">
          
          {/* Real World Map Container */}
          <div className="relative min-h-[500px] w-full overflow-hidden rounded-2xl border border-gold/30 bg-[#0d0d12] p-4 shadow-2xl backdrop-blur-md flex flex-col justify-between">
            
            {/* Real World Map Canvas */}
            <div className="relative h-[420px] w-full rounded-xl bg-[#09090c] border border-white/5 overflow-hidden flex items-center justify-center">
              
              {/* รูปแผนที่โลกจริงแบบ HD Vector Map Background */}
              <div 
                className="absolute inset-0 h-full w-full bg-contain bg-center bg-no-repeat opacity-25 mix-blend-screen"
                style={{
                  backgroundImage: `url('https://raw.githubusercontent.com/johan/world.geo.json/master/countries.geo.json')`,
                  filter: 'invert(1) sepia(1) saturate(5) hue-rotate(10deg)'
                }}
              />

              {/* Real World Grid Overlay */}
              <svg className="absolute inset-0 h-full w-full opacity-20" viewBox="0 0 1000 500" preserveAspectRatio="none">
                <line x1="0" y1="125" x2="1000" y2="125" stroke="#d4af37" strokeDasharray="4 4" />
                <line x1="0" y1="250" x2="1000" y2="250" stroke="#d4af37" strokeWidth="1.5" />
                <line x1="0" y1="375" x2="1000" y2="375" stroke="#d4af37" strokeDasharray="4 4" />
                <line x1="250" y1="0" x2="250" y2="500" stroke="#d4af37" strokeDasharray="4 4" />
                <line x1="500" y1="0" x2="500" y2="500" stroke="#d4af37" strokeWidth="1.5" />
                <line x1="750" y1="0" x2="750" y2="500" stroke="#d4af37" strokeDasharray="4 4" />
              </svg>

              {/* Map SVG Image Fallback (แผนที่ทวีปโลกจริงสีทอง) */}
              <img
                src="https://upload.wikimedia.org/wikipedia/commons/8/80/World_map_-_low_resolution.svg"
                alt="World Map"
                className="absolute inset-0 h-full w-full object-contain opacity-20 filter invert sepia saturate-200 hue-rotate-15 pointer-events-none"
              />

              {/* Connecting Golden Arcs */}
              <svg className="pointer-events-none absolute inset-0 h-full w-full z-10">
                {DEALERS_DATA.filter(d => d.id !== "thailand").map((d, i) => (
                  <path
                    key={i}
                    d={`M ${DEALERS_DATA[0].x * 10} ${DEALERS_DATA[0].y * 4.2} Q ${(DEALERS_DATA[0].x + d.x) * 5} ${(DEALERS_DATA[0].y + d.y) * 1.8} ${d.x * 10} ${d.y * 4.2}`}
                    fill="none"
                    stroke="#d4af37"
                    strokeWidth="1.5"
                    strokeDasharray="4 4"
                    opacity="0.7"
                  />
                ))}
              </svg>

              {/* Location Pin Buttons */}
              {DEALERS_DATA.map((loc) => {
                const isSelected = selectedLocation.id === loc.id;
                return (
                  <button
                    key={loc.id}
                    onClick={() => setSelectedLocation(loc)}
                    style={{ left: `${loc.x}%`, top: `${loc.y}%` }}
                    className="group absolute -translate-x-1/2 -translate-y-1/2 transition-all duration-300 focus:outline-none z-20"
                  >
                    {/* Ring Pulse Effect */}
                    {isSelected && (
                      <span className="absolute -inset-2.5 rounded-full bg-gold/50 animate-ping" />
                    )}

                    {/* Pin Label Box */}
                    <div className={`relative flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold shadow-2xl transition-all ${
                      isSelected
                        ? "bg-gold text-ink scale-110 shadow-gold/80 ring-2 ring-gold"
                        : "bg-black/90 text-gold border border-gold/60 hover:bg-gold hover:text-ink hover:scale-105"
                    }`}>
                      <span className="text-sm">{loc.flag}</span>
                      <span>{loc.country}</span>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Map Footer */}
            <div className="mt-3 flex items-center justify-between text-xs text-cream/70 px-2">
              <span className="flex items-center gap-2 text-gold font-medium">
                <span className="h-2.5 w-2.5 rounded-full bg-gold animate-pulse" />
                คลิกที่หมุดบนแผนที่โลกเพื่อดูรายชื่อโชว์รูมและตัวแทนจำหน่าย
              </span>
              <span className="text-cream/40">Fonzo Global Dealer Network</span>
            </div>
          </div>

          {/* Dealer Information Panel */}
          <div className="flex flex-col justify-between rounded-2xl border border-gold/30 bg-secondary/40 p-6 sm:p-8 backdrop-blur-md shadow-2xl">
            <div>
              {/* Header Info */}
              <div className="flex items-center justify-between border-b border-cream/10 pb-4">
                <div>
                  <div className="flex items-center gap-2 text-xs font-semibold tracking-widest text-gold uppercase">
                    <MapPin className="h-4 w-4" /> {selectedLocation.city}
                  </div>
                  <h3 className="mt-1 text-2xl font-display text-cream flex items-center gap-2">
                    <span>{selectedLocation.flag}</span> {selectedLocation.country}
                  </h3>
                </div>
                {selectedLocation.mainWeb && (
                  <a
                    href={selectedLocation.mainWeb}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1.5 rounded-full border border-gold/40 bg-gold/10 px-3 py-1.5 text-xs text-gold hover:bg-gold hover:text-ink transition"
                  >
                    <GlobeIcon className="h-3.5 w-3.5" /> Website
                  </a>
                )}
              </div>

              {/* Quick Country Buttons */}
              <div className="mt-4 flex flex-wrap gap-2">
                {DEALERS_DATA.map((loc) => {
                  const isSelected = selectedLocation.id === loc.id;
                  return (
                    <button
                      key={loc.id}
                      onClick={() => setSelectedLocation(loc)}
                      className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                        isSelected
                          ? "bg-gold text-ink font-bold shadow-md shadow-gold/20"
                          : "bg-white/5 text-cream/70 hover:bg-white/10 hover:text-cream border border-cream/10"
                      }`}
                    >
                      <span>{loc.flag}</span>
                      <span>{loc.country}</span>
                    </button>
                  );
                })}
              </div>

              {/* Dealer Cards */}
              <div className="mt-6 space-y-4 max-h-[380px] overflow-y-auto pr-2 custom-scrollbar">
                {selectedLocation.dealers.map((dealer: any, idx: number) => (
                  <div
                    key={idx}
                    className="rounded-xl border border-cream/10 bg-ink/70 p-5 transition-all hover:border-gold/50"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="font-semibold text-gold text-base">{dealer.name}</h4>
                      <Store className="h-4 w-4 text-gold/60 shrink-0 mt-1" />
                    </div>

                    <p className="mt-2 text-xs leading-relaxed text-cream/75">{dealer.address}</p>

                    <div className="mt-4 flex flex-wrap gap-3 border-t border-cream/10 pt-3 text-xs text-cream/80">
                      {dealer.tel && (
                        <div className="flex items-center gap-1.5">
                          <Phone className="h-3.5 w-3.5 text-gold shrink-0" />
                          <span>{dealer.tel}</span>
                        </div>
                      )}
                      {dealer.email && (
                        <div className="flex items-center gap-1.5">
                          <Mail className="h-3.5 w-3.5 text-gold shrink-0" />
                          <a href={`mailto:${dealer.email}`} className="hover:text-gold transition underline">
                            {dealer.email}
                          </a>
                        </div>
                      )}
                      {dealer.web && (
                        <a
                          href={dealer.web}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center gap-1 text-gold hover:underline font-medium"
                        >
                          <GlobeIcon className="h-3.5 w-3.5" /> Visit Site <ExternalLink className="h-3 w-3" />
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-6 border-t border-cream/10 pt-4 text-center text-xs text-cream/50">
              Fonzo Guitars Official Global Network
            </div>
          </div>

        </div>
      </section>
    </div>
  );
}