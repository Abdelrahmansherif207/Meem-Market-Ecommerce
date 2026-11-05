"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Minus, Plus, Trash2 } from "lucide-react";
import { cn } from "@/shared/utils/cn";

interface QuantityStepperProps {
  value: number;
  onIncrement: () => void;
  onDecrement: () => void;
  /** When value is 1, the decrement button becomes a remove (trash) action. */
  decrementAsRemove?: boolean;
  incrementDisabled?: boolean;
  disabled?: boolean;
  min?: number;
  max?: number;
  /** "pill" = card-overlay stepper; "outline" = bordered control for forms/summary rows. */
  variant?: "pill" | "outline";
  size?: "sm" | "md";
  incrementLabel?: string;
  decrementLabel?: string;
  removeLabel?: string;
  className?: string;
  /** Pill variant: pin the full stepper (disables the collapse-to-count behavior). */
  alwaysExpanded?: boolean;
}

/** How long the expanded pill stays open after the pointer leaves (ms). */
const COLLAPSE_DELAY_MS = 3000;

/**
 * Single canonical quantity stepper used by cards, PDP actions, and cart rows.
 *
 * Nice One behavior (shared across the site, matching the niceonesa.com DOM):
 * - `pill` variant rests as a compact count — `text-base font-medium`,
 *   ink `#372e4c`, no background.
 * - Hovering/tapping/focusing the count expands the full stepper on a light
 *   `#f2f2f2` pill (trash | count | plus — dark ink, no red).
 * - 3s after the pointer leaves, it collapses back to the plain count
 *   (re-entering cancels the timer; stays open while the API call is
 *   pending so controls never disappear mid-mutation).
 * - All interactive targets are at least 44px (sm variant 36px inside
 *   dense cards), matching the previous stepper sizing.
 */
export function QuantityStepper({
  value,
  onIncrement,
  onDecrement,
  decrementAsRemove = false,
  incrementDisabled = false,
  disabled = false,
  min = 1,
  max,
  variant = "outline",
  size = "md",
  incrementLabel = "Increase quantity",
  decrementLabel = "Decrease quantity",
  removeLabel = "Remove item",
  className,
  alwaysExpanded = false,
}: QuantityStepperProps) {
  const pill = variant === "pill";
  const [expanded, setExpanded] = useState(pill && alwaysExpanded);
  const closeTimerRef = useRef<number | null>(null);
  const cancelClose = useCallback(() => {
    if (closeTimerRef.current !== null) {
      window.clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
  }, []);
  const openNow = useCallback(() => {
    cancelClose();
    setExpanded(true);
  }, [cancelClose]);
  const scheduleClose = useCallback(() => {
    if (disabled) return; // never collapse mid-mutation / while disabled
    cancelClose();
    closeTimerRef.current = window.setTimeout(() => {
      closeTimerRef.current = null;
      setExpanded(false);
    }, COLLAPSE_DELAY_MS);
  }, [cancelClose, disabled]);

  // Cleanup the timer on unmount, and keep the pill open while disabled.
  useEffect(() => cancelClose, [cancelClose]);
  useEffect(() => {
    if (disabled) cancelClose();
  }, [disabled, cancelClose]);

  const btnBase = cn(
    "flex shrink-0 items-center justify-center rounded-full transition-colors duration-200 disabled:cursor-not-allowed disabled:opacity-40",
    size === "sm"
      ? pill
        ? "h-9 w-9 sm:h-8 sm:w-8"
        : "h-10 w-10"
      : "h-11 w-11",
    pill ? "text-qty-ink hover:bg-ink/10" : "hover:bg-surface",
  );

  /* ── outline variant (cart rows, forms) — unchanged ──────────────────── */
  if (!pill) {
    return (
      <div
        className={cn(
          "inline-flex items-center gap-0.5 rounded-lg border border-border bg-white",
          disabled && "pointer-events-none opacity-70",
          className,
        )}
      >
        <button
          type="button"
          onClick={onDecrement}
          disabled={disabled || value <= min}
          className={btnBase}
          aria-label={decrementAsRemove && value === 1 ? removeLabel : decrementLabel}
        >
          {decrementAsRemove && value === 1 ? <Trash2 className="size-4" /> : <Minus className="size-4" />}
        </button>

        <span
          className={cn("min-w-6 text-center font-bold tabular-nums", size === "sm" ? "text-sm" : "text-base")}
          aria-live="polite"
        >
          {value}
        </span>

        <button
          type="button"
          onClick={onIncrement}
          disabled={disabled || incrementDisabled || (max !== undefined && value >= max)}
          className={cn(btnBase, incrementDisabled && "cursor-not-allowed opacity-40")}
          aria-label={incrementLabel}
        >
          <Plus className="size-4" />
        </button>
      </div>
    );
  }

  /* ── pill variant (cards / PDP overlay): count → hover expands ────────── */
  const showFullPill = alwaysExpanded || expanded;

  return (
    <div
      className={cn("inline-flex items-center", disabled && "pointer-events-none opacity-70", className)}
      onMouseEnter={openNow}
      onMouseLeave={scheduleClose}
      onFocus={(e) => {
        if (e.currentTarget.contains(e.relatedTarget as Node)) return;
        openNow();
      }}
      onBlur={(e) => {
        if (e.currentTarget.contains(e.relatedTarget as Node)) return;
        scheduleClose();
      }}
    >
      {showFullPill ? (
        <div className="inline-flex items-center gap-1 rounded-full bg-qty-surface px-1 shadow-elev-1">
          <button
            type="button"
            onClick={onDecrement}
            // Trash must stay clickable at 1 — it removes the item.
            disabled={disabled || (value <= min && !decrementAsRemove)}
            className={btnBase}
            aria-label={decrementAsRemove && value === 1 ? removeLabel : decrementLabel}
          >
            {decrementAsRemove && value === 1 ? <Trash2 className="size-4" /> : <Minus className="size-4" />}
          </button>

          <span
            className={cn(
              "min-w-6 text-center font-medium tabular-nums text-qty-ink",
              size === "sm" ? "text-sm" : "text-base",
            )}
            aria-live="polite"
          >
            {value}
          </span>

          <button
            type="button"
            onClick={onIncrement}
            disabled={disabled || incrementDisabled || (max !== undefined && value >= max)}
            className={cn(btnBase, incrementDisabled && "cursor-not-allowed opacity-40")}
            aria-label={incrementLabel}
          >
            <Plus className="size-4" />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={openNow}
          aria-label={String(value)}
          aria-expanded={false}
          className={cn(
            "flex items-center justify-center rounded-full px-2.5 text-base font-medium tabular-nums text-qty-ink",
            size === "sm" ? "h-9 sm:h-8" : "h-11",
          )}
        >
          {value}
        </button>
      )}
    </div>
  );
}
