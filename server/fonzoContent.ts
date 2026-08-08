import {
  fonzoPost,
  mediaProxyUrl,
  splitBilingual,
  unwrapRows,
} from "./_core/fonzoApi";
import type {
  FonzoAlbum,
  FonzoArticle,
  FonzoCatalogItem,
  FonzoCategory,
  FonzoDealerSection,
  FonzoGalleryItem,
  FonzoPriceBand,
  FonzoProductDetail,
  FonzoProductSummary,
  FonzoSpec,
  Locale,
} from "@shared/fonzo/types";

const LIST_PAYLOAD = { limit: 1000, offset: 0 };

function toNumberOrNull(value: unknown): number | null {
  if (value === null || value === undefined) return null;
  const cleaned = String(value).replace(/[^0-9.]/g, "");
  if (!cleaned) return null;
  const n = Number(cleaned);
  return Number.isFinite(n) && n > 0 ? n : null;
}

function priceLabel(raw: unknown): string {
  const n = toNumberOrNull(raw);
  if (n === null) return "Enquiry";
  return n.toLocaleString("en-US");
}

/* ------------------------------ Guitars ------------------------------ */

type RawGuitar = {
  guitar_code: string;
  guitar_no?: number;
  guitar_price?: string | number;
  guitar_vdo?: string;
  guitar_popular?: string;
  guitar_type_code?: string;
  series_code?: string;
  guitar_type_name?: string;
  series_name?: string;
  guitar_detail_text?: string;
  guitar_img_url?: string;
};

function mapGuitar(row: RawGuitar): FonzoProductSummary {
  const names = splitBilingual(row.guitar_detail_text);
  return {
    code: row.guitar_code,
    order: Number(row.guitar_no ?? 0),
    name: names.th,
    nameEn: names.en,
    price: toNumberOrNull(row.guitar_price),
    priceLabel: priceLabel(row.guitar_price),
    typeCode: row.guitar_type_code ?? "",
    typeName: row.guitar_type_name ?? "",
    seriesCode: row.series_code ?? "",
    seriesName: row.series_name ?? "",
    popular: String(row.guitar_popular ?? "").toLowerCase() === "yes",
    videoUrl: row.guitar_vdo ? row.guitar_vdo : null,
    image: mediaProxyUrl(row.guitar_img_url),
  };
}

export async function listGuitars(): Promise<FonzoProductSummary[]> {
  const payload = await fonzoPost("guitar/getGuitarBy", LIST_PAYLOAD);
  return unwrapRows<RawGuitar>(payload)
    .map(mapGuitar)
    .sort((a, b) => a.order - b.order);
}

type RawSpec = {
  guitar_detail_title?: string;
  guitar_detail_text?: string;
  guitar_detail_language?: string;
  accessories_detail_title?: string;
  accessories_detail_text?: string;
  accessories_detail_language?: string;
};

function mapSpecs(rows: RawSpec[], kind: "guitar" | "accessories") {
  const th: FonzoSpec[] = [];
  const en: FonzoSpec[] = [];
  // The legacy dataset occasionally stores the same title/value twice for one
  // product (e.g. a duplicated "Bridge" row); de-duplicate per language so the
  // spec table shows each attribute once.
  const seen = { th: new Set<string>(), en: new Set<string>() };
  for (const row of rows) {
    const title = (kind === "guitar" ? row.guitar_detail_title : row.accessories_detail_title) ?? "";
    const value = (kind === "guitar" ? row.guitar_detail_text : row.accessories_detail_text) ?? "";
    const lang = (kind === "guitar" ? row.guitar_detail_language : row.accessories_detail_language) ?? "TH";
    if (!title && !value) continue;
    const spec = { title, value };
    const fingerprint = `${title.trim().toLowerCase()}|${value.trim().toLowerCase()}`;
    if (String(lang).toUpperCase().startsWith("EN")) {
      if (seen.en.has(fingerprint)) continue;
      seen.en.add(fingerprint);
      en.push(spec);
    } else {
      if (seen.th.has(fingerprint)) continue;
      seen.th.add(fingerprint);
      th.push(spec);
    }
  }
  return { th, en: en.length ? en : th };
}

export async function getGuitarByCode(code: string): Promise<FonzoProductDetail | null> {
  const all = await listGuitars();
  const summary = all.find(item => item.code === code);
  if (!summary) return null;

  const [specPayload, imgPayload] = await Promise.all([
    fonzoPost("guitarDetail/getGuitarDetailBy", { guitar_code: code, limit: 300 }),
    fonzoPost("guitar-img/getGuitarImgBy", { guitar_code: code, limit: 300 }),
  ]);

  const specs = mapSpecs(unwrapRows<RawSpec>(specPayload), "guitar");

  const images = unwrapRows<{ guitar_img_url?: string; guitar_img_default?: string | null }>(imgPayload)
    .map(row => ({
      url: mediaProxyUrl(row.guitar_img_url) ?? "",
      isDefault: String(row.guitar_img_default ?? "").toLowerCase() === "yes",
    }))
    .filter(image => image.url.length > 0)
    .sort((a, b) => Number(b.isDefault) - Number(a.isDefault));

  return { ...summary, images, specs: specs.th, specsEn: specs.en };
}

export async function listGuitarTypes(): Promise<FonzoCategory[]> {
  const [typePayload, guitars] = await Promise.all([
    fonzoPost("guitarType/getGuitarTypeBy", LIST_PAYLOAD),
    listGuitars(),
  ]);
  return unwrapRows<{ guitar_type_code: string; guitar_type_name: string; guitar_type_img?: string }>(
    typePayload,
  ).map(row => ({
    code: row.guitar_type_code,
    name: row.guitar_type_name,
    image: mediaProxyUrl(row.guitar_type_img),
    count: guitars.filter(g => g.typeCode === row.guitar_type_code).length,
  }));
}

/* --------------------------- Accessories --------------------------- */

type RawAccessory = {
  accessories_code: string;
  accessories_no?: number;
  accessories_price?: string | number;
  accessories_vdo?: string;
  accessories_popular?: string;
  accessories_type_code?: string;
  series_code?: string;
  accessories_type_name?: string;
  series_name?: string;
  accessories_detail_text?: string;
  accessories_img_url?: string;
};

function mapAccessory(row: RawAccessory, index: number): FonzoProductSummary {
  const names = splitBilingual(row.accessories_detail_text);
  return {
    code: row.accessories_code,
    order: Number(row.accessories_no ?? index),
    name: names.th,
    nameEn: names.en,
    price: toNumberOrNull(row.accessories_price),
    priceLabel: priceLabel(row.accessories_price),
    typeCode: row.accessories_type_code ?? "",
    typeName: row.accessories_type_name ?? "",
    seriesCode: row.series_code ?? "",
    seriesName: row.series_name ?? "",
    popular: String(row.accessories_popular ?? "").toLowerCase() === "yes",
    videoUrl: row.accessories_vdo ? row.accessories_vdo : null,
    image: mediaProxyUrl(row.accessories_img_url),
  };
}

export async function listAccessories(): Promise<FonzoProductSummary[]> {
  const payload = await fonzoPost("accessories/getAccessoriesBy", LIST_PAYLOAD);
  return unwrapRows<RawAccessory>(payload)
    .map(mapAccessory)
    .sort((a, b) => a.order - b.order);
}

export async function getAccessoryByCode(code: string): Promise<FonzoProductDetail | null> {
  const all = await listAccessories();
  const summary = all.find(item => item.code === code);
  if (!summary) return null;

  const [specPayload, imgPayload] = await Promise.all([
    fonzoPost("accessoriesDetail/getAccessoriesDetailBy", { accessories_code: code, limit: 300 }),
    fonzoPost("accessories-img/getAccessoriesImgBy", { accessories_code: code, limit: 300 }),
  ]);

  const specs = mapSpecs(unwrapRows<RawSpec>(specPayload), "accessories");

  const images = unwrapRows<{ accessories_img_url?: string; accessories_img_default?: string | null }>(
    imgPayload,
  )
    .map(row => ({
      url: mediaProxyUrl(row.accessories_img_url) ?? "",
      isDefault: String(row.accessories_img_default ?? "").toLowerCase() === "yes",
    }))
    .filter(image => image.url.length > 0)
    .sort((a, b) => Number(b.isDefault) - Number(a.isDefault));

  return { ...summary, images, specs: specs.th, specsEn: specs.en };
}

export async function listAccessoryTypes(): Promise<FonzoCategory[]> {
  const [typePayload, accessories] = await Promise.all([
    fonzoPost("accessoriesType/getAccessoriesTypeBy", LIST_PAYLOAD),
    listAccessories(),
  ]);
  return unwrapRows<{
    accessories_type_code: string;
    accessories_type_name: string;
    accessories_type_img?: string;
  }>(typePayload).map(row => ({
    code: row.accessories_type_code,
    name: row.accessories_type_name,
    image: mediaProxyUrl(row.accessories_type_img),
    count: accessories.filter(a => a.typeCode === row.accessories_type_code).length,
  }));
}

/* --------------------------- Editorial --------------------------- */

function normalizeLocale(value: unknown): Locale {
  return String(value ?? "TH").toUpperCase().startsWith("EN") ? "en" : "th";
}

export async function getFounderArticles(): Promise<FonzoArticle[]> {
  const payload = await fonzoPost("aboutUs/getAboutUsBy", LIST_PAYLOAD);
  return unwrapRows<{
    about_us_code: string;
    about_us_img?: string;
    about_us_description?: string;
    about_us_language?: string;
  }>(payload).map(row => ({
    code: row.about_us_code,
    locale: normalizeLocale(row.about_us_language),
    image: mediaProxyUrl(row.about_us_img),
    html: row.about_us_description ?? "",
  }));
}

export async function getBrandStoryArticles(): Promise<FonzoArticle[]> {
  const payload = await fonzoPost("brandStory/getBrandStoryBy", LIST_PAYLOAD);
  return unwrapRows<{
    brand_story_code: string;
    brand_story_img?: string;
    brand_story_description?: string;
    brand_story_language?: string;
  }>(payload).map(row => ({
    code: row.brand_story_code,
    locale: normalizeLocale(row.brand_story_language),
    image: mediaProxyUrl(row.brand_story_img),
    html: row.brand_story_description ?? "",
  }));
}

export async function listCatalogs(): Promise<FonzoCatalogItem[]> {
  const payload = await fonzoPost("catalog/getCatalogBy", LIST_PAYLOAD);
  return unwrapRows<{ catalog_code: string; catalog_title?: string; catalog_file?: string }>(payload).map(
    row => ({
      code: row.catalog_code,
      title: row.catalog_title ?? "Fonzo Catalog",
      fileUrl: mediaProxyUrl(row.catalog_file),
    }),
  );
}

export async function listAlbums(): Promise<FonzoAlbum[]> {
  const payload = await fonzoPost("album/getAlbumBy", LIST_PAYLOAD);
  const albums = unwrapRows<{ album_code: string; album_name?: string; images_url?: string }>(payload);

  const withCounts = await Promise.all(
    albums.map(async row => {
      const items = await listAlbumItems(row.album_code);
      return {
        code: row.album_code,
        name: row.album_name ?? "",
        cover: mediaProxyUrl(row.images_url),
        itemCount: items.length,
      };
    }),
  );
  return withCounts;
}

export async function listAlbumItems(albumCode: string): Promise<FonzoGalleryItem[]> {
  const payload = await fonzoPost("images/getImagesBy", { album_code: albumCode, limit: 1000 });
  return unwrapRows<{
    images_code: string;
    images_url?: string;
    images_profile_video?: string | null;
    images_type?: string;
  }>(payload)
    .map(row => ({
      code: row.images_code,
      type: (row.images_type === "Video" ? "Video" : "Image") as "Image" | "Video",
      url: mediaProxyUrl(row.images_url) ?? "",
      poster: mediaProxyUrl(row.images_profile_video),
    }))
    .filter(item => item.url.length > 0);
}

export async function listPriceBands(): Promise<FonzoPriceBand[]> {
  const payload = await fonzoPost("filter-price/getFilterPriceBy", LIST_PAYLOAD);
  return unwrapRows<{ filter_price_code: string; filter_price_start: number; filter_price_end: number }>(
    payload,
  )
    .map(row => ({
      code: row.filter_price_code,
      start: Number(row.filter_price_start),
      end: Number(row.filter_price_end),
    }))
    .sort((a, b) => a.start - b.start);
}

/** Dealer network is stored as promotion detail articles in the legacy CMS. */
export async function listDealerSections(): Promise<FonzoDealerSection[]> {
  const promotions = unwrapRows<{ promotion_code: string }>(
    await fonzoPost("promotion/getPromotionBy", LIST_PAYLOAD),
  );

  const sections: FonzoDealerSection[] = [];
  for (const promotion of promotions) {
    const payload = await fonzoPost("promotionDetail/getPromotionDetailByCode", {
      promotion_code: promotion.promotion_code,
    });
    for (const row of unwrapRows<{
      promotion_detail_code: string;
      promotion_detail_name?: string;
      promotion_detail_description?: string;
      promotion_detail_language?: string;
    }>(payload)) {
      sections.push({
        code: row.promotion_detail_code,
        title: row.promotion_detail_name ?? "",
        locale: normalizeLocale(row.promotion_detail_language),
        html: row.promotion_detail_description ?? "",
      });
    }
  }
  return sections;
}
