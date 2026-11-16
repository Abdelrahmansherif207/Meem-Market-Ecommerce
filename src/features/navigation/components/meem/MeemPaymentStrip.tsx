import Image from "next/image";
import type { PaymentGatewaySettings } from "@/features/settings";
import { cn } from "@/shared/utils/cn";

/**
 * Presentation-only colors keyed by backend gateway code. Labels always come
 * from settings (`display_name`), and only gateways returned by the backend
 * are rendered — there is no static badge list.
 */
const GATEWAY_STYLES: Record<string, string> = {
  myfatoorah: "bg-meem-ivory border-meem-border text-meem-charcoal",
  stripe: "bg-meem-ivory border-meem-border text-[#635BFF]",
  paypal: "bg-meem-ivory border-meem-border text-[#003087]",
  tap: "bg-meem-ivory border-meem-border text-[#00A5A8]",
  tamara: "bg-[#FFF0E8] border-orange-100 text-[#E56337]",
  tabby: "bg-[#D1F9E3] border-emerald-200 text-[#059669]",
};

const DEFAULT_STYLE = "bg-meem-ivory border-meem-border text-meem-charcoal";

export function PaymentBadges({
  gateways,
  className,
}: {
  gateways?: PaymentGatewaySettings[] | null;
  className?: string;
}) {
  const badges = (gateways ?? [])
    .filter((gateway) => gateway.enabled)
    .sort((a, b) => a.sort_order - b.sort_order);

  if (badges.length === 0) return null;

  return (
    <div className={cn("flex flex-wrap items-center gap-2", className)}>
      {badges.map((gateway) => (
        <span
          key={gateway.code}
          className={`rounded border px-2 py-1 text-[10px] font-bold ${
            GATEWAY_STYLES[gateway.code] ?? DEFAULT_STYLE
          }`}
        >
          {gateway.display_name}
        </span>
      ))}
    </div>
  );
}

interface MeemPaymentStripProps {
  copyright?: string;
  logoSrc?: string;
  siteName?: string;
  gateways?: PaymentGatewaySettings[] | null;
}

/**
 * Desktop footer bottom band: footer logo, settings-driven payment badges and
 * the backend copyright.
 */
export default function MeemPaymentStrip({
  copyright = "",
  logoSrc = "",
  siteName = "",
  gateways = null,
}: MeemPaymentStripProps) {
  return (
    <aside className="hidden w-full bg-meem-surface-deep px-4 py-6 lg:block lg:px-8">
      <div className="mx-auto flex max-w-[1440px] flex-col items-center justify-between gap-6 lg:flex-row">
        {logoSrc ? (
          <Image
            src={logoSrc}
            alt={siteName || "Meem Market Riyadh"}
            width={160}
            height={48}
            className="h-8 w-auto object-contain"
          />
        ) : (
          <span aria-hidden className="hidden lg:block" />
        )}

        <PaymentBadges gateways={gateways} />

        {copyright ? (
          <p className="text-center text-[10px] font-medium text-meem-muted lg:text-end">
            {copyright}
          </p>
        ) : (
          <span aria-hidden className="hidden lg:block" />
        )}
      </div>
    </aside>
  );
}
