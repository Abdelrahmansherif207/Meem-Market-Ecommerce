import { couponService } from "../services/couponService";
import CouponsVouchersSwiper from "./CouponsVouchersSwiper";
import type { SectionFrontSetting } from "@/features/home/types";
import type { Coupon } from "../types";

interface CouponsVouchersSectionProps {
  title?: string;
  locale: string;
  setting?: SectionFrontSetting;
  endpoint?: string;
}

export default async function CouponsVouchersSection({
  title,
  locale,
  setting,
  endpoint,
}: CouponsVouchersSectionProps) {
  let coupons: Coupon[] = [];
  try {
    coupons = await couponService.getCoupons(locale, endpoint || "/general/coupons");
  } catch (error) {
    console.warn("[CouponsVouchersSection] Failed to fetch coupons:", error);
    return null;
  }

  if (!coupons.length) return null;

  return (
    <CouponsVouchersSwiper
      title={title}
      coupons={coupons}
      autoplay={setting?.autoplay}
      sliderSpeed={setting?.slider_speed}
    />
  );
}
