import { useState, useRef, useEffect, useState as useClientState } from "react";
import { useLocale } from "@/contexts/LocaleContext";
import { Reveal } from "@/components/site/Reveal";
import { SectionHeading } from "@/components/site/SectionHeading";
import { MapPin, Phone, Mail, Globe as GlobeIcon, ExternalLink, Compass } from "lucide-react";

// พิกัดสำนักงานใหญ่ประเทศไทย (จุดเริ่มต้นเส้น Arc)
const HQ_LAT = 13.693;
const HQ_LNG = 100.539;

// ข้อมูลพิกัดและตัวแทนจำหน่ายทั้งหมด
const DEALERS_DATA = [
  {
    id: "thailand",
    country: "Thailand",
    city: "Bangkok",
    flag: "🇹🇭",
    lat: HQ_LAT,
    lng: HQ_LNG,
    dealers: [
      {
        name: "Fonzo Guitar Showroom (Headquarters)",
        address: "1338/928 Supalai Prima Riva, Rama 3 Road, Yannawa, Bangkok, Thailand 10120",
        tel: "+66 2051 2223, +66 99 291 1935",
        email: "fonzoguitars@gmail.com",
        web: "https://www.fonzoguitar.com/",
        fb: "Fonzo Guitar",
        ig: "fonzoguitar"
      }
    ]
  },
  {
    id: "japan",
    country: "Japan",
    city: "Tokyo / Osaka / Fukuoka / Kobe / Okayama / Ayagawa",
    flag: "🇯🇵",
    lat: 35.648,
    lng: 139.707,
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
    country: "USA & Canada",
    city: "Austin, Texas",
    flag: "🇺🇸",
    lat: 30.326,
    lng: -97.771,
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
    lat: -33.878,
    lng: 151.216,
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
    lat: 24.143,
    lng: 120.640,
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
    lat: 22.313,
    lng: 114.225,
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

// สร้างเส้น Arcs เชื่อมจากไทยไปประเทศต่างๆ
const ARCS_DATA = DEALERS_DATA.filter((d) => d.id !== "thailand").map((d) => ({
  startLat: HQ_LAT,
  startLng: HQ_LNG,
  endLat: d.lat,
  endLng: d.lng,
  color: ["rgba(212, 175, 55, 0.8)", "rgba(255, 223, 128, 0.9)"]
}));

export default function Dealers() {
  const { t } = useLocale();
  const globeRef = useRef<any>(null);
  const [GlobeComponent, setGlobeComponent] = useClientState<any>(null);
  const [selectedLocation, setSelectedLocation] = useState<any>(DEALERS_DATA[0]);

  useEffect(() => {
    import("react-globe.gl").then((mod) => {
      setGlobeComponent(() => mod.default);
    });
  }, []);

  useEffect(() => {
    if (globeRef.current) {
      try {
        globeRef.current.controls().autoRotate = true;
        globeRef.current.controls().autoRotateSpeed = 0.6;
      } catch (e) {
        console.error(e);
      }
    }
  }, [GlobeComponent]);

  const handlePointClick = (point: any) => {
    setSelectedLocation(point);
    if (globeRef.current) {
      try {
        globeRef.current.pointOfView({ lat: point.lat, lng: point.lng, altitude: 1.8 }, 1000);
      } catch (e) {
        console.error(e);
      }
    }
  };

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

      {/* ═════════ 3D Globe & Dealer Network Panel ═════════ */}
      <section className="mx-auto max-w-[1400px] px-4 pb-20 sm:px-6 lg:px-10">
        <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-stretch">
          
          {/* Globe Container */}
          <div className="relative flex min-h-[550px] w-full items-center justify-center overflow-hidden rounded-2xl border border-gold/30 bg-[#0a0a0c] shadow-2xl backdrop-blur-md">
            {GlobeComponent ? (
              <GlobeComponent
                ref={globeRef}
                globeImageUrl="//unpkg.com/three-globe/example/img/earth-blue-marble.jpg"
                bumpImageUrl="//unpkg.com/three-globe/example/img/earth-topology.png"
                // Points Data (หมุดเรืองแสง)
                pointsData={DEALERS_DATA}
                pointLat="lat"
                pointLng="lng"
                pointColor={() => "#d4af37"}
                pointAltitude={0.02}
                pointRadius={0.6}
                pointsMerge={false}
                onPointClick={handlePointClick}
                // Arcs Data (เส้นเชื่อมต่อสว่างสีทอง)
                arcsData={ARCS_DATA}
                arcStartLat="startLat"
                arcStartLng="startLng"
                arcEndLat="endLat"
                arcEndLng="endLng"
                arcColor="color"
                arcAltitude={0.2}
                arcStroke={1.2}
                arcDashLength={0.5}
                arcDashGap={0.2}
                arcDashAnimateTime={2500}
                // Rings Data (วงแหวนเรืองแสง)
                ringsData={DEALERS_DATA}
                ringLat="lat"
                ringLng="lng"
                ringColor={() => (t: number) => `rgba(212, 175, 55, ${1 - t})`}
                ringMaxRadius={6}
                ringPropagationSpeed={2}
                ringRepeatPeriod={1500}
                width={650}
                height={550}
                backgroundColor="rgba(0,0,0,0)"
              />
            ) : (
              <div className="flex flex-col items-center gap-3 text-gold/80 animate-pulse">
                <Compass className="h-8 w-8 animate-spin text-gold" />
                <p className="text-xs tracking-wider">กำลังโหลด 3D Interactive Network Map...</p>
              </div>
            )}

            <div className="pointer-events-none absolute bottom-4 left-4 rounded-full bg-black/80 px-4 py-2 text-xs text-gold border border-gold/30 backdrop-blur-md flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-gold animate-ping" />
              หมุนลูกโลก 3D และคลิกจุดปักหมุดเพื่อดูร้านค้าตัวแทน
            </div>
          </div>

          {/* Dealer Details Card */}
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

              {/* Country Selection Tabs */}
              <div className="mt-4 flex flex-wrap gap-2">
                {DEALERS_DATA.map((loc) => {
                  const isSelected = selectedLocation.id === loc.id;
                  return (
                    <button
                      key={loc.id}
                      onClick={() => handlePointClick(loc)}
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

              {/* Dealer List Cards */}
              <div className="mt-6 space-y-4 max-h-[380px] overflow-y-auto pr-2 custom-scrollbar">
                {selectedLocation.dealers.map((dealer: any, idx: number) => (
                  <div
                    key={idx}
                    className="rounded-xl border border-cream/10 bg-ink/70 p-5 transition-all hover:border-gold/50"
                  >
                    <h4 className="font-semibold text-gold text-base">{dealer.name}</h4>
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