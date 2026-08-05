"use client";

import { useEffect, useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { X, MapPin } from "lucide-react";
import { cn } from "@/shared/utils/cn";
import { useLocationStore } from "../store/useLocationStore";
import { useAuthStore } from "@/features/auth/store/useAuthStore";
import { addressService } from "@/features/profile/services/addressService";
import { MapPicker } from "./MapPicker";
import type { PickedAddress } from "../types";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export function DeliveryLocationSidebar({ isOpen, onClose }: Props) {
  const t = useTranslations("locationPicker");
  const locale = useLocale();
  const isRtl = locale === "ar";

  const userId = useAuthStore((s) => s.userId);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const deliveryCoords = useLocationStore((s) => s.deliveryCoords);
  const deliveryStreetAddress = useLocationStore((s) => s.deliveryStreetAddress);
  const browserCoords = useLocationStore((s) => s.coords);
  const setDeliveryLocation = useLocationStore((s) => s.setDeliveryLocation);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const initialValue = useMemo<PickedAddress | null>(() => {
    if (!deliveryCoords) return null;
    return {
      title: "",
      coords: deliveryCoords,
      formattedAddress: deliveryStreetAddress ?? "",
      city: "",
      state: "",
      country: "",
      zip: "",
      streetAddress: deliveryStreetAddress ?? "",
    };
  }, [deliveryCoords, deliveryStreetAddress]);

  const currentLocation = useMemo(() => {
    if (!deliveryCoords || !deliveryStreetAddress) return null;
    return { coords: deliveryCoords, streetAddress: deliveryStreetAddress };
  }, [deliveryCoords, deliveryStreetAddress]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  const handleConfirm = async (picked: PickedAddress) => {
    if (!picked.coords || !picked.city.trim() || !picked.streetAddress.trim()) return;
    setSaving(true);
    setError(null);
    try {
      const saved = await addressService.create({
        title: picked.title.trim() || t("defaultTitle"),
        customer_id: userId ?? undefined,
        address: {
          zip: picked.zip.trim() || " ",
          city: picked.city.trim(),
          state: picked.state.trim() || " ",
          country: picked.country.trim() || "",
          street_address: picked.streetAddress.trim(),
        },
        location: {
          latitude: picked.coords.lat,
          longitude: picked.coords.lng,
        },
      });
      setDeliveryLocation(picked.coords, picked.streetAddress.trim(), saved.id);
      onClose();
    } catch {
      setError(t("saveError"));
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex" dir={isRtl ? "ltr" : "rtl"}>
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div
        className={cn(
          "relative h-full w-full sm:w-[450px] max-w-[90vw] bg-white shadow-xl overflow-y-auto",
          "animate-in duration-300",
          isRtl ? "slide-in-from-right" : "slide-in-from-left",
        )}
        style={{ direction: isRtl ? "rtl" : "ltr" }}
      >
        <div className="sticky top-0 z-20 flex items-center justify-between border-b border-border bg-white px-4 py-3.5">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-primary" />
            <h2 className="text-sm font-bold">{t("title")}</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 hover:bg-gray-100 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <MapPicker
          key={deliveryCoords ? `${deliveryCoords.lat},${deliveryCoords.lng}` : "none"}
          initialValue={initialValue}
          defaultCenter={browserCoords}
          currentLocation={currentLocation}
          saving={saving}
          confirmDisabled={!isAuthenticated}
          confirmDisabledHint={t("loginRequired")}
          error={error}
          onConfirm={handleConfirm}
        />
      </div>
    </div>
  );
}
