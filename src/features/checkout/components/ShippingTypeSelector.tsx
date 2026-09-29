"use client";

import { Globe, MapPin } from "lucide-react";
import { useTranslations } from "next-intl";
import type { ShippingType } from "../types";

interface ShippingTypeSelectorProps {
  value: ShippingType;
  available: ShippingType[];
  onChange: (type: ShippingType) => void;
}

export function ShippingTypeSelector({ value, available, onChange }: ShippingTypeSelectorProps) {
  const t = useTranslations("checkout.shippingType");

  if (available.length === 0) return null;

  return (
    <div className="rounded-2xl border-2 border-border bg-white p-6 space-y-4">
      <div className="flex items-center gap-2">
        <div className="h-1 w-6 rounded-full bg-primary" />
        <h2 className="text-sm font-bold uppercase tracking-wider text-text-primary">
          {t("title")}
        </h2>
      </div>
      {available.length > 1 ? (
        <div className="flex gap-3">
          {available.map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => onChange(type)}
              aria-pressed={value === type}
              className={`flex-1 flex items-center justify-center gap-2 rounded-xl border-2 p-4 text-sm font-semibold transition-colors ${
                value === type
                  ? "border-primary bg-primary/5 text-primary"
                  : "border-border text-text-secondary hover:border-primary/50"
              }`}
            >
              {type === "local" ? (
                <MapPin className="size-5" />
              ) : (
                <Globe className="size-5" />
              )}
              {t(type)}
            </button>
          ))}
        </div>
      ) : (
        <p className="text-sm text-text-secondary">{t(available[0])}</p>
      )}
    </div>
  );
}
