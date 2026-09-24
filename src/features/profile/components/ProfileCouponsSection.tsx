"use client";

import { useCallback, useState } from "react";
import { MyCouponsList, MyClaimsList, useMyCoupons } from "@/features/coupons";

export function ProfileCouponsSection() {
  const coupons = useMyCoupons();
  const [appliedCouponCode, setAppliedCouponCode] = useState<string | null>(null);

  const handleApplied = useCallback((code: string) => {
    setAppliedCouponCode(code);
  }, []);

  return (
    <div className="space-y-6">
      <MyCouponsList
        appliedCouponCode={appliedCouponCode}
        onApplied={handleApplied}
        data={coupons}
      />
      <MyClaimsList data={coupons} />
    </div>
  );
}
