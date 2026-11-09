import { couponService } from "@/features/coupons/services/couponService";
import type { Coupon } from "@/features/coupons/types";
import { SectionHeader } from "@/components/ui/SectionHeader";
import type { SectionFrontSetting } from "../types";
import { resolveLocalizedText } from "../utils";
import CatchCouponBanner from "./CatchCouponBanner";

interface CatchCouponsSectionProps {
  title: string;
  locale: string;
  setting?: SectionFrontSetting;
  endpoint?: string;
}

interface CouponPlacement {
  coupon: Coupon;
  variant: "full" | "half";
}

/**
 * Screen campaign-grid rule — the coupon count decides the layout:
 * 1 → one full-width banner
 * 2 → two half-width
 * 3 → two half-width + one full-width (last)
 * 4 → four half-width (2×2)
 * 5+ → one full-width first, the rest in 2-column rows (odd leftover full)
 * Fulls always land on row boundaries, so CSS auto-placement has no gaps.
 */
function planLayout(coupons: Coupon[]): CouponPlacement[] {
  const n = coupons.length;
  if (n === 1) return [{ coupon: coupons[0], variant: "full" }];
  if (n === 2) return coupons.map((c) => ({ coupon: c, variant: "half" }));
  if (n === 3) return [
    ...coupons.slice(0, 2).map((c) => ({ coupon: c, variant: "half" as const })),
    { coupon: coupons[2], variant: "full" },
  ];
  if (n === 4) return coupons.map((c) => ({ coupon: c, variant: "half" as const }));

  const placements: CouponPlacement[] = [{ coupon: coupons[0], variant: "full" }];
  const rest = coupons.slice(1);
  let i = 0;
  while (i < rest.length) {
    if (rest.length - i === 1) {
      placements.push({ coupon: rest[i], variant: "full" });
      i += 1;
    } else {
      placements.push({ coupon: rest[i], variant: "half" });
      placements.push({ coupon: rest[i + 1], variant: "half" });
      i += 2;
    }
  }
  return placements;
}

/**
 * Screen-matched Coupons & Vouchers: adaptive full/half banner grid using
 * the existing couponService data.
 */
export default async function CatchCouponsSection({
  title,
  locale,
  setting,
  endpoint,
}: CatchCouponsSectionProps) {
  let coupons: Coupon[] = [];
  try {
    coupons = await couponService.getCoupons(locale, endpoint || "/general/coupons");
  } catch (error) {
    console.warn("[CatchCouponsSection] Failed to fetch coupons:", error);
    return null;
  }

  if (!coupons.length) return null;

  const placements = planLayout(coupons);
  const showTitle = setting?.show_title !== false;
  const subtitle = resolveLocalizedText(setting?.subtitle, locale);

  return (
    <section className="w-full space-y-4">
      {showTitle ? (
        <SectionHeader title={title} subtitle={subtitle} />
      ) : null}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {placements.map(({ coupon, variant }) => (
          <CatchCouponBanner
            key={coupon.id}
            coupon={coupon}
            variant={variant}
            className={variant === "full" ? "md:col-span-2" : undefined}
          />
        ))}
      </div>
    </section>
  );
}
