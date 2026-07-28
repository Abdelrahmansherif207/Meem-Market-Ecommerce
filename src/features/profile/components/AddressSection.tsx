"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Plus } from "lucide-react";
import { addressService } from "../services/addressService";
import type { Address, CreateAddressPayload } from "../types";
import { AddressCard } from "./AddressCard";
import { AddressFormModal } from "./AddressFormModal";
import { AddressSkeleton } from "./skeletons/AddressSkeleton";

interface AddressSectionProps {
  customerId: number;
}

export function AddressSection({ customerId }: AddressSectionProps) {
  const t = useTranslations("profile.address");
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);

  useEffect(() => {
    addressService.getAll()
      .then((data) => setAddresses(data))
      .catch((err) => setError(err instanceof Error ? err.message : t("loadError")))
      .finally(() => setLoading(false));
  }, [t]);

  const handleAdd = () => {
    setEditingAddress(null);
    setModalOpen(true);
  };

  const handleEdit = (address: Address) => {
    setEditingAddress(address);
    setModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    try {
      await addressService.delete(id);
      setAddresses((prev) => prev.filter((a) => a.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : t("deleteError"));
    }
  };

  const handleSubmit = async (payload: CreateAddressPayload) => {
    if (editingAddress) {
      const updated = await addressService.update(editingAddress.id, payload);
      setAddresses((prev) => prev.map((a) => (a.id === updated.id ? updated : a)));
    } else {
      const created = await addressService.create(payload);
      setAddresses((prev) => [...prev, created]);
    }
  };

  if (loading) return <AddressSkeleton />;

  return (
    <div className="space-y-4">
      {error && (
        <div className="rounded-xl border-2 border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <button
        type="button"
        onClick={handleAdd}
        className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border py-4 text-sm font-semibold text-primary transition-all hover:border-primary hover:bg-primary/5"
      >
        <Plus className="h-4 w-4" />
        {t("addNew")}
      </button>

      {addresses.length === 0 ? (
        <p className="text-center text-sm text-text-secondary py-8">{t("empty")}</p>
      ) : (
        <div className="space-y-3">
          {addresses.map((address) => (
            <AddressCard
              key={address.id}
              address={address}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {modalOpen && (
        <AddressFormModal
          key={editingAddress?.id ?? 'add-new'}
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          onSubmit={handleSubmit}
          editingAddress={editingAddress}
          customerId={customerId}
        />
      )}
    </div>
  );
}
