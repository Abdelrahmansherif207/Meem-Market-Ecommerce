"use client";

import { useTranslations } from "next-intl";
import { FileText, ChevronDown, ChevronUp, ExternalLink } from "lucide-react";
import { useState } from "react";
import type { InvoiceListItem } from "../types";

interface InvoiceCardProps {
  invoice: InvoiceListItem;
  onViewDetails: (invoice: InvoiceListItem) => void;
}

const statusColors: Record<string, string> = {
  ready: "bg-green-100 text-green-700",
  generated: "bg-blue-100 text-blue-700",
};

export function InvoiceCard({ invoice, onViewDetails }: InvoiceCardProps) {
  const t = useTranslations("profile.invoices");
  const [expanded, setExpanded] = useState(false);

  const statusClass = statusColors[invoice.status] || "bg-gray-100 text-gray-700";

  return (
    <div className="rounded-2xl border-2 border-border bg-white overflow-hidden">
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between p-4 text-left hover:bg-surface/50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <FileText className="h-5 w-5 text-text-secondary shrink-0" />
          <div>
            <p className="text-sm font-bold text-text-primary">{invoice.invoice_number}</p>
            <p className="text-xs text-text-secondary">
              {new Date(invoice.generated_at).toLocaleDateString()}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full capitalize ${statusClass}`}>
            {t(`status.${invoice.status}`, { defaultValue: invoice.status })}
          </span>
          <span className="text-sm font-bold text-text-primary">
            {invoice.total} {invoice.currency}
          </span>
          {expanded ? (
            <ChevronUp className="h-4 w-4 text-text-secondary" />
          ) : (
            <ChevronDown className="h-4 w-4 text-text-secondary" />
          )}
        </div>
      </button>

      {expanded && (
        <div className="border-t border-border px-4 py-3 space-y-3">
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-text-secondary">{t("subtotal")}</span>
              <span className="font-medium text-text-primary">
                {invoice.subtotal} {invoice.currency}
              </span>
            </div>
            {invoice.shipping_price > 0 && (
              <div className="flex justify-between">
                <span className="text-text-secondary">{t("shipping")}</span>
                <span className="font-medium text-text-primary">
                  {invoice.shipping_price} {invoice.currency}
                </span>
              </div>
            )}
            {invoice.total_discount > 0 && (
              <div className="flex justify-between">
                <span className="text-text-secondary">{t("discount")}</span>
                <span className="font-medium text-green-600">
                  -{invoice.total_discount} {invoice.currency}
                </span>
              </div>
            )}
            <div className="flex justify-between border-t border-border pt-2">
              <span className="font-semibold text-text-primary">{t("total")}</span>
              <span className="font-bold text-text-primary">
                {invoice.total} {invoice.currency}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 pt-1">
            <button
              type="button"
              onClick={() => onViewDetails(invoice)}
              className="flex-1 flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary/90"
            >
              {t("viewDetails")}
            </button>
            {invoice.download_url && (
              <a
                href={invoice.download_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 rounded-lg border-2 border-border px-4 py-2.5 text-sm font-semibold text-text-primary transition-colors hover:bg-surface"
              >
                <ExternalLink className="h-4 w-4" />
                {t("downloadPdf")}
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
