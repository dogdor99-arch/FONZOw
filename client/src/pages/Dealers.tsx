import { useState } from "react";
import { useLocale } from "@/contexts/LocaleContext";
import { Reveal } from "@/components/site/Reveal";
import { SectionHeading } from "@/components/site/SectionHeading";
import { MapPin, Phone, Mail, Globe as GlobeIcon, ExternalLink, Store } from "lucide-react";

// ฟังก์ชันแปลง ละติจูด/ลองจิจูด เป็น พิกัด X, Y บนแผนที่สเกล 1000x500
function convertGeoToPixel(lat: number, lng: number) {
  const x = ((lng + 180) * 1000) / 360;
  const y = ((90 - lat) * 500) / 180;
  return { x, y };
}

// พิกัดสำนักงานใหญ่ประเทศไทย
const HQ_LAT = 13.693;
const HQ_LNG = 100.539;
const HQ_POS = convertGeoToPixel(HQ_LAT, HQ_LNG);

// ข้อมูลพิกัดละติจูด/ลองจิจูดจริงของแต่ละเมือง
const DEALERS_DATA = [
  {
    id: "thailand",
    country: "Thailand",
    city: "Bangkok (HQ)",
    flag: "🇹🇭",
    lat: HQ_LAT,
    lng: HQ_LNG,
    mainWeb: "https://www.fonzoguitar.com/",
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
    lat: 35.676,
    lng: 139.650,
    mainWeb: "https://fonzoguitar.jp/",
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
    country: "United States & Canada",
    city: "Austin, Texas",
    flag: "🇺🇸",
    lat: 30.267,
    lng: -97.743,
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
    lat: -33.868,
    lng: 151.209,
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
    lat: 24.147,
    lng: 120.673,
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
    lat: 22.319,
    lng: 114.169,
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
    lat: 34.341,
    lng: 108.939,
    dealers: [
      { name: "原声吉他琴行", address: "Ping Chang Hua Fu, Sui Chang County, Li Shui, Zhe Jiang Province, China", tel: "+86 13735986951" },
      { name: "艺佳琴行", address: "No.43 Nan Guo Road, Bei Lin District, Xi An, Shan Xi Province, China", tel: "+86 18691039306" },
      { name: "琴海琴行", address: "No.19 Nan Hu Road, Nan An District, Chong Qing, China", tel: "+86 13108964737" }
    ]
  }
];

export default function Dealers() {
  const { t } = useLocale();

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

      {/* ═════════ Precision Full-Width World Map ═════════ */}
      <section className="mx-auto max-w-[1400px] px-4 pb-20 sm:px-6 lg:px-10">
        <div className="relative min-h-[580px] w-full overflow-hidden rounded-2xl border border-gold/30 bg-[#09090c] p-4 shadow-2xl backdrop-blur-md flex flex-col justify-between">
          
          {/* Map Viewport Area */}
          <div className="relative h-[500px] w-full rounded-xl bg-[#0d0d12] border border-white/5 overflow-hidden flex items-center justify-center">
            
            {/* SVG Container ความละเอียดสูง 1000x500 */}
            <svg className="h-full w-full" viewBox="0 0 1000 500" preserveAspectRatio="xMidYMid meet">
              
              {/* Background Image: ภาพแผนที่โลก Equirectangular สเกลเป๊ะ */}
              <image
                href="https://upload.wikimedia.org/wikipedia/commons/8/80/World_map_-_low_resolution.svg"
                x="0"
                y="0"
                width="1000"
                height="500"
                opacity="0.22"
                style={{ filter: "invert(1) sepia(1) saturate(5) hue-rotate(10deg)" }}
              />

              {/* Grid Lines */}
              <g opacity="0.12" stroke="#d4af37">
                <line x1="0" y1="125" x2="1000" y2="125" strokeDasharray="4 4" />
                <line x1="0" y1="250" x2="1000" y2="250" strokeWidth="1.5" />
                <line x1="0" y1="375" x2="1000" y2="375" strokeDasharray="4 4" />
                <line x1="250" y1="0" x2="250" y2="500" strokeDasharray="4 4" />
                <line x1="500" y1="0" x2="500" y2="500" strokeWidth="1.5" />
                <line x1="750" y1="0" x2="750" y2="500" strokeDasharray="4 4" />
              </g>

              {/* Golden Connecting Arcs พุ่งออกจากประเทศไทย */}
              <g>
                {DEALERS_DATA.filter((d) => d.id !== "thailand").map((d, i) => {
                  const targetPos = convertGeoToPixel(d.lat, d.lng);
                  const controlX = (HQ_POS.x + targetPos.x) / 2;
                  const controlY = Math.min(HQ_POS.y, targetPos.y) - 60;
                  return (
                    <path
                      key={i}
                      d={`M ${HQ_POS.x} ${HQ_POS.y} Q ${controlX} ${controlY} ${targetPos.x} ${targetPos.y}`}
                      fill="none"
                      stroke="#d4af37"
                      strokeWidth="1.5"
                      strokeDasharray="4 4"
                      opacity="0.65"
                    />
                  );
                })}
              </g>

              {/* Pins placed at precise Geo Coordinates */}
              {DEALERS_DATA.map((loc) => {
                const pos = convertGeoToPixel(loc.lat, loc.lng);
                return (
                  <foreignObject
                    key={loc.id}
                    x={pos.x - 20}
                    y={pos.y - 20}
                    width="40"
                    height="40"
                    className="overflow-visible"
                  >
                    <div className="group relative flex h-full w-full items-center justify-center">
                      
                      {/* Hover Popover Box */}
                      <div className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-3 hidden group-hover:flex flex-col items-center z-50 transition-all duration-300 animate-in fade-in slide-in-from-bottom-2">
                        <div className="w-[300px] sm:w-[330px] rounded-2xl bg-[#121216]/95 border border-gold/60 p-5 shadow-2xl backdrop-blur-xl pointer-events-auto text-left">
                          
                          {/* Popover Header */}
                          <div className="flex items-center justify-between border-b border-cream/10 pb-3">
                            <div>
                              <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase text-gold">
                                <MapPin className="h-3 w-3" /> {loc.city}
                              </div>
                              <h4 className="text-lg font-display text-cream flex items-center gap-2 mt-0.5">
                                <span>{loc.flag}</span> {loc.country}
                              </h4>
                            </div>
                            {loc.mainWeb && (
                              <a
                                href={loc.mainWeb}
                                target="_blank"
                                rel="noreferrer"
                                className="flex items-center gap-1 rounded-full border border-gold/40 bg-gold/10 px-2.5 py-1 text-[10px] text-gold hover:bg-gold hover:text-ink transition"
                              >
                                <GlobeIcon className="h-3 w-3" /> Site
                              </a>
                            )}
                          </div>

                          {/* Popover Dealer Items */}
                          <div className="mt-3 space-y-2.5 max-h-[200px] overflow-y-auto pr-1 custom-scrollbar">
                            {loc.dealers.map((dealer, idx) => (
                              <div key={idx} className="rounded-lg border border-white/5 bg-ink/80 p-3">
                                <div className="flex items-start justify-between gap-1">
                                  <span className="font-semibold text-gold text-xs">{dealer.name}</span>
                                  <Store className="h-3.5 w-3.5 text-gold/60 shrink-0" />
                                </div>
                                <p className="mt-1 text-[11px] leading-relaxed text-cream/70">{dealer.address}</p>
                                
                                <div className="mt-2 flex flex-wrap gap-2 border-t border-cream/10 pt-2 text-[10px] text-cream/80">
                                  {dealer.tel && (
                                    <span className="flex items-center gap-1">
                                      <Phone className="h-3 w-3 text-gold shrink-0" /> {dealer.tel}
                                    </span>
                                  )}
                                  {dealer.email && (
                                    <a href={`mailto:${dealer.email}`} className="flex items-center gap-1 text-gold hover:underline">
                                      <Mail className="h-3 w-3 shrink-0" /> Email
                                    </a>
                                  )}
                                  {dealer.web && (
                                    <a href={dealer.web} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-gold hover:underline font-medium">
                                      <GlobeIcon className="h-3 w-3" /> Visit <ExternalLink className="h-2.5 w-2.5" />
                                    </a>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>

                        </div>
                        {/* Arrow Indicator */}
                        <div className="h-2 w-2 rotate-45 bg-[#121216] border-r border-b border-gold/50 -mt-1" />
                      </div>

                      {/* Official Fonzo Logo Pin Crest Button (Vector SVG) */}
                      <button className="relative flex h-8 w-8 items-center justify-center rounded-full border border-gold/80 bg-black/90 p-1 shadow-2xl transition-all duration-300 hover:bg-gold hover:scale-125 hover:border-white focus:outline-none group/btn">
                        <svg className="h-5 w-5 fill-gold transition-colors group-hover/btn:fill-ink" viewBox="0 0 24 24">
                          <path d="M19.5 3.5C18 3.5 15.5 4.2 13.8 5.5C13 6.1 12.3 6.9 11.8 7.8C11.5 7.2 11.1 6.6 10.5 6.1C9.2 5 7.3 4.5 5.5 4.5C4 4.5 2.5 4.9 1.5 5.5L2 7.5C2.8 7 3.9 6.7 5.2 6.7C6.6 6.7 8 7.1 9 7.9C10.2 8.9 10.8 10.3 10.8 11.8V19.5C10.8 20.3 10.2 21 9.5 21C8.8 21 8.2 20.3 8.2 19.5V14.5C8.2 13 7.2 11.8 5.8 11.5C4.2 11.2 2.8 12.2 2.5 13.8C2.4 14.2 2.3 14.8 2.3 15.3C2.3 18.5 4.8 21 8 21C11.3 21 13.8 18.5 13.8 15.3V12.8C14.5 11.5 15.8 10.5 17.3 10.1C18.2 9.8 19.2 9.8 20.1 10.1L21 8.2C19.8 7.7 18.5 7.5 17.2 7.8C16.2 8 15.2 8.5 14.3 9.3V8.2C15.5 7 17.2 6.2 19 6.2C20.1 6.2 21.2 6.5 22 7L22.8 5.1C21.8 4.1 20.7 3.5 19.5 3.5Z"/>
                        </svg>
                      </button>

                    </div>
                  </foreignObject>
                );
              })}

            </svg>

          </div>

          {/* Footer Bar */}
          <div className="mt-3 flex items-center justify-between text-xs text-cream/70 px-2">
            <span className="flex items-center gap-2 text-gold font-medium">
              <span className="h-2 w-2 rounded-full bg-gold animate-pulse" />
              เลื่อนเมาส์ชี้ หรือ แตะที่หมุดโลโก้ Fonzo เพื่อเปิดดูรายละเอียดตัวแทนจำหน่าย
            </span>
            <span className="text-cream/40">Fonzo Guitars Official Global Network</span>
          </div>

        </div>
      </section>
    </div>
  );
}