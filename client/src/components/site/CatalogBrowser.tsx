import { useEffect, useMemo, useState } from "react";
import { useSearch } from "wouter";
import { Search, SlidersHorizontal, X } from "lucide-react";
import type { FonzoCategory, FonzoProductSummary } from "@shared/fonzo/types";
import { useLocale } from "@/contexts/LocaleContext";
import { ProductCard, ProductCardSkeleton } from "./ProductCard";
import { Reveal } from "./Reveal";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type SortKey = "curated" | "price-asc" | "price-desc" | "name";

const PRICE_BANDS = [
  { key: "all", labelTh: "ทุกช่วงราคา", labelEn: "All prices", min: 0, max: Infinity },
  { key: "u20", labelTh: "ต่ำกว่า ฿20,000", labelEn: "Under ฿20,000", min: 0, max: 20000 },
  { key: "20-50", labelTh: "฿20,000 – ฿50,000", labelEn: "฿20,000 – ฿50,000", min: 20000, max: 50000 },
  { key: "50-100", labelTh: "฿50,000 – ฿100,000", labelEn: "฿50,000 – ฿100,000", min: 50000, max: 100000 },
  { key: "100+", labelTh: "มากกว่า ฿100,000", labelEn: "฿100,000 and above", min: 100000, max: Infinity },
  { key: "enquiry", labelTh: "สอบถามราคา", labelEn: "Price on enquiry", min: -1, max: -1 },
] as const;

export function CatalogBrowser({
  products,
  categories,
  isLoading,
  basePath,
  categoryLabel,
}: {
  products: FonzoProductSummary[];
  categories: FonzoCategory[];
  isLoading: boolean;
  basePath: string;
  categoryLabel: string;
}) {
  const { locale, t } = useLocale();
  const search = useSearch();

  const [typeCode, setTypeCode] = useState<string>("all");
  const [seriesName, setSeriesName] = useState<string>("all");
  const [band, setBand] = useState<string>("all");
  const [sort, setSort] = useState<SortKey>("curated");
  const [query, setQuery] = useState("");
  const [filtersOpen, setFiltersOpen] = useState(false);

  // Deep-link support: /guitar?type=GT0005
  useEffect(() => {
    const params = new URLSearchParams(search);
    const type = params.get("type");
    if (type) setTypeCode(type);
  }, [search]);

  const seriesOptions = useMemo(() => {
    const set = new Set<string>();
    products.forEach(p => p.seriesName && set.add(p.seriesName));
    return Array.from(set).sort();
  }, [products]);

  const filtered = useMemo(() => {
    const activeBand = PRICE_BANDS.find(b => b.key === band) ?? PRICE_BANDS[0];
    const q = query.trim().toLowerCase();

    const result = products.filter(product => {
      if (typeCode !== "all" && product.typeCode !== typeCode) return false;
      if (seriesName !== "all" && product.seriesName !== seriesName) return false;

      if (activeBand.key === "enquiry") {
        if (product.price !== null) return false;
      } else if (activeBand.key !== "all") {
        if (product.price === null) return false;
        if (product.price < activeBand.min || product.price >= activeBand.max) return false;
      }

      if (q) {
        const haystack = `${product.name} ${product.nameEn} ${product.seriesName} ${product.typeName} ${product.code}`.toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });

    const sorted = [...result];
    if (sort === "price-asc") sorted.sort((a, b) => (a.price ?? Infinity) - (b.price ?? Infinity));
    if (sort === "price-desc") sorted.sort((a, b) => (b.price ?? -1) - (a.price ?? -1));
    if (sort === "name")
      sorted.sort((a, b) =>
        (locale === "th" ? a.name : a.nameEn).localeCompare(locale === "th" ? b.name : b.nameEn),
      );
    return sorted;
  }, [products, typeCode, seriesName, band, query, sort, locale]);

  const activeFilterCount =
    (typeCode !== "all" ? 1 : 0) + (seriesName !== "all" ? 1 : 0) + (band !== "all" ? 1 : 0);

  const resetFilters = () => {
    setTypeCode("all");
    setSeriesName("all");
    setBand("all");
    setQuery("");
    setSort("curated");
  };

  const FilterPanel = (
    <div className="space-y-9">
      <div>
        <p className="eyebrow">{categoryLabel}</p>
        <div className="mt-3 h-px w-10 bg-brand/40" />
        <ul className="mt-4 space-y-1.5">
          <li>
            <button
              type="button"
              onClick={() => setTypeCode("all")}
              className={cn(
                "press flex w-full items-baseline justify-between gap-3 border-l-2 py-1 pl-3 text-left text-sm transition-colors",
                typeCode === "all"
                  ? "border-brand text-brand"
                  : "border-transparent text-muted-foreground hover:border-border hover:text-foreground",
              )}>
              <span>{t("ทั้งหมด", "All")}</span>
              <span className="text-[11px] tabular-nums opacity-60">{products.length}</span>
            </button>
          </li>
          {categories.map(category => (
            <li key={category.code}>
              <button
                type="button"
                onClick={() => setTypeCode(category.code)}
                className={cn(
                  "press flex w-full items-baseline justify-between gap-3 border-l-2 py-1 pl-3 text-left text-sm transition-colors",
                  typeCode === category.code
                    ? "border-brand text-brand"
                    : "border-transparent text-muted-foreground hover:border-border hover:text-foreground",
                )}>
                <span>{category.name}</span>
                <span className="text-[11px] tabular-nums opacity-60">{category.count}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>

      {seriesOptions.length > 1 && (
        <div>
          <p className="eyebrow">{t("ซีรีส์", "Series")}</p>
          <div className="mt-3 h-px w-10 bg-brand/40" />
          <ul className="mt-4 space-y-1.5">
            <li>
              <button
                type="button"
                onClick={() => setSeriesName("all")}
                className={cn(
                  "press w-full border-l-2 py-1 pl-3 text-left text-sm transition-colors",
                  seriesName === "all"
                    ? "border-brand text-brand"
                    : "border-transparent text-muted-foreground hover:border-border hover:text-foreground",
                )}>
                {t("ทั้งหมด", "All")}
              </button>
            </li>
            {seriesOptions.map(name => (
              <li key={name}>
                <button
                  type="button"
                  onClick={() => setSeriesName(name)}
                  className={cn(
                    "press w-full border-l-2 py-1 pl-3 text-left text-sm transition-colors",
                    seriesName === name
                      ? "border-brand text-brand"
                      : "border-transparent text-muted-foreground hover:border-border hover:text-foreground",
                  )}>
                  {name}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div>
        <p className="eyebrow">{t("ช่วงราคา", "Price")}</p>
        <div className="mt-3 h-px w-10 bg-brand/40" />
        <ul className="mt-4 space-y-1.5">
          {PRICE_BANDS.map(option => (
            <li key={option.key}>
              <button
                type="button"
                onClick={() => setBand(option.key)}
                className={cn(
                  "press w-full border-l-2 py-1 pl-3 text-left text-sm transition-colors",
                  band === option.key
                    ? "border-brand text-brand"
                    : "border-transparent text-muted-foreground hover:border-border hover:text-foreground",
                )}>
                {locale === "th" ? option.labelTh : option.labelEn}
              </button>
            </li>
          ))}
        </ul>
      </div>

      {activeFilterCount > 0 && (
        <button
          type="button"
          onClick={resetFilters}
          className="press inline-flex items-center gap-2 border border-border px-4 py-2 text-xs text-muted-foreground hover:border-brand/50 hover:text-brand">
          <X className="h-3 w-3" />
          {t("ล้างตัวกรอง", "Clear filters")}
        </button>
      )}
    </div>
  );

  return (
    <section className="mx-auto max-w-[1400px] px-4 py-12 sm:px-6 lg:px-10 lg:py-16">
      <div className="grid gap-10 lg:grid-cols-[230px_1fr] lg:gap-16">
        <aside className="hidden lg:block">
          <div className="sticky top-28 border-r border-border/60 pr-8">{FilterPanel}</div>
        </aside>

        <div>
          <div className="flex flex-wrap items-center gap-3 border-b border-border/70 pb-5">
            <div className="relative min-w-[200px] flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder={t("ค้นหารุ่น ซีรีส์ หรือรหัสสินค้า", "Search model, series or code")}
                className="h-11 rounded-none border-border bg-card pl-9"
              />
            </div>

            <select
              value={sort}
              onChange={e => setSort(e.target.value as SortKey)}
              className="h-11 rounded-none border border-border bg-card px-3 text-sm text-foreground">
              <option value="curated">{t("เรียงตามที่คัดสรร", "Curated order")}</option>
              <option value="price-asc">{t("ราคาน้อย → มาก", "Price: low to high")}</option>
              <option value="price-desc">{t("ราคามาก → น้อย", "Price: high to low")}</option>
              <option value="name">{t("ชื่อ A → Z", "Name A → Z")}</option>
            </select>

            <button
              type="button"
              onClick={() => setFiltersOpen(v => !v)}
              className="press inline-flex h-11 items-center gap-2 border border-border px-4 text-xs tracking-[0.14em] uppercase lg:hidden">
              <SlidersHorizontal className="h-3.5 w-3.5" />
              {t("ตัวกรอง", "Filters")}
              {activeFilterCount > 0 && (
                <span className="ml-1 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-brand px-1 text-[10px] text-brand-foreground">
                  {activeFilterCount}
                </span>
              )}
            </button>
          </div>

          {filtersOpen && (
            <div className="mt-6 border border-border bg-card p-6 lg:hidden">{FilterPanel}</div>
          )}

          <p className="mt-6 text-xs tracking-[0.14em] text-muted-foreground uppercase">
            {isLoading
              ? t("กำลังโหลด…", "Loading…")
              : `${filtered.length} ${t("รายการ", filtered.length === 1 ? "item" : "items")}`}
          </p>

          <div className="mt-6 grid gap-x-5 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {isLoading
              ? Array.from({ length: 8 }).map((_, i) => <ProductCardSkeleton key={i} />)
              : filtered.map((product, index) => (
                  <Reveal key={product.code} delay={Math.min(index, 8) * 40}>
                    <ProductCard product={product} basePath={basePath} />
                  </Reveal>
                ))}
          </div>

          {!isLoading && filtered.length === 0 && (
            <div className="mt-16 border border-border bg-card p-12 text-center">
              <p className="font-display text-xl">{t("ไม่พบสินค้าที่ตรงกับเงื่อนไข", "No matching items")}</p>
              <p className="mt-2 text-sm text-muted-foreground">
                {t("ลองปรับตัวกรองหรือคำค้นหาใหม่", "Try adjusting your filters or search terms.")}
              </p>
              <button
                type="button"
                onClick={resetFilters}
                className="press mt-6 border border-brand/50 px-5 py-2.5 text-xs tracking-[0.16em] text-brand uppercase">
                {t("ล้างตัวกรอง", "Clear filters")}
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
