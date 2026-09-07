import { useState } from "react";
import { useLocale } from "@/contexts/LocaleContext";
import { Reveal } from "@/components/site/Reveal";
import { CompactPageHeading } from "@/components/site/SiteLayout";
import { MapPin, Phone, Mail, Globe as GlobeIcon, ExternalLink, Store } from "lucide-react";
import { BRAND } from "@/lib/brand";

function convertGeoToPixel(lat: number, lng: number) {
  const x = ((lng + 180) * 1000) / 360;
  const y = ((90 - lat) * 500) / 180;
  return { x, y };
}

const HQ_LAT = 13.693;
const HQ_LNG = 100.539;
const HQ_POS = convertGeoToPixel(HQ_LAT, HQ_LNG);

type Dealer = {
  name: string;
  address: string;
  tel?: string;
  whatsapp?: string;
  email?: string;
  web?: string;
  storefrontImage?: string;
};

type DealerLocation = {
  id: string;
  country: string;
  city: string;
  flag: string;
  lat: number;
  lng: number;
  mainWeb?: string;
  dealers: Dealer[];
};

const DEALERS_DATA: DealerLocation[] = [
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
  const [activeLocationId, setActiveLocationId] = useState("thailand");
  const activeLocation = DEALERS_DATA.find(location => location.id === activeLocationId) ?? DEALERS_DATA[0];

  return (
    <div className="min-h-screen bg-[#f6f1e8] text-ink">
      <CompactPageHeading eyebrow={t("เครือข่ายทางการ", "Official Network")} title={t("ตัวแทนจำหน่าย Fonzo Guitars", "Fonzo Authorized Dealers")} crumbs={[{ label: t("ตัวแทนจำหน่าย", "Dealers") }]} />

      <section className="mx-auto max-w-[1400px] px-4 pb-20 sm:px-6 lg:px-10">
        <div className="relative min-h-[580px] w-full overflow-hidden rounded-2xl border border-gold/40 bg-white/75 p-4 shadow-xl backdrop-blur-md flex flex-col justify-between">
          <div className="relative h-[500px] w-full rounded-xl bg-[#ebe7df] border border-ink/10 overflow-visible flex items-center justify-center">
            
            <svg className="h-full w-full overflow-visible" viewBox="0 0 1000 500" preserveAspectRatio="xMidYMid meet">
              <image
                href="https://upload.wikimedia.org/wikipedia/commons/8/80/World_map_-_low_resolution.svg"
                x="0"
                y="0"
                width="1000"
                height="500"
                opacity="0.24"
                style={{ filter: "grayscale(1) contrast(0.9)" }}
              />

              <g opacity="0.12" stroke="#d4af37">
                <line x1="0" y1="125" x2="1000" y2="125" strokeDasharray="4 4" />
                <line x1="0" y1="250" x2="1000" y2="250" strokeWidth="1.5" />
                <line x1="0" y1="375" x2="1000" y2="375" strokeDasharray="4 4" />
                <line x1="250" y1="0" x2="250" y2="500" strokeDasharray="4 4" />
                <line x1="500" y1="0" x2="500" y2="500" strokeWidth="1.5" />
                <line x1="750" y1="0" x2="750" y2="500" strokeDasharray="4 4" />
              </g>

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
                      {/* Pins Image; details are shown in the persistent panel below the map. */}
                      <button type="button" onMouseEnter={() => setActiveLocationId(loc.id)} onFocus={() => setActiveLocationId(loc.id)} onClick={() => setActiveLocationId(loc.id)} aria-label={`${loc.country} ${loc.city}`} className={`relative flex h-8 w-8 items-center justify-center rounded-full border p-1.5 shadow-2xl transition-all duration-300 hover:scale-125 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold ${activeLocationId === loc.id ? "border-white bg-gold" : "border-gold/80 bg-black/90 hover:bg-gold hover:border-white"}`}>
                        <img
                          src={BRAND.logo}
                          alt="Fonzo Pin Logo"
                          className="h-full w-full object-contain"
                          onError={event => { event.currentTarget.style.display = "none"; }}
                        />
                      </button>

                    </div>
                  </foreignObject>
                );
              })}

            </svg>
          </div>

          {activeLocation && <div className="mt-4 grid gap-5 rounded-2xl border border-gold/50 bg-[#121216] p-5 text-cream shadow-xl sm:grid-cols-[220px_1fr] sm:p-6"><div className="overflow-hidden rounded-xl border border-cream/10 bg-ink-soft">{activeLocation.dealers[0]?.storefrontImage ? <img src={activeLocation.dealers[0].storefrontImage} alt={`${activeLocation.dealers[0].name} storefront`} className="h-36 w-full object-cover" /> : <div className="flex h-36 items-center justify-center gap-3 text-cream/45"><Store className="h-8 w-8 text-gold/70" strokeWidth={1.25} /><span className="text-[10px] tracking-[0.14em] uppercase">Store preview</span></div>}</div><div><div className="flex flex-wrap items-center gap-2 text-[10px] font-semibold tracking-[0.14em] text-gold uppercase"><MapPin className="h-3 w-3" />{activeLocation.flag} {activeLocation.city}</div><h3 className="mt-2 font-display text-2xl text-cream">{activeLocation.country}</h3><div className="mt-4 grid gap-3 sm:grid-cols-2">{activeLocation.dealers.map((dealer, index) => <div key={index} className="border border-cream/10 bg-ink/70 p-3"><p className="text-xs font-semibold text-gold">{dealer.name}</p><p className="mt-1 text-[11px] leading-relaxed text-cream/70">{dealer.address}</p><div className="mt-2 flex flex-wrap gap-2 text-[10px] text-cream/80">{dealer.tel && <span className="flex items-center gap-1"><Phone className="h-3 w-3 text-gold" />{dealer.tel}</span>}{dealer.web && <a href={dealer.web} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-gold hover:underline"><GlobeIcon className="h-3 w-3" />Visit</a>}</div></div>)}</div></div></div>}

          <div className="mt-3 flex items-center justify-between text-xs text-ink/70 px-2">
            <span className="flex items-center gap-2 text-gold font-medium">
              <span className="h-2 w-2 rounded-full bg-gold animate-pulse" />
              ชี้หรือแตะหมุดเพื่อเลือกประเทศ รายละเอียดจะค้างอยู่ด้านล่างแผนที่จนกว่าจะเลือกตำแหน่งใหม่
            </span>
              <span className="text-ink/45">Fonzo Guitars Official Global Network</span>
          </div>
        </div>
      </section>
    </div>
  );
}
