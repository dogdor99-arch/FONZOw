import { useState, useRef, useEffect, useState as useClientState } from "react";
import { useLocale } from "@/contexts/LocaleContext";
import { Reveal } from "@/components/site/Reveal";
import { SectionHeading } from "@/components/site/SectionHeading";
import { MapPin, Phone, Mail, Globe as GlobeIcon, ExternalLink } from "lucide-react";

// ข้อมูลพิกัดลูกโลกและตัวแทนจำหน่าย
const DEALERS_DATA = [
  {
    country: "Thailand",
    city: "Bangkok",
    lat: 13.693,
    lng: 100.539,
    dealers: [
      {
        name: "Fonzo Guitar Showroom",
        address: "1338/928 Supalai Prima Riva, Rama 3 Road, Yannawa, Bangkok, Thailand 10120",
        tel: "+66 2051 2223, +66 99 291 1935",
        email: "fonzoguitars@gmail.com",
        web: "https://www.fonzoguitar.com/"
      }
    ]
  },
  {
    country: "Japan",
    city: "Tokyo / Osaka / Fukuoka / Kobe",
    lat: 35.648,
    lng: 139.707,
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
        email: "esaka@dolphin-gt.co.jp"
      },
      {
        name: "Dolphin Guitars - Fukuoka Store",
        address: "810-0041 福岡県福岡市中央区大名2-6-40 文學の森ビル2F",
        tel: "09-2752-2275",
        email: "fukuoka@dolphin-gt.co.jp"
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
        tel: "086-803-5880"
      },
      {
        name: "Shimamura Music - Ayagawa Store",
        address: "〒761-2304 香川県綾歌郡綾川町萱原822-1イオンモール綾川2F",
        tel: "087-870-8055"
      }
    ]
  },
  {
    country: "United States & Canada",
    city: "Austin, Texas",
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
    country: "Australia",
    city: "Sydney",
    lat: -33.878,
    lng: 151.216,
    dealers: [
      {
        name: "Brett Guitar Studio",
        address: "1 Francis Street, Darlinghurst, Sydney, NSW 2010, Australia",
        tel: "+61 434 583 096",
        email: "gbrett40@gmail.com",
        web: "https://www.gomezguitar.com.au/"
      }
    ]
  },
  {
    country: "Taiwan",
    city: "Taichung",
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
    country: "Hong Kong",
    city: "Kwun Tong",
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
    country: "China",
    city: "Zhejiang / Xi'an / Chongqing",
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
  const globeRef = useRef<any>(null);
  const [GlobeComponent, setGlobeComponent] = useClientState<any>(null);
  const [selectedLocation, setSelectedLocation] = useState<any>(DEALERS_DATA[0]);

  // โหลด Globe แบบ Client-Side Only ป้องกันการติด Error ฝั่ง Render Server
  useEffect(() => {
    import("react-globe.gl").then((mod) => {
      setGlobeComponent(() => mod.default);
    });
  }, []);

  useEffect(() => {
    if (globeRef.current) {
      try {
        globeRef.current.controls().autoRotate = true;
        globeRef.current.controls().autoRotateSpeed = 0.8;
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

      {/* ═════════ 3D Globe Section ═════════ */}
      <section className="mx-auto max-w-[1400px] px-4 pb-20 sm:px-6 lg:px-10">
        <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
          
          {/* Globe Container */}
          <div className="relative flex h-[520px] w-full items-center justify-center overflow-hidden rounded-2xl border border-gold/30 bg-black/80 shadow-2xl backdrop-blur-md">
            {GlobeComponent ? (
              <GlobeComponent
                ref={globeRef}
                globeImageUrl="//unpkg.com/three-globe/example/img/earth-night.jpg"
                bumpImageUrl="//unpkg.com/three-globe/example/img/earth-topology.png"
                pointsData={DEALERS_DATA}
                pointLat="lat"
                pointLng="lng"
                pointColor={() => "#d4af37"}
                pointAltitude={0.08}
                pointRadius={0.8}
                pointsMerge={false}
                onPointClick={handlePointClick}
                width={680}
                height={520}
                backgroundColor="rgba(0,0,0,0)"
              />
            ) : (
              <div className="flex flex-col items-center gap-3 text-gold/70 animate-pulse">
                <div className="h-8 w-8 rounded-full border-2 border-gold border-t-transparent animate-spin" />
                <p className="text-xs">กำลังโหลดลูกโลก 3D Interactive...</p>
              </div>
            )}

            <div className="pointer-events-none absolute bottom-4 left-4 rounded-full bg-black/80 px-4 py-2 text-xs text-gold border border-gold/30 backdrop-blur-sm">
              🌍 หมุนลูกโลก 3D และคลิกที่จุดสีทองเพื่อดูรายละเอียดตัวแทนจำหน่าย
            </div>
          </div>

          {/* Selected Location Card */}
          <div className="rounded-2xl border border-gold/30 bg-secondary/40 p-6 sm:p-8 backdrop-blur-md">
            <div className="flex items-center gap-2 text-xs font-semibold tracking-widest text-gold uppercase">
              <MapPin className="h-4 w-4" /> {selectedLocation.country} — {selectedLocation.city}
            </div>
            <h3 className="mt-2 text-2xl font-display text-cream">
              {selectedLocation.country} Authorized Network
            </h3>

            {/* List of Countries Buttons for Quick Navigation */}
            <div className="mt-4 flex flex-wrap gap-1.5 border-b border-cream/10 pb-4">
              {DEALERS_DATA.map((loc, i) => (
                <button
                  key={i}
                  onClick={() => handlePointClick(loc)}
                  className={`rounded-md px-2.5 py-1 text-xs transition-all ${
                    selectedLocation.country === loc.country
                      ? "bg-gold text-ink font-semibold"
                      : "bg-white/5 text-cream/70 hover:bg-white/10 hover:text-cream"
                  }`}
                >
                  {loc.country}
                </button>
              ))}
            </div>

            {/* Selected Dealer List */}
            <div className="mt-6 space-y-6 max-h-[360px] overflow-y-auto pr-2">
              {selectedLocation.dealers.map((dealer: any, idx: number) => (
                <div key={idx} className="border-t border-cream/10 pt-4 first:border-0 first:pt-0">
                  <h4 className="font-semibold text-gold text-lg">{dealer.name}</h4>
                  <p className="mt-2 text-sm text-cream/70 leading-relaxed">{dealer.address}</p>
                  
                  <div className="mt-3 flex flex-wrap gap-4 text-xs text-cream/80">
                    {dealer.tel && (
                      <span className="flex items-center gap-1.5"><Phone className="h-3.5 w-3.5 text-gold" /> {dealer.tel}</span>
                    )}
                    {dealer.email && (
                      <span className="flex items-center gap-1.5"><Mail className="h-3.5 w-3.5 text-gold" /> {dealer.email}</span>
                    )}
                    {dealer.web && (
                      <a href={dealer.web} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-gold hover:underline">
                        <GlobeIcon className="h-3.5 w-3.5" /> Website <ExternalLink className="h-3 w-3" />
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </section>
    </div>
  );
}