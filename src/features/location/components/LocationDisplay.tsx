"use client";

import { useEffect } from "react";
import { MapPin, ChevronDown, Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useLocationStore } from "../store/useLocationStore";
import { requestLocation } from "../services/geolocationService";
import { DeliveryLocationSidebar } from "./DeliveryLocationSidebar";

export function LocationDisplay() {
  const t = useTranslations("header.location");
  const city = useLocationStore((s) => s.city);
  const region = useLocationStore((s) => s.region);
  const coords = useLocationStore((s) => s.coords);
  const loading = useLocationStore((s) => s.loading);
  const permissionDenied = useLocationStore((s) => s.permissionDenied);
  const setLocation = useLocationStore((s) => s.setLocation);
  const setLoading = useLocationStore((s) => s.setLoading);
  const setPermissionDenied = useLocationStore((s) => s.setPermissionDenied);
  const deliveryCoords = useLocationStore((s) => s.deliveryCoords);
  const sidebarOpen = useLocationStore((s) => s.sidebarOpen);
  const setSidebarOpen = useLocationStore((s) => s.setSidebarOpen);

  useEffect(() => {
    if (coords) return;
    if (permissionDenied) return;

    if (!navigator.geolocation) return;

    setLoading(true);
    requestLocation()
      .then((result) => {
        setLocation(result.coords, result.city, result.region);
      })
      .catch(() => {
        setPermissionDenied(true);
      });
  }, [coords, permissionDenied, setLoading, setLocation, setPermissionDenied]);

  if (loading) {
    return (
      <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface border border-border-light">
        <Loader2 className="h-3.5 w-3.5 text-primary animate-spin" />
        <span className="text-xs text-text-secondary whitespace-nowrap">{t("loading")}</span>
      </div>
    );
  }

  if (!city) return null;

  const label = region ? `${city}, ${region}` : city;

  return (
    <>
      <button
        type="button"
        onClick={() => setSidebarOpen(true)}
        className="group inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface border border-border-light hover:border-primary/30 hover:bg-primary/5 transition-all duration-200 whitespace-nowrap"
      >
        <div className="flex items-center justify-center w-5 h-5 rounded-full bg-primary/10">
          <MapPin className={`h-3 w-3 ${deliveryCoords ? "text-primary fill-primary" : "text-primary"}`} />
        </div>
        <span className="text-xs font-medium text-text-primary group-hover:text-primary transition-colors">
          {label}
        </span>
        <ChevronDown className="h-3 w-3 text-text-secondary group-hover:text-primary transition-colors" />
      </button>
      <DeliveryLocationSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
    </>
  );
}
