import { getTranslations } from "next-intl/server";

interface CatchPaymentStripProps {
  copyright?: string;
}

export const PAYMENT_BADGES = [
  { label: "mada", className: "bg-neutral-50 border-neutral-200 text-neutral-700" },
  { label: "VISA", className: "bg-neutral-50 border-neutral-200 text-blue-700" },
  { label: "mastercard", className: "bg-neutral-50 border-neutral-200 text-red-600" },
  { label: "tamara", className: "bg-[#FFF0E8] border-orange-100 text-[#E56337]" },
  { label: "Apple Pay", className: "bg-neutral-50 border-neutral-200 text-black" },
  { label: "tabby", className: "bg-[#D1F9E3] border-emerald-200 text-[#059669]" },
  { label: "AMEX", className: "bg-[#006FCF] border-[#006FCF] text-white" },
  { label: "stc bank", className: "bg-[#53267F] border-[#53267F] text-white" },
  { label: "G Pay", className: "bg-neutral-50 border-neutral-200 text-neutral-800" },
  { label: "EMKAN", className: "bg-neutral-50 border-neutral-200 text-[#227282]" },
  { label: "madfu", className: "bg-neutral-50 border-neutral-200 text-[#6D28D9]" },
  { label: "MIS", className: "bg-neutral-50 border-neutral-200 text-[#4F46E5]" },
] as const;

/**
 * Screen copyright + payment gateway strip. Payment badges are static
 * (no API); copyright text comes from site settings when available.
 */
export default async function CatchPaymentStrip({ copyright }: CatchPaymentStripProps) {
  const t = await getTranslations("catchFooter");

  return (
    <aside className="hidden w-full bg-white px-4 py-6 lg:block lg:px-8">
      <div className="mx-auto flex max-w-[1440px] flex-col items-center justify-between gap-6 lg:flex-row">
        {/* Payment gateway badges */}
        <div className="flex flex-wrap items-center gap-2">
          {PAYMENT_BADGES.map((badge) => (
            <span
              key={badge.label}
              className={`rounded border px-2 py-1 text-[10px] font-bold ${badge.className}`}
            >
              {badge.label}
            </span>
          ))}
        </div>

        {/* Copyright info & trust seal */}
        <div className="flex items-center gap-4 text-right text-[11px] text-neutral-500">
          <div>
            <div>{copyright || t("copyright")}</div>
            <div className="text-[10px]">{t("crVat")}</div>
          </div>
          <div className="flex h-8 w-8 items-center justify-center rounded-full border border-teal-500 text-xs font-bold text-teal-600">
            م
          </div>
        </div>
      </div>
    </aside>
  );
}
