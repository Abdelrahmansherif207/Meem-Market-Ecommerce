"use client";

import { useEffect } from "react";
import { useTranslations } from "next-intl";
import { X, MapPin } from "lucide-react";
import { cn } from "@/shared/utils/cn";
import { MapPicker } from "./MapPicker";
import type { PickedAddress } from "../types";

interface MapPickerModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (picked: PickedAddress) => void;
  initialValue?: PickedAddress | null;
  defaultCenter?: { lat: number; lng: number } | null;
  currentLocation?: { coords: { lat: number; lng: number }; streetAddress: string } | null;
  saving?: boolean;
  confirmDisabled?: boolean;
  confirmDisabledHint?: string;
  error?: string | null;
  title?: string;
}

export function MapPickerModal({
  open,
  onClose,
  onConfirm,
  initialValue,
  defaultCenter,
  currentLocation,
  saving,
  confirmDisabled,
  confirmDisabledHint,
  error,
  title,
}: MapPickerModalProps) {
  const t = useTranslations("locationPicker");

  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div
        className={cn(
          "relative flex h-[100dvh] w-full flex-col overflow-hidden rounded-t-2xl bg-white shadow-xl",
          "animate-in duration-300 slide-in-from-bottom",
          "sm:h-auto sm:max-h-[90vh] sm:max-w-lg sm:rounded-2xl lg:max-w-xl",
        )}
      >
        <div className="sticky top-0 z-20 flex shrink-0 items-center justify-between border-b border-border bg-white px-4 py-3.5">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-primary" />
            <h2 className="text-sm font-bold">{title ?? t("title")}</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 hover:bg-gray-100 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          <MapPicker
            initialValue={initialValue}
            defaultCenter={defaultCenter}
            currentLocation={currentLocation}
            saving={saving}
            confirmDisabled={confirmDisabled}
            confirmDisabledHint={confirmDisabledHint}
            error={error}
            onConfirm={onConfirm}
          />
        </div>
      </div>
    </div>
  );
}
