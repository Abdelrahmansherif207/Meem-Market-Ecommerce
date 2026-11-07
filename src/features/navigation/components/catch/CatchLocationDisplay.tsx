"use client";

import { useEffect } from "react";
import { MapPin, ChevronDown } from "lucide-react";
import { useTranslations } from "next-intl";
import { useLocationStore } from "@/features/location/store/useLocationStore";
import { requestLocation } from "@/features/location/services/geolocationService";
import { DeliveryLocationSidebar } from "@/features/location/components/DeliveryLocationSidebar";

/**
 * Screen-style "Deliver to …" trigger (plain text + pin icon + chevron).
 * Reuses the location store, geolocation service and delivery sidebar
 * from the existing feature — presentation only is new.
 */
export default function CatchLocationDisplay() {
  const t = useTranslations("catchHeader");
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

  // Nothing detected yet (or denied): hide instead of showing an empty row.
  if (loading || !city) return null;

  const label = region ? `${city} - ${region}` : city;

  return (
    <>
      <button
        type="button"
        onClick={() => setSidebarOpen(true)}
        className="hidden cursor-pointer items-center gap-1 transition-colors hover:text-catch-primary md:flex"
      >
        <MapPin
          className={`h-4 w-4 ${deliveryCoords ? "fill-current" : ""} text-catch-muted`}
        />
        <span className="whitespace-nowrap">
          {t("deliverTo")} <strong className="font-semibold">{label}</strong>
        </span>
        <ChevronDown className="h-3 w-3 text-catch-muted-soft" />
      </button>
      <DeliveryLocationSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
    </>
  );
}
