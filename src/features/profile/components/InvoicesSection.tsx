"use client";

import { useState, useEffect, useCallback } from "react";
import { useTranslations } from "next-intl";
import { invoiceService } from "../services/invoiceService";
import type { InvoiceListItem } from "../types";
import { InvoiceCard } from "./InvoiceCard";
import { InvoiceDetailModal } from "./InvoiceDetailModal";
import { InvoicesSkeleton } from "./skeletons/InvoicesSkeleton";
import EmptyState from "@/components/ui/EmptyState";

export function InvoicesSection() {
  const t = useTranslations("profile.invoices");
  const [invoices, setInvoices] = useState<InvoiceListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedInvoice, setSelectedInvoice] = useState<InvoiceListItem | null>(null);

  useEffect(() => {
    invoiceService
      .getAll()
      .then((data) => setInvoices(data.data))
      .catch((err) => setError(err instanceof Error ? err.message : t("loadError")))
      .finally(() => setLoading(false));
  }, [t]);

  const handleViewDetails = useCallback((invoice: InvoiceListItem) => {
    setSelectedInvoice(invoice);
  }, []);

  const handleCloseModal = useCallback(() => {
    setSelectedInvoice(null);
  }, []);

  if (loading) return <InvoicesSkeleton />;

  if (error) {
    return (
      <div className="rounded-xl border-2 border-red-200 bg-red-50 p-4 text-sm text-red-700">
        {error}
      </div>
    );
  }

  if (invoices.length === 0) {
    return (
      <EmptyState
        size="compact"
        variant="orders"
        title={t("empty")}
        description={t("emptyDescription")}
      />
    );
  }

  return (
    <div className="space-y-3">
      {invoices.map((invoice) => (
        <InvoiceCard
          key={invoice.uuid}
          invoice={invoice}
          onViewDetails={handleViewDetails}
        />
      ))}

      {selectedInvoice && (
        <InvoiceDetailModal
          invoice={selectedInvoice}
          open={!!selectedInvoice}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
}
