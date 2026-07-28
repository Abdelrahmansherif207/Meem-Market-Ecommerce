import { Link } from "@/i18n/navigation";
import { cn } from "@/shared/utils/cn";
import { getImageProps } from "next/image";
import type { CardSlideItem } from "../../types";

interface SlideProps {
  slide: CardSlideItem;
  hasBorder?: boolean;
  aspectClassName?: string;
  imageClassName?: string;
  sizes?: string;
  priority?: boolean;
}
export default function Slide({
  slide,
  hasBorder = true,
  aspectClassName = "aspect-3/4",
  imageClassName,
  sizes = "(max-width: 480px) 75vw, (max-width: 768px) 45vw, (max-width: 1024px) 30vw, 20vw",
  priority = false,
}: SlideProps) {
  const commonImageProps = {
    alt: slide.title,
    fill: true,
    sizes,
    priority,
    className: cn("rounded-xl object-cover", hasBorder && "p-1", imageClassName),
  };

  const {
    props: { srcSet: desktopSrcSet },
  } = getImageProps({
    ...commonImageProps,
    src: slide.image?.desktop || "",
  });

  const { props: mobileImageProps } = getImageProps({
    ...commonImageProps,
    src: slide.image?.mobile || slide.image?.desktop || "",
  });

  const picture = (
    <picture className="block h-full w-full">
      <source media="(min-width: 640px)" srcSet={desktopSrcSet} />
      <img {...mobileImageProps} alt={slide.title} />
    </picture>
  );

  return (
    <div
      className={cn(
        "relative w-full overflow-hidden rounded-xl transition-shadow duration-300 hover:shadow-lg",
        aspectClassName,
        hasBorder && "border-2",
        hasBorder && (slide.borderColor || "border-primary-dark"),
      )}
    >
      {slide.href ? (
        <Link href={slide.href} className="block h-full w-full">
          {picture}
        </Link>
      ) : (
        picture
      )}
    </div>
  );
}

export type { CardSlideItem } from "../../types";
