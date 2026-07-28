"use client";
import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { MapPin, Loader2 } from "lucide-react";
import { pickupLocationService } from "@/features/pickup-location/services/pickupLocationService";
import { usePickupLocationStore } from "@/features/pickup-location/store/usePickupLocationStore";
import type { PickupLocation } from "@/features/pickup-location/types";

interface PickupSelectorProps {
  onSelect?: (name: string) => void;
}

export function PickupSelector({ onSelect }: PickupSelectorProps) {
  const t = useTranslations("checkout");
  const locale = useLocale();
  const [locations, setLocations] = useState<PickupLocation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const selectedId = usePickupLocationStore((s) => s.selectedLocationId);
  const setSelectedId = usePickupLocationStore((s) => s.setSelectedLocationId);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(false);

    pickupLocationService.getAll(locale)
      .then((data) => {
        if (cancelled) return;
        setLocations(data);
        setLoading(false);
      })
      .catch(() => {
        if (cancelled) return;
        setError(true);
        setLoading(false);
      });

    return () => { cancelled = true; };
  }, [locale]);

  const selectedLocation = locations.find((l) => l.id === selectedId);

  if (loading) {
    return (
      <div className="rounded-2xl border-2 border-border bg-white p-5 space-y-3">
        <div className="flex items-center gap-2">
          <div className="h-1 w-6 rounded-full bg-primary" />
          <h3 className="text-sm font-bold uppercase tracking-wider text-text-primary">
            {t("selectPickupLocation")}
          </h3>
        </div>
        {[1, 2].map((i) => (
          <div key={i} className="animate-pulse rounded-xl border border-border p-4 space-y-2">
            <div className="h-4 w-3/4 rounded bg-gray-200" />
            <div className="h-3 w-1/2 rounded bg-gray-200" />
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return null;
  }

  if (locations.length === 0) {
    return (
      <div className="rounded-2xl border-2 border-border bg-white p-5">
        <div className="flex items-center gap-2 mb-3">
          <div className="h-1 w-6 rounded-full bg-primary" />
          <h3 className="text-sm font-bold uppercase tracking-wider text-text-primary">
            {t("selectPickupLocation")}
          </h3>
        </div>
        <p className="text-sm text-text-secondary">{t("noPickupLocations")}</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border-2 border-border bg-white p-5 space-y-3">
      <div className="flex items-center gap-2">
        <div className="h-1 w-6 rounded-full bg-primary" />
        <h3 className="text-sm font-bold uppercase tracking-wider text-text-primary">
          {t("selectPickupLocation")}
        </h3>
      </div>

      <div className="space-y-2">
        {locations.map((loc) => (
          <label
            key={loc.id}
            className={`flex items-start gap-3 rounded-xl border p-4 cursor-pointer transition-colors ${
              selectedId === loc.id
                ? "border-primary bg-primary/5"
                : "border-border hover:border-primary/50"
            }`}
          >
            <input
              type="radio"
              name="pickup-location"
              checked={selectedId === loc.id}
              onChange={() => {
                setSelectedId(loc.id);
                onSelect?.(loc.store_name);
              }}
              className="mt-0.5 h-4 w-4 shrink-0 accent-primary"
            />
            <div className="flex items-start gap-3 flex-1 min-w-0">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-text-secondary" />
              <div>
                <span className="text-sm font-medium text-text-primary">{loc.store_name}</span>
                <p className="mt-0.5 text-xs text-text-secondary">{loc.address}</p>
              </div>
            </div>
          </label>
        ))}
      </div>
    </div>
  );
}
