"use client";

import { useEffect, useState } from "react";
import { cn } from "@/shared/utils/cn";

/**
 * Flash-deal countdown pill ("18 : 22 : 05") from the Stitch PDP screens.
 *
 * Rendered ONLY when the payload carries a real offer end date (`end_date`
 * with an active flash sale / discount). Lands hidden on the server
 * (mount-gated) so the server HTML and the hydrated state agree, and
 * disappears the instant the deal expires.
 *
 * `alwaysShow` + `fallbackText` support static badges (e.g. product-card
 * pills from listing payloads that carry `flash_sale_active` without dates):
 * without a date the component renders the fallback text instead of a timer.
 */
export function NiceOneCountdown({
  endDate,
  alwaysShow = false,
  fallbackText = null,
  className,
}: {
  endDate?: string | null;
  /** Static fallback mode for previews/tests/listing badges without dates. */
  alwaysShow?: boolean;
  /** Text rendered in static mode (no real date available). */
  fallbackText?: string | null;
  className?: string;
}) {
  const [staticMode, setStaticMode] = useState(false);
  const [remainingMs, setRemainingMs] = useState<number | null>(null);

  useEffect(() => {
    if (!endDate && !alwaysShow) return;

    const target = endDate ? new Date(endDate).getTime() : NaN;
    if (Number.isNaN(target)) {
      // No usable date — static fallback.
      if (alwaysShow && fallbackText) setStaticMode(true);
      return;
    }

    const tick = () => {
      const diff = target - Date.now();
      if (diff <= 0) {
        // Expired with a real date: hide unless a fallback exists.
        if (alwaysShow && fallbackText) setStaticMode(true);
        setRemainingMs(null);
      } else {
        setRemainingMs(diff);
      }
    };

    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [endDate, alwaysShow, fallbackText]);

  if (staticMode) {
    if (!fallbackText) return null;
    return (
      <span
        className={cn(
          "inline-flex items-center justify-center text-2xs font-bold text-white tabular-nums",
          className,
        )}
      >
        {fallbackText}
      </span>
    );
  }

  if (remainingMs === null) return null;

  const totalSeconds = Math.floor(remainingMs / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const pad = (n: number) => String(n).padStart(2, "0");

  return (
    <div
      role="timer"
      aria-label="Deal countdown"
      dir="ltr"
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md bg-discount px-3 py-1 text-2xs font-bold text-white tabular-nums",
        className,
      )}
    >
      {pad(hours)}
      <span>:</span>
      {pad(minutes)}
      <span>:</span>
      {pad(seconds)}
    </div>
  );
}
