"use client";

import Image from "next/image";
import { useLocale } from "next-intl";
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
  note?: string;
  hideIcon?: boolean;
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
  hideIcon = false,
  compact = false,
  onClick,
  disabled = false,
}: DeliveryModeButtonProps) {
  const locale = useLocale();
  const isRtl = locale === "ar";

  if (compact) {
    return (
      <button
        type="button"
        onClick={onClick}
        disabled={disabled}
        className={cn(
          "relative flex min-w-0 flex-1 items-center justify-center gap-1.5 overflow-hidden rounded-lg px-2 py-1 text-center transition-all duration-200 ease-out",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60",
          "disabled:cursor-not-allowed",
          disabled && "border border-dashed border-text-muted/40 opacity-70 saturate-[0.6] hover:opacity-70",
          bgClass,
          borderClass,
          textClass,
        )}
      >
        <div
          className={cn(
            "relative size-6 shrink-0 overflow-hidden drop-shadow-sm",
            hideIcon && "hidden",
          )}
        >
          <Image
            src={icon.src}
            alt={icon.alt}
            fill
            className="object-contain"
          />
        </div>

        <span className="min-w-0 flex-1 overflow-hidden text-ellipsis text-center text-[12px] leading-4 font-bold">
          {label}
        </span>

        {disabled && note ? (
          <span className="shrink-0 rounded-full border border-text-muted/50 px-1.5 py-0.5 text-[10px] leading-3 font-bold text-text-muted">
            {note}
          </span>
        ) : etaText && !hideIcon ? (
          <span
            className={cn(
              "shrink-0 rounded-full px-1.5 py-0.5 text-[10px] leading-3 font-bold",
              textClass?.includes("text-white") ? "bg-white/25 text-white" : "bg-primary/10 text-primary",
            )}
          >
            {etaText}
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
      className={cn(
        "relative flex shrink-0 items-center whitespace-nowrap font-bold duration-300 ease-in-out transition-all focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary/60 disabled:pointer-events-none disabled:opacity-[0.12]",
        "flex-col rounded-lg py-2.5 text-xs leading-4 lg:flex-row md:border-2 md:text-lg md:leading-5",
        hideIcon
          ? "w-auto px-10 justify-center md:min-w-[168px] md:px-2.5 md:justify-center"
          : "min-w-[90px] w-auto px-2 justify-between md:min-w-[168px] md:px-3 lg:justify-start lg:pl-1",
        bgClass,
        borderClass,
        textClass,
      )}
    >
      <div className={cn(
        "relative shrink-0 overflow-hidden",
        !compact && "size-12 md:size-10",
        hideIcon && "hidden",
      )}>
        <Image
          src={icon.src}
          alt={icon.alt}
          fill
          className="object-contain"
        />
      </div>

      <span className={cn(
        "overflow-hidden text-ellipsis text-center lg:text-start",
        hideIcon ? "pl-0" : isRtl ? "lg:pr-3" : "lg:pl-2",
      )}>
        {label}
      </span>

      {etaText ? (
        <span className={cn(
          "absolute inset-x-0 mx-auto -top-1 w-max max-w-[calc(100%-12px)] truncate rounded-br-lg rounded-tl-lg bg-white px-1 text-xs italic font-bold text-[#14569D] shadow-sm",
          hideIcon && "hidden",
        )}>
          {etaText}
        </span>
      ) : null}
    </button>
  );
}
