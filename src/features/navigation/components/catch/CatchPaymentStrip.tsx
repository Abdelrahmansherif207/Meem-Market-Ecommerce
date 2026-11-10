export const PAYMENT_BADGES = [
  { label: "mada", className: "bg-catch-ivory border-catch-border text-catch-charcoal" },
  { label: "VISA", className: "bg-catch-ivory border-catch-border text-blue-700" },
  { label: "mastercard", className: "bg-catch-ivory border-catch-border text-red-600" },
  { label: "tamara", className: "bg-[#FFF0E8] border-orange-100 text-[#E56337]" },
  { label: "Apple Pay", className: "bg-catch-ivory border-catch-border text-catch-charcoal" },
  { label: "tabby", className: "bg-[#D1F9E3] border-emerald-200 text-[#059669]" },
  { label: "AMEX", className: "bg-[#006FCF] border-[#006FCF] text-white" },
  { label: "stc bank", className: "bg-[#53267F] border-[#53267F] text-white" },
  { label: "G Pay", className: "bg-catch-ivory border-catch-border text-catch-charcoal" },
  { label: "EMKAN", className: "bg-catch-ivory border-catch-border text-[#227282]" },
  { label: "madfu", className: "bg-catch-ivory border-catch-border text-[#6D28D9]" },
  { label: "MIS", className: "bg-catch-ivory border-catch-border text-[#4F46E5]" },
] as const;

/**
 * Payment gateway strip on the deeper sand footer band.
 * Payment badges are static (no API).
 */
export default function CatchPaymentStrip() {
  return (
    <aside className="hidden w-full bg-catch-surface-deep px-4 py-6 lg:block lg:px-8">
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
      </div>
    </aside>
  );
}
