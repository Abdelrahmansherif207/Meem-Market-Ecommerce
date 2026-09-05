"use client";

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
  /** "pill" = filled primary pill (card overlay look); "outline" = bordered control for forms/summary rows. */
  variant?: "pill" | "outline";
  size?: "sm" | "md";
  incrementLabel?: string;
  decrementLabel?: string;
  removeLabel?: string;
  className?: string;
}

/**
 * Single canonical quantity stepper used by cards, PDP actions, and cart rows.
 * All interactive targets are at least 44px (sm variant 40px inside dense cards).
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
}: QuantityStepperProps) {
  const pill = variant === "pill";
  const btnBase = cn(
    "flex shrink-0 items-center justify-center rounded-full transition-colors duration-200 disabled:cursor-not-allowed disabled:opacity-40",
    size === "sm"
      ? pill
        ? "h-9 w-9 sm:h-8 sm:w-8"
        : "h-10 w-10"
      : "h-11 w-11",
    pill ? "hover:bg-white/20" : "hover:bg-surface",
  );

  return (
    <div
      className={cn(
        "inline-flex items-center",
        pill
          ? "gap-1 rounded-full bg-primary px-1 text-white shadow-elev-2"
          : "gap-0.5 rounded-lg border border-border bg-white",
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
        {decrementAsRemove && value === 1 ? (
          <Trash2 className={size === "sm" ? "h-4 w-4" : "h-4 w-4"} />
        ) : (
          <Minus className="h-4 w-4" />
        )}
      </button>

      <span
        className={cn(
          "min-w-6 text-center font-bold tabular-nums",
          size === "sm" ? "text-sm" : "text-base",
          pill ? "text-white" : "text-text-primary",
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
        <Plus className="h-4 w-4" />
      </button>
    </div>
  );
}
