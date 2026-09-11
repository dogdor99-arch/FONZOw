import { useEffect, useMemo, useState } from "react";
import { trpc } from "@/lib/trpc";
import { useLocale } from "@/contexts/LocaleContext";
import { CompactPageHeading } from "@/components/site/SiteLayout";
import { CatalogBrowser } from "@/components/site/CatalogBrowser";
import { supabase } from "@/lib/supabase";

function isSpecificMarketplaceUrl(value: unknown, marketplace: "shopee" | "lazada") {
  const url = String(value ?? "").trim().toLowerCase();
  if (!url || !/^https?:\/\//.test(url)) return false;
  if (marketplace === "shopee") return /^https?:\/\/shopee\.co\.th\/[^/?#]+(?:-[^/?#]+)?-i\.\d+\.\d+(?:[/?#].*)?$/.test(url);
  return /^https?:\/\/(?:www\.)?lazada\.co\.th\/products\/[^/?#]+-i\d+(?:-s\d+)?\.html(?:[?#].*)?$/.test(url);
}

export default function AccessoriesList() {
  const { t } = useLocale();
  const { data: accessories = [], isLoading } = trpc.fonzo.accessories.list.useQuery();
  const { data: types = [] } = trpc.fonzo.accessories.types.useQuery();
  const [adminProducts, setAdminProducts] = useState<any[]>([]);

  useEffect(() => {
    let active = true;
    supabase.from("products").select("*").then(({ data }) => {
      if (active) setAdminProducts(data ?? []);
    });
    return () => { active = false; };
  }, []);

  const visibleAccessories = useMemo(() => {
    const adminByName = new Map(adminProducts.map(item => [String(item.name ?? "").trim().toLowerCase(), item]));
    return accessories
      .map((item: any) => {
        const admin = adminByName.get(String(item.name ?? "").trim().toLowerCase())
          ?? adminProducts.find(candidate => candidate.specs?.sourceCode === item.code);
        if (!admin) return item;
        const images = Array.isArray(admin.image_urls) && admin.image_urls.length ? admin.image_urls : item.images;
        return {
          ...item,
          name: admin.name || item.name,
          nameEn: admin.name_en || item.nameEn,
          price: admin.price == null || admin.price === "" ? item.price : Number(admin.price),
          description: admin.description || item.description,
          image: images?.[0]?.url || images?.[0] || admin.image_url || item.image,
          images: (images ?? []).map((image: any) => typeof image === "string" ? { url: image, isDefault: false } : image),
          shopeeUrl: admin.shopee_url || admin.shopeeUrl || admin.shopee || item.shopeeUrl || null,
          lazadaUrl: admin.lazada_url || admin.lazadaUrl || admin.lazada || item.lazadaUrl || null,
          videoUrl: admin.video_url || admin.videoUrl || admin.video || admin.specs?.videoUrl || admin.specs?.video_url || item.videoUrl || null,
          specs: admin.specs || item.specs,
          _hidden: Boolean(admin.specs?.hidden),
        };
      })
      .filter((item: any) => !item._hidden)
      .sort((a: any, b: any) => {
        const score = (item: any) => Number(isSpecificMarketplaceUrl(item.shopeeUrl, "shopee") && isSpecificMarketplaceUrl(item.lazadaUrl, "lazada") && Boolean(item.videoUrl));
        return score(b) - score(a)
          || Number(Boolean(b.videoUrl)) - Number(Boolean(a.videoUrl))
          || (a.order ?? 0) - (b.order ?? 0);
      });
  }, [accessories, adminProducts]);

  return (
    <>
      <CompactPageHeading title="Accessories" crumbs={[{ label: "Accessories" }]} storeNav />
      <CatalogBrowser products={visibleAccessories} categories={types} isLoading={isLoading} basePath="/accessories" categoryLabel={t("หมวดอุปกรณ์", "Category")} />
    </>
  );
}
