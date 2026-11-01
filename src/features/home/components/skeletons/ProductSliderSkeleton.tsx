import Skeleton from "@/components/ui/Skeleton";
import type { SectionFrontSetting } from "../../types";

/**
 * Card width per responsive breakpoint (matches Swiper breakpoints in
 * ProductSlider): 2 cols base, 3 at 480px, 4 at 768px, N at 1024px.
 * Full literal class strings are required for the Tailwind scanner.
 */
export const PRODUCT_SLIDER_ROW_WIDTH_CLASSES: Record<number, string> = {
  1: "w-full",
  2: "w-[calc((100%-8px)/2)]",
  3: "w-[calc((100%-8px)/2)] min-[480px]:w-[calc((100%-16px)/3)] md:w-[calc((100%-16px)/3)] lg:w-[calc((100%-16px)/3)]",
  4: "w-[calc((100%-8px)/2)] min-[480px]:w-[calc((100%-16px)/3)] md:w-[calc((100%-24px)/4)] lg:w-[calc((100%-24px)/4)]",
  5: "w-[calc((100%-8px)/2)] min-[480px]:w-[calc((100%-16px)/3)] md:w-[calc((100%-24px)/4)] lg:w-[calc((100%-32px)/5)]",
  6: "w-[calc((100%-8px)/2)] min-[480px]:w-[calc((100%-16px)/3)] md:w-[calc((100%-24px)/4)] lg:w-[calc((100%-40px)/6)]",
  7: "w-[calc((100%-8px)/2)] min-[480px]:w-[calc((100%-16px)/3)] md:w-[calc((100%-24px)/4)] lg:w-[calc((100%-48px)/7)]",
  8: "w-[calc((100%-8px)/2)] min-[480px]:w-[calc((100%-16px)/3)] md:w-[calc((100%-24px)/4)] lg:w-[calc((100%-56px)/8)]",
};

/** Default (8-column large-screen) card widths kept for legacy consumers. */
export const PRODUCT_SLIDER_CARD_WIDTHS = PRODUCT_SLIDER_ROW_WIDTH_CLASSES[8];

function rowColumns(setting?: SectionFrontSetting) {
  return Math.max(1, Math.min(8, Math.round(setting?.columns_count ?? 8)));
}

export function ProductSliderRowSkeleton({ setting }: { setting?: SectionFrontSetting }) {
  const cols = rowColumns(setting);
  const widths = PRODUCT_SLIDER_ROW_WIDTH_CLASSES[cols] ?? PRODUCT_SLIDER_ROW_WIDTH_CLASSES[8];

  return (
    <div className="flex gap-2 overflow-hidden px-6 sm:px-10 lg:px-12">
      {Array.from({ length: cols }).map((_, i) => (
        <div key={i} className={`${widths} flex-shrink-0`}>
          <Skeleton className="w-full aspect-square rounded-xl mb-2" />
          <div className="space-y-1.5 px-0.5">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
          <Skeleton className="h-5 w-16 mt-1.5 px-0.5" />
        </div>
      ))}
    </div>
  );
}

export default function ProductSliderSkeleton({ setting }: { setting?: SectionFrontSetting }) {
  return (
    <div className="group relative w-full overflow-hidden pb-4" aria-label="Loading products">
      <div className="px-6 sm:px-10 lg:px-12 mb-4">
        <Skeleton className="h-5 w-48" />
      </div>
      <ProductSliderRowSkeleton setting={setting} />
    </div>
  );
}
