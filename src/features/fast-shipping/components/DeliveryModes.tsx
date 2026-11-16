"use client";

import { useEffect } from "react";
import type { ReactNode } from "react";
import { Loader2 } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { cn } from "@/shared/utils/cn";
import { formatMoney } from "@/shared/utils/formatMoney";
import {
  useCurrencySnapshot,
  useCurrencyStore,
  useDisplayCurrency,
} from "@/features/currencies";
import { useChannelStore } from "../store/useChannelStore";
import { useFastShippingStatusStore } from "../store/useFastShippingStatusStore";
import type { Channel } from "../store/useChannelStore";
import { DeliveryModeButton } from "./DeliveryModeButton";

interface DeliveryModesProps {
  /** Compact segmented row used under the mobile search bar. */
  compact?: boolean;
  className?: string;
}

/**
 * Delivery-mode toggle (Scheduled / NOW), available to guests and signed-in
 * shoppers alike.
 *
 * - The persisted browsing channel drives the default delivery type for all
 *   cart actions, so a guest can browse and add NOW items without signing in.
 * - Availability, fee and ETA come from `GET /general/settings` →
 *   `options.fast_shipping`; missing fee/ETA data is simply not rendered.
 * - No `X-Channel` header is set here. Mutations pass the channel explicitly.
 */
export default function DeliveryModes({
  compact = false,
  className,
}: DeliveryModesProps) {
  const t = useTranslations("meemHeader.deliveryModes");
  const locale = useLocale();
  const displayCurrency = useDisplayCurrency();
  const snapshot = useCurrencySnapshot();
  // Fast fee comes from settings in the backend base currency; convert it to
  // the selected display currency the same way checkout does.
  const selectedCurrencyRate = useCurrencyStore((s) => {
    if (
      !displayCurrency.code ||
      !snapshot ||
      displayCurrency.code === snapshot.baseCode
    ) {
      return null;
    }
    const displayRate = s.byCode[displayCurrency.code]?.effectiveRate;
    const baseRate = s.byCode[snapshot.baseCode]?.effectiveRate;
    if (!displayRate || !baseRate || baseRate <= 0) return null;
    return displayRate / baseRate;
  });
  const channel = useChannelStore((s) => s.channel);
  const setChannel = useChannelStore((s) => s.setChannel);
  const { status, loading, fetchStatus } = useFastShippingStatusStore();

  useEffect(() => {
    fetchStatus(locale);
  }, [fetchStatus, locale]);

  const isDetermined = status !== null && !loading;
  const isFastAvailable = Boolean(status?.enabled && status.available);
  const isUnavailable = isDetermined && !isFastAvailable;

  // Never keep browsing in a channel the backend has disabled (covers a
  // status change or a click made while the status was still loading).
  useEffect(() => {
    if (isUnavailable && channel !== "home") {
      setChannel("home");
    }
  }, [isUnavailable, channel, setChannel]);

  const eta = (): ReactNode => {
    if (!isDetermined) {
      return (
        <span className="inline-flex items-center" aria-label={t("loading")}>
          <Loader2 className="size-3 animate-spin" aria-hidden />
        </span>
      );
    }
    if (!status) return null;

    const parts: string[] = [];
    const minutes = status.duration_minutes;
    if (minutes !== null && minutes !== undefined && minutes > 0) {
      if (minutes < 60) {
        parts.push(t("etaMinutes", { count: minutes }));
      } else if (minutes % 60 === 0) {
        parts.push(t("etaHours", { count: minutes / 60 }));
      } else {
        parts.push(
          t("etaHoursMinutes", {
            hours: Math.floor(minutes / 60),
            minutes: minutes % 60,
          }),
        );
      }
    }

    if (status.fee !== null && status.fee !== undefined) {
      if (status.fee > 0) {
        parts.push(
          t("fee", {
            amount: formatMoney(
              status.fee * (selectedCurrencyRate ?? 1),
              locale,
              {
                symbol: displayCurrency.symbol,
                decimalPlaces: displayCurrency.decimalPlaces,
              },
            ),
          }),
        );
      } else {
        parts.push(t("free"));
      }
    }

    return parts.length > 0 ? parts.join(" · ") : null;
  };

  const etaText = isUnavailable ? undefined : eta();

  const handleChannelChange = (next: Channel) => {
    if (next === channel) return;

    if (next === "fast-shipping" && isDetermined && !isFastAvailable) {
      return;
    }

    setChannel(next);
  };

  if (compact) {
    return (
      <div
        role="group"
        aria-label={t("label")}
        className={cn(
          "flex w-full items-center gap-1 rounded-lg border border-meem-border bg-white/80 p-0.5 shadow-elev-1 backdrop-blur",
          className,
        )}
      >
        <DeliveryModeButton
          label={t("scheduled")}
          icon={{ src: "/scheduled.avif", alt: t("scheduled") }}
          tone="primary"
          selected={channel === "home"}
          compact
          onClick={() => handleChannelChange("home")}
        />
        <DeliveryModeButton
          label={t("now")}
          icon={{ src: "/now.avif", alt: t("now") }}
          tone="accent"
          selected={channel === "fast-shipping"}
          etaText={etaText}
          note={t("unavailable")}
          compact
          onClick={() => handleChannelChange("fast-shipping")}
          disabled={isUnavailable}
        />
      </div>
    );
  }

  return (
    <div
      role="group"
      aria-label={t("label")}
      className={cn("flex items-center gap-2.5", className)}
    >
      <DeliveryModeButton
        label={t("scheduled")}
        icon={{ src: "/scheduled.avif", alt: t("scheduled") }}
        tone="primary"
        selected={channel === "home"}
        onClick={() => handleChannelChange("home")}
      />
      <DeliveryModeButton
        label={t("now")}
        icon={{ src: "/now.avif", alt: t("now") }}
        tone="accent"
        selected={channel === "fast-shipping"}
        etaText={etaText}
        note={t("unavailable")}
        onClick={() => handleChannelChange("fast-shipping")}
        disabled={isUnavailable}
      />
    </div>
  );
}
