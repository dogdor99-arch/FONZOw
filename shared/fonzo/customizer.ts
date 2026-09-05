import type { CustomFamily, CustomizerConfig, PurchaseMode } from "./types";

function asRecord(value: unknown): Record<string, any> {
  return value && typeof value === "object" && !Array.isArray(value) ? (value as Record<string, any>) : {};
}

export function productSpecs(value: unknown): Record<string, any> {
  return asRecord(asRecord(value).specs);
}

export function inferPurchaseMode(value: unknown): PurchaseMode {
  const record = asRecord(value);
  const specs = productSpecs(value);
  const explicit = record.purchaseMode ?? record.purchase_mode ?? specs.purchaseMode ?? specs.purchase_mode;
  if (explicit === "custom" || explicit === "shop") return explicit;

  const haystack = [record.typeName, record.type_name, record.seriesName, record.series, record.category]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
  return haystack.includes("custom") || haystack.includes("selection") || haystack.includes("สั่งทำ")
    ? "custom"
    : "shop";
}

export function inferCustomFamily(value: unknown): CustomFamily | null {
  if (inferPurchaseMode(value) !== "custom") return null;
  const record = asRecord(value);
  const specs = productSpecs(value);
  const explicit = record.customFamily ?? record.custom_family ?? specs.customFamily ?? specs.custom_family;
  if (explicit === "selection" || explicit === "custom") return explicit;

  const haystack = [record.typeName, record.type_name, record.seriesName, record.series, record.category, record.name]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
  return haystack.includes("selection") || haystack.includes("select") ? "selection" : "custom";
}

export function readCustomizer(value: unknown): CustomizerConfig | null {
  const record = asRecord(value);
  const specs = productSpecs(value);
  const raw = record.customizer ?? record.customizerConfig ?? record.customizer_config ?? specs.customizer ?? specs.customizerConfig;
  if (!raw || typeof raw !== "object") return null;

  const config = asRecord(raw);
  const groups = Array.isArray(config.groups)
    ? config.groups.map((group: any, groupIndex: number) => {
        const g = asRecord(group);
        const options = Array.isArray(g.options)
          ? g.options.map((option: any, optionIndex: number) => {
              const o = asRecord(option);
              return {
                id: String(o.id ?? `option-${groupIndex + 1}-${optionIndex + 1}`),
                label: String(o.label ?? o.value ?? "Option"),
                labelEn: o.labelEn ? String(o.labelEn) : undefined,
                value: o.value ? String(o.value) : undefined,
                imageUrl: o.imageUrl ? String(o.imageUrl) : null,
                priceDelta: Number.isFinite(Number(o.priceDelta)) ? Number(o.priceDelta) : 0,
                layer: o.layer ? String(o.layer) : undefined,
                zIndex: Number.isFinite(Number(o.zIndex)) ? Number(o.zIndex) : undefined,
              };
            })
          : [];
        return {
          id: String(g.id ?? `group-${groupIndex + 1}`),
          label: String(g.label ?? `Option group ${groupIndex + 1}`),
          labelEn: g.labelEn ? String(g.labelEn) : undefined,
          required: g.required !== false,
          options,
        };
      })
    : [];

  return {
    enabled: config.enabled !== false,
    basePrice: config.basePrice == null ? null : Number(config.basePrice),
    canvasWidth: Number(config.canvasWidth ?? 1200),
    canvasHeight: Number(config.canvasHeight ?? 1600),
    previewImageUrl: config.previewImageUrl ? String(config.previewImageUrl) : null,
    groups,
  };
}

export function withProductMeta(value: any) {
  const purchaseMode = inferPurchaseMode(value);
  const customFamily = inferCustomFamily(value);
  return {
    ...value,
    purchaseMode,
    customFamily,
    customizer: readCustomizer(value),
  };
}
