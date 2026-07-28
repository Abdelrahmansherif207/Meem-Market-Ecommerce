import { cn } from "@/shared/utils/cn";
import type { BannerArrowsProps } from "../../types";

function ArrowIcon({
  direction,
  className,
  strokeWidth,
}: {
  direction: "left" | "right";
  className?: string;
  strokeWidth: number;
}) {
  const rotationClass = direction === "left" ? "rotate-180" : "";

  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className={cn("h-5 w-5 transition-transform", rotationClass, className)}
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
    >
      <path d="M8 4l8 8-8 8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function BannerArrows({
  onPrevious,
  onNext,
  className,
  buttonClassName,
  iconClassName,
  previousLabel = "Previous slide",
  nextLabel = "Next slide",
  isRtl = false,
  variant = "hero", // Defaults to your current hero look
  strokeWidth = 2.5,
}: BannerArrowsProps) {
  // 1. Structural positions based on LTR/RTL and variant types
  const isHero = variant === "hero";

  const previousPositionClass = isRtl
    ? isHero
      ? "right-3"
      : "right-0"
    : isHero
      ? "left-3"
      : "left-0";

  const nextPositionClass = isRtl
    ? isHero
      ? "left-3"
      : "left-0"
    : isHero
      ? "right-3"
      : "right-0";

  const previousDirection = isRtl ? "right" : "left";
  const nextDirection = isRtl ? "left" : "right";

  // 2. Base Variant Styles
  const variantButtonStyles = isHero
    ? "bg-black/35 text-white hover:bg-black/55 focus-visible:outline-white"
    : "bg-white text-slate-500 border border-slate-500";

  return (
    <div className={cn("pointer-events-none absolute inset-0 z-30 max-md:hidden", className)}>
      {/* PREVIOUS BUTTON */}
      <button
        type="button"
        onClick={onPrevious}
        aria-label={previousLabel}
        className={cn(
          "pointer-events-auto absolute top-1/2 -translate-y-1/2 rounded-full p-2.5 transition duration-200 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-0 disabled:pointer-events-none",
          previousPositionClass,
          variantButtonStyles,
          buttonClassName, // Lets you pass arbitrary classes on top
        )}
      >
        <ArrowIcon
          direction={previousDirection}
          className={iconClassName}
          strokeWidth={strokeWidth}
        />
      </button>

      {/* NEXT BUTTON */}
      <button
        type="button"
        onClick={onNext}
        aria-label={nextLabel}
        className={cn(
          "pointer-events-auto absolute top-1/2 -translate-y-1/2 rounded-full p-2.5 transition duration-200 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-0 disabled:pointer-events-none",
          nextPositionClass,
          variantButtonStyles,
          buttonClassName, // Lets you pass arbitrary classes on top
        )}
      >
        <ArrowIcon
          direction={nextDirection}
          className={iconClassName}
          strokeWidth={strokeWidth}
        />
      </button>
    </div>
  );
}
