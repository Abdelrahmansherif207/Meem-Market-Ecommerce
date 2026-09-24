"use client";

import { useCallback, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useCouponClaims } from "@/features/coupons";
import { useNotificationStore } from "../store/useNotificationStore";
import { notificationService } from "../services/notificationService";
import { isClaimableCouponNotification } from "../utils";
import type { NotificationItem } from "../types";

export interface NotificationClaimControl {
  claimed: boolean;
  claiming: boolean;
  error: string | null;
  onClaim: () => Promise<void>;
}

/**
 * Claim support for coupon notifications. Wraps `useCouponClaims`
 * (one `GET /general/coupons/mine` fetch per surface) and adds
 * per-notification claim error state + auto mark-as-read on success.
 */
export function useClaimableNotifications(options?: { enabled?: boolean }) {
  const t = useTranslations("notifications");
  const locale = useLocale();
  const claims = useCouponClaims(options);
  const [claimErrors, setClaimErrors] = useState<Record<string, string | null>>({});

  const claimNotification = useCallback(
    async (n: NotificationItem) => {
      if (n.resourceId == null) return;
      const ok = await claims.claim(n.resourceId);
      if (ok) {
        setClaimErrors((prev) => ({ ...prev, [n.id]: null }));
        if (!n.readAt) {
          useNotificationStore.getState().markAsRead(n.id);
          notificationService.markAsRead(n.id, locale).catch(() => {});
        }
      } else {
        setClaimErrors((prev) => ({ ...prev, [n.id]: t("claimFailed") }));
      }
    },
    [claims, locale, t],
  );

  const claimControlFor = (n: NotificationItem): NotificationClaimControl | null => {
    if (!isClaimableCouponNotification(n)) return null;
    return {
      claimed: claims.claimedCouponIds.includes(n.resourceId as number),
      claiming: claims.claimingId === n.resourceId,
      error: claimErrors[n.id] ?? null,
      onClaim: () => claimNotification(n),
    };
  };

  return { claimControlFor };
}
