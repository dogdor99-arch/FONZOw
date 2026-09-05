import { useMemo, useState } from "react";
import type { CustomizerConfig, CustomizerOption } from "@shared/fonzo/types";

type Props = {
  config: CustomizerConfig | null;
  fallbackImage?: string | null;
  basePrice?: number | null;
};

const money = (value: number) =>
  new Intl.NumberFormat("th-TH", { maximumFractionDigits: 0 }).format(value);

export function CustomConfigurator({ config, fallbackImage, basePrice }: Props) {
  const groups = config?.enabled ? config.groups : [];
  const initial = useMemo(() => {
    const result: Record<string, string> = {};
    groups.forEach((group) => {
      if (group.required !== false && group.options[0]) result[group.id] = group.options[0].id;
    });
    return result;
  }, [config]);
  const [selected, setSelected] = useState<Record<string, string>>(initial);

  const selectedOptions = useMemo(() => {
    return groups
      .map((group) => group.options.find((option) => option.id === selected[group.id]))
      .filter(Boolean) as CustomizerOption[];
  }, [groups, selected]);

  const total = (basePrice ?? config?.basePrice ?? 0) + selectedOptions.reduce((sum, option) => sum + option.priceDelta, 0);
  const layers = selectedOptions
    .filter((option) => option.imageUrl)
    .sort((a, b) => (a.zIndex ?? 0) - (b.zIndex ?? 0));

  if (!config || !config.enabled || groups.length === 0) {
    return (
      <div className="border border-border bg-card p-6">
        <p className="eyebrow">Custom configuration</p>
        <p className="mt-3 text-sm leading-7 text-muted-foreground">
          ติดต่อทีมงาน Fonzo เพื่อกำหนดวัสดุและรายละเอียดของรุ่นนี้
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="relative mx-auto aspect-[3/4] max-h-[620px] w-full max-w-[520px] overflow-hidden border border-border bg-card p-5">
        {config.previewImageUrl || fallbackImage ? (
          <img
            src={config.previewImageUrl || fallbackImage || ""}
            alt="Guitar preview"
            className="absolute inset-0 h-full w-full object-contain p-5"
          />
        ) : null}
        {layers.map((option) => (
          <img
            key={`${option.id}-${option.imageUrl}`}
            src={option.imageUrl || ""}
            alt={option.label}
            className="absolute inset-0 h-full w-full object-contain p-5"
            style={{ zIndex: option.zIndex ?? 1 }}
          />
        ))}
      </div>

      <div className="flex items-end justify-between gap-6 border-y border-border py-5">
        <div>
          <p className="eyebrow">Estimated price</p>
          <p className="mt-2 font-display text-3xl">฿{money(total)}</p>
        </div>
        <p className="max-w-[220px] text-right text-xs leading-5 text-muted-foreground">
          ราคาโดยประมาณ อาจเปลี่ยนแปลงหลังทีมงานยืนยันวัสดุและรายละเอียด
        </p>
      </div>

      <div className="space-y-7">
        {groups.map((group) => (
          <fieldset key={group.id}>
            <legend className="eyebrow">
              {group.label}
              {group.required === false ? " (เลือกได้)" : ""}
            </legend>
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              {group.options.map((option) => {
                const active = selected[group.id] === option.id;
                return (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => setSelected((current) => ({ ...current, [group.id]: option.id }))}
                    className={`flex items-center justify-between gap-3 border px-4 py-3 text-left text-sm transition-colors ${
                      active ? "border-brand bg-brand text-brand-foreground" : "border-border hover:border-brand/60"
                    }`}
                  >
                    <span>{option.label}</span>
                    <span className="shrink-0 text-xs tabular-nums opacity-80">
                      {option.priceDelta > 0 ? `+฿${money(option.priceDelta)}` : option.priceDelta < 0 ? `−฿${money(Math.abs(option.priceDelta))}` : "รวมแล้ว"}
                    </span>
                  </button>
                );
              })}
            </div>
          </fieldset>
        ))}
      </div>
    </div>
  );
}
