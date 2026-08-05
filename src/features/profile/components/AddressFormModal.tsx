"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { X, Loader2, MapPin } from "lucide-react";
import { MapPickerModal, useLocationStore } from "@/features/location";
import type { PickedAddress } from "@/features/location";
import type { Address, CreateAddressPayload } from "../types";

interface AddressFormModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (payload: CreateAddressPayload) => Promise<void>;
  editingAddress?: Address | null;
  customerId: number;
}

export function AddressFormModal({ open, onClose, onSubmit, editingAddress, customerId }: AddressFormModalProps) {
  const t = useTranslations("profile.address.form");
  const [form, setForm] = useState(() => {
    if (editingAddress) {
      return {
        title: editingAddress.title,
        zip: editingAddress.address.zip,
        city: editingAddress.address.city,
        state: editingAddress.address.state,
        country: editingAddress.address.country,
        street_address: editingAddress.address.street_address,
      };
    }
    return { title: "", zip: "", city: "", state: "", country: "", street_address: "" };
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mapOpen, setMapOpen] = useState(false);
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(
    editingAddress?.location ?? null,
  );
  const browserCoords = useLocationStore((s) => s.coords);

  if (!open) return null;

  const initialPicked: PickedAddress | null = editingAddress?.location
    ? {
        coords: {
          lat: editingAddress.location.latitude,
          lng: editingAddress.location.longitude,
        },
        title: editingAddress.title,
        formattedAddress: "",
        city: editingAddress.address.city,
        state: editingAddress.address.state,
        country: editingAddress.address.country,
        zip: editingAddress.address.zip,
        streetAddress: editingAddress.address.street_address,
      }
    : null;

  const set = (field: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
    setError(null);
  };

  const handleMapPicked = (picked: PickedAddress) => {
    setMapOpen(false);
    setLocation({ latitude: picked.coords.lat, longitude: picked.coords.lng });
    setForm((prev) => ({
      ...prev,
      title: picked.title.trim() || prev.title,
      city: picked.city.trim() || prev.city,
      state: picked.state.trim() || prev.state,
      country: picked.country.trim() || prev.country,
      street_address: picked.streetAddress.trim() || prev.street_address,
      zip: picked.zip.trim() || prev.zip,
    }));
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!form.title || !form.city || !form.state || !form.country || !form.street_address) {
      setError(t("required"));
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit({
        title: form.title,
        customer_id: customerId,
        address: {
          zip: form.zip,
          city: form.city,
          state: form.state,
          country: form.country,
          street_address: form.street_address,
        },
        ...(location ? { location } : {}),
      });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : t("error"));
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass =
    "w-full rounded-xl border-2 border-border bg-white px-4 py-3 text-sm text-text-primary outline-none transition-colors placeholder:text-text-secondary/50 focus:border-primary";
  const labelClass = "text-sm font-semibold text-text-primary";

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40">
      <div className="w-full max-w-lg rounded-t-2xl sm:rounded-2xl bg-white p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-bold text-text-primary">
            {editingAddress ? t("editTitle") : t("addTitle")}
          </h3>
          <button type="button" onClick={onClose} className="text-text-secondary hover:text-text-primary">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="rounded-xl border-2 border-red-200 bg-red-50 p-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <div className="space-y-1.5">
            <label className={labelClass}>{t("title")}</label>
            <input className={inputClass} value={form.title} onChange={set("title")} placeholder={t("titlePlaceholder")} />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="space-y-1.5">
              <label className={labelClass}>{t("country")}</label>
              <input className={inputClass} value={form.country} onChange={set("country")} placeholder={t("countryPlaceholder")} />
            </div>
            <div className="space-y-1.5">
              <label className={labelClass}>{t("state")}</label>
              <input className={inputClass} value={form.state} onChange={set("state")} placeholder={t("statePlaceholder")} />
            </div>
            <div className="space-y-1.5">
              <label className={labelClass}>{t("city")}</label>
              <input className={inputClass} value={form.city} onChange={set("city")} placeholder={t("cityPlaceholder")} />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className={labelClass}>{t("streetAddress")}</label>
            <input className={inputClass} value={form.street_address} onChange={set("street_address")} placeholder={t("streetPlaceholder")} />
          </div>

          <button
            type="button"
            onClick={() => setMapOpen(true)}
            className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border py-3 text-sm font-semibold text-primary transition-all hover:border-primary hover:bg-primary/5"
          >
            <MapPin className="h-4 w-4" />
            {t("pickOnMap")}
          </button>

          <div className="space-y-1.5">
            <label className={labelClass}>{t("zip")}</label>
            <input className={inputClass} value={form.zip} onChange={set("zip")} placeholder={t("zipPlaceholder")} />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3 text-sm font-bold text-white transition-all hover:opacity-90 disabled:opacity-50"
          >
            {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
            {submitting ? t("saving") : (editingAddress ? t("save") : t("add"))}
          </button>
        </form>

        <MapPickerModal
          open={mapOpen}
          onClose={() => setMapOpen(false)}
          onConfirm={handleMapPicked}
          initialValue={initialPicked}
          defaultCenter={initialPicked?.coords ?? browserCoords ?? null}
          title={t("pickOnMapTitle")}
        />
      </div>
    </div>
  );
}
