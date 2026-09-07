"use client";

import Image from "next/image";
import type { ReactNode } from "react";
import { cn } from "@/shared/utils/cn";

export type DeliveryModeButtonProps = {
  label: string;
  icon: {
    src: string;
    alt: string;
  };
  bgClass: string;
  borderClass: string;
  textClass?: string;
  etaText?: ReactNode;
  note?: string;
  /** Compact scrolled state: smaller height + icon, sub-text hidden. */
  small?: boolean;
  compact?: boolean;
  onClick?: () => void;
  disabled?: boolean;
};

export function DeliveryModeButton({
  label,
  icon,
  bgClass,
  borderClass,
  textClass,
  etaText,
  note,
  small = false,
  compact = false,
  onClick,
  disabled = false,
}: DeliveryModeButtonProps) {
  const selected = textClass?.includes("text-white") ?? false;

  if (compact) {
    return (
      <button
        type="button"
        onClick={onClick}
        disabled={disabled}
        aria-pressed={selected}
        className={cn(
          "relative flex min-w-0 flex-1 select-none items-center justify-center gap-1 rounded-lg border border-transparent px-2 py-1 text-center transition-all duration-200 ease-out active:scale-[0.97]",
          "min-h-[34px] disabled:cursor-not-allowed disabled:opacity-60 disabled:saturate-50 disabled:active:scale-100",
          !disabled && "hover:brightness-[1.04]",
          bgClass,
          borderClass,
          textClass,
        )}
      >
        <span className="relative block size-8 shrink-0 drop-shadow-sm">
          <Image
            src={icon.src}
            alt={icon.alt}
            fill
            sizes="32px"
            className="object-contain"
          />
        </span>

        <span className="min-w-0 truncate text-[13px] leading-4 font-medium tracking-tight">
          {label}
        </span>

        {disabled && note ? (
          <span className="shrink-0 rounded-md bg-text-muted/15 px-1 py-px text-[10px] leading-3 font-medium text-text-secondary">
            {note}
          </span>
        ) : etaText ? (
          <span
            className={cn(
              "shrink-0 rounded-md px-1 py-px text-[10px] leading-3 font-medium tabular-nums",
              selected ? "bg-white/25 text-white" : "bg-black/[0.06] text-text-secondary",
            )}
          >
            {etaText}
          </span>
        ) : null}
      </button>
    );
  }

  const subText = disabled && note ? note : etaText;

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-pressed={selected}
      className={cn(
        "group relative inline-flex shrink-0 select-none items-center gap-1.5 rounded-lg border border-black/[0.08] font-medium whitespace-nowrap transition-all duration-200 ease-out active:scale-[0.98]",
        small ? "h-8 pr-3 pl-1" : "h-10 pr-2.5 pl-1 md:h-11 md:pr-3 md:pl-1.5",
        "shadow-elev-1 disabled:cursor-not-allowed disabled:opacity-60 disabled:saturate-50 disabled:active:scale-100",
        !disabled && "hover:-translate-y-px hover:shadow-elev-2",
        bgClass,
        borderClass,
        textClass,
      )}
    >
      <span className={cn("relative block shrink-0 drop-shadow-sm", small ? "size-6" : "size-9 md:size-10")}>
        <Image
          src={icon.src}
          alt={icon.alt}
          fill
          sizes={small ? "24px" : "40px"}
          className="object-contain"
        />
      </span>

      <span className="flex min-w-0 flex-col items-start text-start leading-none">
        <span
          className={cn(
            "max-w-[220px] truncate tracking-tight",
            small ? "text-[13px] leading-5 font-medium" : "text-sm leading-5 font-medium md:text-[15px]",
          )}
        >
          {label}
        </span>
        {subText && !small ? (
          <span
            className={cn(
              "max-w-[220px] truncate text-[11px] leading-4 font-normal tabular-nums",
              selected ? "text-white/85" : "text-text-secondary",
            )}
          >
            {subText}
          </span>
        ) : null}
      </span>
    </button>
  );
}
