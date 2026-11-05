"use client";

import { useCountdown } from "@/features/flash-sales/hooks/useCountdown";

interface CatchCountdownProps {
  endsAt: string;
}

/**
 * Screen-matched countdown chip (tabular numerals, neutral pill) used on
 * flash-sale shelves. Reuses the existing useCountdown hook.
 */
export default function CatchCountdown({ endsAt }: CatchCountdownProps) {
  const { days, hours, minutes, seconds, isExpired, isReady } =
    useCountdown(endsAt);

  if (isExpired) return null;

  const cells = [
    { value: days, label: "D" },
    { value: hours, label: "H" },
    { value: minutes, label: "M" },
    { value: seconds, label: "S" },
  ];

  return (
    <div className="flex items-center gap-1" dir="ltr" aria-label="Countdown">
      {cells.map((cell, i) => (
        <span key={cell.label} className="flex items-center gap-1">
          <span className="flex min-w-8 flex-col items-center rounded-lg bg-neutral-100 px-1.5 py-1 leading-none">
            <span className="text-sm font-bold tabular-nums text-neutral-900">
              {isReady ? String(cell.value).padStart(2, "0") : "--"}
            </span>
            <span className="mt-0.5 text-[9px] font-semibold text-neutral-400">
              {cell.label}
            </span>
          </span>
          {i < cells.length - 1 && (
            <span className="text-sm font-bold text-neutral-300">:</span>
          )}
        </span>
      ))}
    </div>
  );
}
