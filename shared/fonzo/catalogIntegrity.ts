export type OrderedCatalogItem = { code: string; order: number };

const FALLBACK_ORDER = Number.MAX_SAFE_INTEGER;

export function catalogOrder(value: unknown): number {
  const order = Number(value);
  return Number.isFinite(order) && order > 0 ? order : FALLBACK_ORDER;
}

/** Keep the first upstream record for a code so a duplicate cannot reorder or duplicate cards. */
export function uniqueCatalogByCode<T extends { code: string }>(items: T[]): T[] {
  const seen = new Set<string>();
  return items.filter(item => {
    const code = String(item.code ?? "").trim();
    if (!code || seen.has(code)) return false;
    seen.add(code);
    return true;
  });
}

/** Sort by the source's explicit display order, then code for deterministic ties. */
export function stableCatalogSort<T extends OrderedCatalogItem>(items: T[]): T[] {
  return [...items].sort((a, b) => catalogOrder(a.order) - catalogOrder(b.order) || a.code.localeCompare(b.code));
}

export function assertCatalogIntegrity<T extends OrderedCatalogItem>(items: T[], label: string): void {
  const seen = new Set<string>();
  for (const item of items) {
    if (!item.code) throw new Error(`${label}: catalog item is missing a code`);
    if (seen.has(item.code)) throw new Error(`${label}: duplicate catalog code ${item.code}`);
    seen.add(item.code);
  }
}
