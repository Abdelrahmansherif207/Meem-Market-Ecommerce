"use client";

import { useEffect, useState } from "react";
import { cn } from "@/shared/utils/cn";

/**
 * Flash-deal countdown pill ("18 : 22 : 05") from the Stitch PDP screens.
 *
 * Renders a timer only when the payload carries a real offer end date
 * (`end_date` with an active flash sale / discount). The timer is mount-gated
 * so server HTML and hydrated state agree, then disappears when the deal
 * expires.
 *
 * `alwaysShow` + `fallbackText` support static badges (e.g. product-card
 * pills from listing payloads that carry `flash_sale_active` without dates):
 * without a date the component renders the fallback text instead of a timer.
 *
 * `prefix` (e.g. "Ends in") is rendered only while a live timer is visible,
 * never beside the static fallback.
 */
export function NiceOneCountdown({
  endDate,
  alwaysShow = false,
  fallbackText = null,
  prefix = null,
  className,
}: {
  endDate?: string | null;
  /** Static fallback mode for previews/tests/listing badges without dates. */
  alwaysShow?: boolean;
  /** Text rendered in static mode (no real date available). */
  fallbackText?: string | null;
  /** Label rendered before the timer only while a real countdown is active. */
  prefix?: string | null;
  className?: string;
}) {
  const [now, setNow] = useState<number | null>(null);

  const target = endDate ? new Date(endDate).getTime() : NaN;
  const hasValidTarget = !Number.isNaN(target);

  useEffect(() => {
    if (!hasValidTarget) return;

    const tick = () => setNow(Date.now());
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [hasValidTarget]);

  const staticFallback =
    alwaysShow && fallbackText ? (
      <span
        className={cn(
          "inline-flex items-center justify-center whitespace-nowrap text-2xs font-bold text-white tabular-nums",
          className,
        )}
      >
        {fallbackText}
      </span>
    ) : null;

  if (!hasValidTarget) return staticFallback;
  if (now === null) return null;

  const remainingMs = Math.max(0, target - now);
  if (remainingMs <= 0) return staticFallback;

  const totalSeconds = Math.floor(remainingMs / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const pad = (n: number) => String(n).padStart(2, "0");

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md bg-discount px-3 py-1 text-2xs font-bold text-white tabular-nums whitespace-nowrap",
        className,
      )}
    >
      {prefix ? <span className="shrink-0">{prefix}</span> : null}
      <span
        role="timer"
        aria-label="Deal countdown"
        dir="ltr"
        className="inline-flex shrink-0 items-center gap-1 tabular-nums"
      >
        {pad(hours)}
        <span>:</span>
        {pad(minutes)}
        <span>:</span>
        {pad(seconds)}
      </span>
    </span>
  );
}
