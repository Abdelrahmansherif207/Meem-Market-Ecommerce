import SectionTitle from "@/components/ui/SectionTitle";
import { cn } from "@/shared/utils/cn";
import Slide from "../cardSlider/Slide";
import type { CardGridProps } from "../../types";

export default function CardGrid({
  title,
  items,
  className,
  gridClassName = "grid grid-cols-2 gap-3 md:grid-cols-4",
  cardClassName = "aspect-3/4",
  imageClassName,
  slideSizes,
}: CardGridProps) {
  return (
    <section className={cn("group relative w-full pb-4", className)}>
      {title ? <SectionTitle title={title} /> : null}
      <div className={gridClassName}>
        {items.map((slide, index) => (
          <Slide
            key={slide.id}
            slide={slide}
            hasBorder={false}
            aspectClassName={cardClassName}
            imageClassName={imageClassName}
            sizes={slideSizes ?? "(max-width: 768px) 50vw, 25vw"}
            priority={index < 2}
          />
        ))}
      </div>
    </section>
  );
}
