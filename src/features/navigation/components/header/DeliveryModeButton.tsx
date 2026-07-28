"use client";

import Image from "next/image";
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
  etaText?: string;
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
  onClick,
  disabled = false,
}: DeliveryModeButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "relative flex w-full flex-col items-center justify-center gap-1 rounded-md border-2 px-2 py-2 text-center text-xs font-bold leading-tight shadow-sm transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:ring-offset-2 focus-visible:ring-offset-background sm:w-auto sm:flex-row sm:gap-2 sm:px-3 sm:py-1.5 sm:text-left sm:text-sm",
        bgClass,
        borderClass,
        textClass,
        disabled && "cursor-not-allowed opacity-50",
        !disabled && onClick && "cursor-pointer hover:opacity-90",
      )}
    >
      <Image
        src={icon.src}
        alt={icon.alt}
        width={50}
        height={50}
        className="h-8 w-8 object-contain sm:h-10 sm:w-10"
      />

      <span className="truncate max-w-full">{label}</span>

      {etaText ? (
        <span className="absolute -top-3 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-sm bg-white px-2 py-0.5 text-[11px] font-bold text-[#14569D] shadow-sm">
          {etaText}
        </span>
      ) : null}
    </button>
  );
}
