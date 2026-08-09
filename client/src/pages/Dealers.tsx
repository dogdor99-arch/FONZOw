import { useState } from "react";
import { useLocale } from "@/contexts/LocaleContext";
import { Reveal } from "@/components/site/Reveal";
import { SectionHeading } from "@/components/site/SectionHeading";
import { MapPin, Phone, Mail, Globe as GlobeIcon, ExternalLink, ChevronRight, Store } from "lucide-react";

// ข้อมูลตัวแทนจำหน่ายแบ่งตามประเทศ
const NETWORK_DATA = [
  {
    id: "thailand",
    country: "Thailand",
    flag: "🇹🇭",
    locationName: "Bangkok (Headquarters)",
    mainWeb: "https://www.fonzoguitar.com/",
    fb: "Fonzo Guitar",
    ig: "fonzoguitar",
    dealers: [
      {
        name: "Fonzo Guitar Showroom",
        address: "1338/928 Supalai Prima Riva, Rama 3 Road, Yannawa, Bangkok, Thailand 10120",
        tel: "+66 2051 2223, +66 99 291 1935",
        email: "fonzoguitars@gmail.com"
      }
    ]
  },
  {
    id: "japan",
    country: "Japan",
    flag: "🇯🇵",
    locationName: "Tokyo / Osaka / Fukuoka / Kobe / Okayama / Ayagawa",
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
    country: "United States & Canada",
    flag: "🇺🇸",
    locationName: "Austin, Texas",
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
    flag: "🇦🇺",
    locationName: "Sydney, NSW",
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
    flag: "🇹🇼",
    locationName: "Taichung City",
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
    flag: "🇭🇰",
    locationName: "Kwun Tong",
    dealers: [
      {
        name: "Tab Generation",
        address: "RM 122A, BLOCK A, 1/F, MAI GAR INDUSTRIAL BUILDING, 146 WAI YIP ST KWUN TONG, KL, HONG KONG",
        tel: "+852 98364244",
        email: "chwingmusic@gmail.com",
        web: "https://tabgeneration.com/",
        ig: "tab.generation"
      }
    ]
  },
  {
    id: "china",
    country: "China",
    flag: "🇨🇳",
    locationName: "Zhejiang / Xi'an / Chongqing",
    dealers: [
      {
        name: "原声吉他琴行",
        address: "Ping Chang Hua Fu, Sui Chang County, Li Shui, Zhe Jiang Province, China",
        tel: "+86 13735986951"
      },
      {
        name: "艺佳琴行",
        address: "No.43 Nan Guo Road, Bei Lin District, Xi An, Shan Xi Province, China",
        tel: "+86 18691039306"
      },
      {
        name: "琴海琴行",
        address: "No.19 Nan Hu Road, Nan An District, Chong Qing, China",
        tel: "+86 13108964737"
      }
    ]
  }
];

export default function Dealers() {
  const { t } = useLocale();
  const [activeCountry, setActiveCountry] = useState("thailand");

  const activeData = NETWORK_DATA.find((item) => item.id === activeCountry) || NETWORK_DATA[0];

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

      {/* ═════════ Interactive Country Selector & Dealer Cards ═════════ */}
      <section className="mx-auto max-w-[1400px] px-4 pb-20 sm:px-6 lg:px-10">
        
        {/* Country Filter Bar */}
        <div className="flex flex-wrap items-center gap-2 border-b border-cream/15 pb-6">
          {NETWORK_DATA.map((item) => {
            const isActive = item.id === activeCountry;
            return (
              <button
                key={item.id}
                onClick={() => setActiveCountry(item.id)}
                className={`flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? "bg-gold text-ink shadow-lg shadow-gold/20 font-semibold"
                    : "bg-secondary/40 text-cream/70 hover:bg-secondary hover:text-cream border border-cream/10"
                }`}
              >
                <span>{item.flag}</span>
                <span>{item.country}</span>
                <span className="ml-1 rounded-full bg-ink/20 px-2 py-0.5 text-[11px]">
                  {item.dealers.length}
                </span>
              </button>
            );
          })}
        </div>

        {/* Country Header Info */}
        <div className="mt-8 rounded-2xl border border-gold/30 bg-secondary/30 p-6 sm:p-8 backdrop-blur-sm">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-cream/10 pb-6">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold tracking-widest text-gold uppercase">
                <MapPin className="h-4 w-4" /> {activeData.locationName}
              </div>
              <h2 className="mt-1 text-3xl font-display text-cream flex items-center gap-3">
                <span>{activeData.flag}</span> {activeData.country}
              </h2>
            </div>

            {/* Country level links */}
            <div className="flex flex-wrap gap-4 text-xs text-cream/80">
              {activeData.mainWeb && (
                <a
                  href={activeData.mainWeb}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1.5 rounded-full border border-gold/40 bg-gold/10 px-3.5 py-1.5 text-gold hover:bg-gold hover:text-ink transition"
                >
                  <GlobeIcon className="h-3.5 w-3.5" /> Official Website <ExternalLink className="h-3 w-3" />
                </a>
              )}
              {activeData.fb && (
                <span className="flex items-center gap-1.5 rounded-full border border-cream/15 bg-white/5 px-3.5 py-1.5">
                  Facebook: {activeData.fb}
                </span>
              )}
              {activeData.ig && (
                <span className="flex items-center gap-1.5 rounded-full border border-cream/15 bg-white/5 px-3.5 py-1.5">
                  Instagram: @{activeData.ig}
                </span>
              )}
            </div>
          </div>

          {/* Dealer Cards Grid */}
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {activeData.dealers.map((dealer, idx) => (
              <div
                key={idx}
                className="group relative flex flex-col justify-between rounded-xl border border-cream/10 bg-ink/60 p-6 transition-all duration-300 hover:border-gold/50 hover:shadow-xl hover:shadow-gold/5"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-semibold text-lg text-cream group-hover:text-gold transition-colors">
                      {dealer.name}
                    </h3>
                    <Store className="h-5 w-5 text-gold/60 shrink-0 mt-0.5" />
                  </div>

                  <p className="mt-3 text-sm leading-relaxed text-cream/70">
                    {dealer.address}
                  </p>
                </div>

                <div className="mt-6 border-t border-cream/10 pt-4 space-y-2 text-xs text-cream/80">
                  {dealer.tel && (
                    <div className="flex items-center gap-2">
                      <Phone className="h-3.5 w-3.5 text-gold shrink-0" />
                      <span>{dealer.tel}</span>
                    </div>
                  )}
                  {dealer.email && (
                    <div className="flex items-center gap-2">
                      <Mail className="h-3.5 w-3.5 text-gold shrink-0" />
                      <a href={`mailto:${dealer.email}`} className="hover:text-gold transition underline-offset-2 hover:underline">
                        {dealer.email}
                      </a>
                    </div>
                  )}
                  {dealer.web && (
                    <div className="flex items-center gap-2 pt-1">
                      <GlobeIcon className="h-3.5 w-3.5 text-gold shrink-0" />
                      <a
                        href={dealer.web}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-gold hover:underline font-medium"
                      >
                        Visit Website <ChevronRight className="h-3 w-3" />
                      </a>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>
    </div>
  );
}