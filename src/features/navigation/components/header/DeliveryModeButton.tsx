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
  hideIcon = false,
  compact = false,
  onClick,
  disabled = false,
}: DeliveryModeButtonProps) {
  const locale = useLocale();
  const isRtl = locale === "ar";

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "relative flex shrink-0 items-center whitespace-nowrap font-bold duration-300 ease-in-out transition-all focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary/60 disabled:pointer-events-none disabled:opacity-[0.12]",
        compact
          ? "flex-row gap-1.5 rounded-full py-1.5 pl-1.5 pr-3 text-[11px] leading-4"
          : "flex-col rounded-lg py-2.5 text-xs leading-4 lg:flex-row md:border-2 md:text-lg md:leading-5",
        compact
          ? hideIcon
            ? "w-auto justify-center px-3"
            : "w-auto justify-center"
          : hideIcon
            ? "w-auto px-10 justify-center md:min-w-[168px] md:px-2.5 md:justify-center"
            : "min-w-[90px] w-auto px-2 justify-between md:min-w-[168px] md:px-3 lg:justify-start lg:pl-1",
        bgClass,
        borderClass,
        textClass,
      )}
    >
      <div className={cn(
        "relative shrink-0 overflow-hidden",
        compact ? "size-6" : "size-12 md:size-10",
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
        compact ? "text-center" : hideIcon ? "pl-0" : isRtl ? "lg:pr-3" : "lg:pl-2",
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
