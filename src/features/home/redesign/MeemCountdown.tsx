"use client";

import { useTranslations } from "next-intl";
import { useCountdown } from "@/features/flash-sales/hooks/useCountdown";

interface MeemCountdownProps {
  endsAt: string;
}

/**
 * Meem Market Riyadh countdown chip (tabular numerals, cool ivory pill) used on
 * flash-sale and timed product shelves. Reuses the existing useCountdown hook.
 */
export default function MeemCountdown({ endsAt }: MeemCountdownProps) {
  const t = useTranslations("meemHome");
  const { days, hours, minutes, seconds, isExpired, isReady, hasValidTarget } =
    useCountdown(endsAt);

  if (!hasValidTarget || isExpired) return null;

  const cells = [
    { value: days, label: t("countdown.days") },
    { value: hours, label: t("countdown.hours") },
    { value: minutes, label: t("countdown.minutes") },
    { value: seconds, label: t("countdown.seconds") },
  ];

  return (
    <div
      className="flex items-center gap-1"
      dir="ltr"
      role="timer"
      aria-label={t("countdown.label")}
    >
      {cells.map((cell, i) => (
        <span key={i} className="flex items-center gap-1">
          <span className="flex min-w-8 flex-col items-center rounded-lg border border-meem-border-soft bg-meem-surface px-1.5 py-1 leading-none">
            <span className="text-sm font-bold tabular-nums text-meem-charcoal">
              {isReady ? String(cell.value).padStart(2, "0") : "--"}
            </span>
            <span className="mt-0.5 text-[9px] font-semibold text-meem-muted-soft">
              {cell.label}
            </span>
          </span>
          {i < cells.length - 1 && (
            <span className="text-sm font-bold text-meem-sky">:</span>
          )}
        </span>
      ))}
    </div>
  );
}
