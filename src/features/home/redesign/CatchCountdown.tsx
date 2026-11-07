"use client";

import { useTranslations } from "next-intl";
import { useCountdown } from "@/features/flash-sales/hooks/useCountdown";

interface CatchCountdownProps {
  endsAt: string;
}

/**
 * Catch Beauty countdown chip (tabular numerals, warm ivory pill) used on
 * flash-sale and timed product shelves. Reuses the existing useCountdown hook.
 */
export default function CatchCountdown({ endsAt }: CatchCountdownProps) {
  const t = useTranslations("catchHome");
  const { days, hours, minutes, seconds, isExpired, isReady } =
    useCountdown(endsAt);

  if (isExpired) return null;

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
          <span className="flex min-w-8 flex-col items-center rounded-lg border border-catch-border-soft bg-catch-surface px-1.5 py-1 leading-none">
            <span className="text-sm font-bold tabular-nums text-catch-charcoal">
              {isReady ? String(cell.value).padStart(2, "0") : "--"}
            </span>
            <span className="mt-0.5 text-[9px] font-semibold text-catch-muted-soft">
              {cell.label}
            </span>
          </span>
          {i < cells.length - 1 && (
            <span className="text-sm font-bold text-catch-rose">:</span>
          )}
        </span>
      ))}
    </div>
  );
}
