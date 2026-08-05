"use client";

import { MapPin, Pencil, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";
import type { Address } from "../types";

interface AddressCardProps {
  address: Address;
  onEdit: (address: Address) => void;
  onDelete: (id: number) => void;
}

export function AddressCard({ address, onEdit, onDelete }: AddressCardProps) {
  const t = useTranslations("profile.address");

  return (
    <div className="relative rounded-2xl border-2 border-border bg-white p-4 space-y-1.5">
      <div className="flex items-center gap-2">
        <MapPin className="h-4 w-4 text-text-secondary shrink-0" />
        <span className="text-sm font-bold text-text-primary">{address.title}</span>
      </div>

      <p className="text-sm text-text-secondary pl-6">
        {address.address.street_address}, {address.address.city}, {address.address.state},{" "}
        {address.address.country} {address.address.zip}
      </p>

      <div className="flex items-center gap-2 pl-6 pt-1">
        <button
          type="button"
          onClick={() => onEdit(address)}
          className="flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
        >
          <Pencil className="h-3 w-3" />
          {t("edit")}
        </button>
        <button
          type="button"
          onClick={() => onDelete(address.id)}
          className="flex items-center gap-1 text-xs font-semibold text-red-500 hover:underline"
        >
          <Trash2 className="h-3 w-3" />
          {t("delete")}
        </button>
      </div>
    </div>
  );
}
