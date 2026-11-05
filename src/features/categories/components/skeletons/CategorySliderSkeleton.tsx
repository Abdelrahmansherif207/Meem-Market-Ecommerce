import Skeleton from "@/components/ui/Skeleton";

/** Matches the Nice One chip strip — pill placeholders with varied widths. */
export function CategorySliderSkeleton() {
  // Fixed arbitrary widths (Skeleton accepts className only).
  const widths = [
    "w-[128px]",
    "w-[164px]",
    "w-[96px]",
    "w-[148px]",
    "w-[112px]",
    "w-[140px]",
    "w-[128px]",
    "w-[108px]",
    "w-[156px]",
    "w-[132px]",
  ];

  return (
    <div className="relative w-full py-1" aria-label="Loading categories">
      <div className="flex gap-2 overflow-hidden">
        {widths.map((w, i) => (
          <Skeleton key={i} className={`h-9 shrink-0 whitespace-nowrap rounded-full ${w}`} />
        ))}
      </div>
    </div>
  );
}
