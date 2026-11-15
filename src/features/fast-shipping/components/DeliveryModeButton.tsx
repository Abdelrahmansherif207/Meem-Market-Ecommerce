"use client";

import Image from "next/image";
import type { ReactNode } from "react";
import { cn } from "@/shared/utils/cn";

export type DeliveryModeTone = "primary" | "accent";

export type DeliveryModeButtonProps = {
  label: string;
  icon: {
    src: string;
    alt: string;
  };
  /** Brand tone: scheduled = Meem blue, NOW = Meem gold. */
  tone?: DeliveryModeTone;
  selected?: boolean;
  /** Fast channel only: fee/ETA badge. */
  etaText?: ReactNode;
  /** Fast channel only: shown instead of the ETA when unavailable. */
  note?: string;
  compact?: boolean;
  onClick?: () => void;
  disabled?: boolean;
};

/**
 * One segment of the delivery-mode toggle. Purely presentational: the parent
 * decides selected/disabled state and the Meem tone.
 */
export function DeliveryModeButton({
  label,
  icon,
  tone = "primary",
  selected = false,
  etaText,
  note,
  compact = false,
  onClick,
  disabled = false,
}: DeliveryModeButtonProps) {
  const subText = disabled && note ? note : etaText;
  const accent = tone === "accent";

  const selectedClasses = accent
    ? "bg-accent text-white shadow-sm ring-1 ring-accent"
    : "bg-meem-primary text-white shadow-sm ring-1 ring-meem-primary";
  const idleClasses = accent
    ? "text-accent hover:bg-accent/5"
    : "text-meem-primary hover:bg-meem-primary/5";

  if (compact) {
    return (
      <button
        type="button"
        onClick={onClick}
        disabled={disabled}
        aria-pressed={selected}
        className={cn(
          "relative flex min-h-[34px] min-w-0 flex-1 select-none items-center justify-center gap-1.5 rounded-lg border border-transparent px-2 py-1 text-center transition-all duration-200 ease-out active:scale-[0.97]",
          "disabled:cursor-not-allowed disabled:opacity-60 disabled:saturate-50 disabled:active:scale-100",
          selected ? selectedClasses : idleClasses,
        )}
      >
        <span className="relative block size-6 shrink-0 drop-shadow-sm">
          <Image
            src={icon.src}
            alt={icon.alt}
            fill
            sizes="24px"
            className="object-contain"
          />
        </span>

        <span className="min-w-0 truncate text-[13px] leading-4 font-semibold tracking-tight">
          {label}
        </span>

        {subText ? (
          <span
            className={cn(
              "shrink-0 rounded-md px-1 py-px text-[10px] leading-3 font-medium tabular-nums",
              selected
                ? "bg-white/25 text-white"
                : accent
                  ? "bg-accent/10 text-accent"
                  : "bg-meem-primary/10 text-meem-primary",
            )}
          >
            {subText}
          </span>
        ) : null}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-pressed={selected}
      className={cn(
        "group relative inline-flex h-10 min-w-[158px] shrink-0 select-none items-center gap-2 rounded-lg border px-2 py-1 font-medium whitespace-nowrap transition-all duration-200 ease-out",
        "disabled:cursor-not-allowed disabled:opacity-60 disabled:saturate-50",
        selected
          ? cn("border-transparent", selectedClasses)
          : cn(
              "border-meem-border bg-white",
              accent
                ? "hover:border-accent/40 hover:bg-accent/5"
                : "hover:border-meem-sky hover:bg-meem-tint",
            ),
      )}
    >
      <span className="relative block size-7 shrink-0 drop-shadow-sm">
        <Image
          src={icon.src}
          alt={icon.alt}
          fill
          sizes="28px"
          className="object-contain"
        />
      </span>

      <span className="flex min-w-0 flex-col items-start text-start leading-none">
        <span className="text-[13px] leading-5 font-semibold tracking-tight">
          {label}
        </span>
        {subText ? (
          <span
            className={cn(
              "max-w-[190px] truncate text-[10px] leading-4 font-normal tabular-nums",
              selected
                ? "text-white/85"
                : accent
                  ? "text-meem-muted"
                  : "text-meem-muted",
            )}
          >
            {subText}
          </span>
        ) : null}
      </span>
    </button>
  );
}
