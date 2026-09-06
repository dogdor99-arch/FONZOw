import { describe, expect, it } from "vitest";
import { catalogOrder, stableCatalogSort, uniqueCatalogByCode } from "@shared/fonzo/catalogIntegrity";

describe("catalog integrity", () => {
  it("puts numbered source records before missing order values", () => {
    const items = [
      { code: "G9999", order: 0 },
      { code: "G0002", order: 2 },
      { code: "G0001", order: 1 },
    ];
    expect(stableCatalogSort(items).map(item => item.code)).toEqual(["G0001", "G0002", "G9999"]);
    expect(catalogOrder(undefined)).toBeGreaterThan(1000);
  });

  it("uses code as a deterministic tie-breaker", () => {
    const items = [
      { code: "A0002", order: 1 },
      { code: "A0001", order: 1 },
    ];
    expect(stableCatalogSort(items).map(item => item.code)).toEqual(["A0001", "A0002"]);
  });

  it("keeps the first record when the upstream API returns duplicate codes", () => {
    const items = uniqueCatalogByCode([
      { code: "G0001", name: "first" },
      { code: "G0001", name: "duplicate" },
      { code: "G0002", name: "second" },
    ]);
    expect(items).toEqual([
      { code: "G0001", name: "first" },
      { code: "G0002", name: "second" },
    ]);
  });
});
