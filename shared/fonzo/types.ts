export type Locale = "th" | "en";

export type PurchaseMode = "shop" | "custom";
export type CustomFamily = "custom" | "selection";

export type CustomizerOption = {
  id: string;
  label: string;
  labelEn?: string;
  value?: string;
  imageUrl?: string | null;
  priceDelta: number;
  layer?: string;
  zIndex?: number;
};

export type CustomizerGroup = {
  id: string;
  label: string;
  labelEn?: string;
  required?: boolean;
  options: CustomizerOption[];
};

export type CustomizerConfig = {
  enabled: boolean;
  basePrice?: number | null;
  canvasWidth?: number;
  canvasHeight?: number;
  previewImageUrl?: string | null;
  groups: CustomizerGroup[];
};

export type PurchaseLinks = {
  shopee?: string | null;
  lazada?: string | null;
  contact?: string | null;
};

export type FonzoSpec = { title: string; value: string };

export type FonzoProductSummary = {
  code: string;
  order: number;
  name: string;
  nameEn: string;
  price: number | null;
  priceLabel: string;
  typeCode: string;
  typeName: string;
  seriesCode: string;
  seriesName: string;
  popular: boolean;
  videoUrl: string | null;
  image: string | null;
  purchaseMode?: PurchaseMode;
  customFamily?: CustomFamily | null;
  shopeeUrl?: string | null;
  lazadaUrl?: string | null;
  contactUrl?: string | null;
  customizer?: CustomizerConfig | null;
  raw?: Record<string, unknown>;
};

export type FonzoProductDetail = FonzoProductSummary & {
  images: { url: string; isDefault: boolean }[];
  specs: FonzoSpec[];
  specsEn: FonzoSpec[];
};

export type FonzoCategory = {
  code: string;
  name: string;
  image?: string | null;
  count: number;
};

export type FonzoArticle = {
  code: string;
  locale: Locale;
  image?: string | null;
  html: string;
};

export type FonzoCatalogItem = {
  code: string;
  title: string;
  fileUrl?: string | null;
};

export type FonzoGalleryItem = {
  code: string;
  type: "Image" | "Video";
  url: string;
  poster?: string | null;
};

export type FonzoAlbum = {
  code: string;
  name: string;
  cover?: string | null;
  itemCount: number;
};

export type FonzoDealerSection = {
  code: string;
  title: string;
  locale: Locale;
  html: string;
};

export type FonzoPriceBand = {
  code: string;
  start: number;
  end: number;
};
