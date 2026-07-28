"use client";
import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { MapPin, Phone, Mail, Clock, ExternalLink, Loader2, AlertTriangle, ChevronDown, ChevronUp } from "lucide-react";
import { pickupLocationService } from "../services/pickupLocationService";
import { usePickupLocationStore } from "../store/usePickupLocationStore";
import type { PickupLocation } from "../types";

export function PickupLocationSelector() {
  const t = useTranslations("pickupLocation");
  const locale = useLocale();
  const [locations, setLocations] = useState<PickupLocation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [expandedId, setExpandedId] = useState<number | null>(null);
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

  const isClosed = (open: string) => open === "CLOSED";

  if (loading) {
    return (
      <div className="rounded-2xl border-2 border-border bg-white p-5 space-y-4">
        <div className="flex items-center gap-2">
          <div className="h-1 w-6 rounded-full bg-primary" />
          <h3 className="text-sm font-bold uppercase tracking-wider text-text-primary">{t("title")}</h3>
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse rounded-xl border border-border p-4 space-y-2">
              <div className="h-4 w-3/4 rounded bg-gray-200" />
              <div className="h-3 w-1/2 rounded bg-gray-200" />
            </div>
          ))}
        </div>
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
          <h3 className="text-sm font-bold uppercase tracking-wider text-text-primary">{t("title")}</h3>
        </div>
        <p className="text-sm text-text-secondary">{t("noLocations")}</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border-2 border-border bg-white p-5 space-y-4">
      <div className="flex items-center gap-2">
        <div className="h-1 w-6 rounded-full bg-primary" />
        <h3 className="text-sm font-bold uppercase tracking-wider text-text-primary">{t("title")}</h3>
      </div>

      <label className="flex items-center gap-3 rounded-xl border border-border p-4 cursor-pointer hover:border-primary/50 transition-colors">
        <input
          type="radio"
          name="shipping-mode"
          checked={selectedId === null}
          onChange={() => setSelectedId(null)}
          className="h-4 w-4 accent-primary"
        />
        <div>
          <span className="text-sm font-medium text-text-primary">{t("standardShipping")}</span>
        </div>
      </label>

      <div className="space-y-2">
        {locations.map((loc) => (
          <div key={loc.id}>
            <label
              className={`flex items-start gap-3 rounded-xl border p-4 cursor-pointer transition-colors ${
                selectedId === loc.id
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/50"
              }`}
            >
              <input
                type="radio"
                name="shipping-mode"
                checked={selectedId === loc.id}
                onChange={() => {
                  setSelectedId(loc.id);
                  setExpandedId(loc.id);
                }}
                className="mt-0.5 h-4 w-4 shrink-0 accent-primary"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-medium text-text-primary">{loc.store_name}</span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setExpandedId(expandedId === loc.id ? null : loc.id);
                    }}
                    className="shrink-0 text-text-secondary hover:text-text-primary transition-colors"
                  >
                    {expandedId === loc.id ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                  </button>
                </div>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <MapPin className="h-3 w-3 shrink-0 text-text-secondary" />
                  <p className="truncate text-xs text-text-secondary">{loc.address}</p>
                </div>
              </div>
            </label>

            {expandedId === loc.id && selectedId === loc.id && (
              <div className="mt-2 ml-7 rounded-xl border border-border bg-gray-50 p-4 space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <a
                    href={`tel:${loc.phone}`}
                    className="flex items-center gap-2 text-xs text-text-secondary hover:text-primary transition-colors"
                  >
                    <Phone className="h-3.5 w-3.5 shrink-0" />
                    {loc.phone}
                  </a>
                  <a
                    href={`mailto:${loc.email}`}
                    className="flex items-center gap-2 text-xs text-text-secondary hover:text-primary transition-colors"
                  >
                    <Mail className="h-3.5 w-3.5 shrink-0" />
                    {loc.email}
                  </a>
                </div>

                <div>
                  <div className="flex items-center gap-1.5 mb-2">
                    <Clock className="h-3.5 w-3.5 text-text-secondary" />
                    <span className="text-xs font-semibold text-text-primary">{t("workingHours")}</span>
                  </div>
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-border text-left">
                        <th className="pb-1 pr-2 font-medium text-text-secondary">{t("day")}</th>
                        <th className="pb-1 pr-2 font-medium text-text-secondary">{t("open")}</th>
                        <th className="pb-1 font-medium text-text-secondary">{t("close")}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {loc.working_hours.map((wh) => (
                        <tr key={wh.day} className="border-b border-border/50 last:border-0">
                          <td className="py-1 pr-2 text-text-primary">{wh.day}</td>
                          {isClosed(wh.open) ? (
                            <td className="py-1 pr-2 text-text-secondary" colSpan={2}>{t("closed")}</td>
                          ) : (
                            <>
                              <td className="py-1 pr-2 text-text-primary">{wh.open}</td>
                              <td className="py-1 text-text-primary">{wh.close}</td>
                            </>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="h-40 rounded-lg overflow-hidden bg-gray-200 relative">
                  <iframe
                    title={loc.store_name}
                    className="w-full h-full"
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    src={`https://maps.google.com/maps?q=${loc.latitude},${loc.longitude}&z=15&output=embed`}
                  />
                </div>

                <a
                  href={`https://www.google.com/maps/dir/?api=1&destination=${loc.latitude},${loc.longitude}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-medium text-primary hover:underline"
                >
                  <ExternalLink className="h-3 w-3" />
                  {t("getDirections")}
                </a>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
