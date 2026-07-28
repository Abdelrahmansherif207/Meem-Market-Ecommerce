import { cn } from "@/shared/utils/cn";
import type { BannerPaginationProps } from "../../types";

export default function BannerPagination({
  total,
  currentIndex,
  onSelect,
  className,
}: BannerPaginationProps) {
  if (total <= 1) {
    return null;
  }

  return (
    <div
      className={cn(
        "absolute bottom-3 left-1/2 z-20 flex -translate-x-1/2 items-center gap-2",
        className,
      )}
    >
      {Array.from({ length: total }, (_, index) => {
        const active = index === currentIndex;

        return (
          <button
            key={index}
            type="button"
            aria-label={`Go to banner ${index + 1}`}
            aria-current={active ? "true" : undefined}
            onClick={() => onSelect(index)}
            className={cn(
              "h-2.5 rounded-full transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white",
              active ? "w-6 bg-white" : "w-2.5 bg-white/60 hover:bg-white/85",
            )}
          />
        );
      })}
    </div>
  );
}
