import { getArtDirectedImageSources } from "@/shared/lib/artDirectedImage";
import { cn } from "@/shared/utils/cn";

interface CampaignImageProps {
  desktop: string;
  mobile?: string;
  alt: string;
  width: number;
  height: number;
  mobileWidth?: number;
  mobileHeight?: number;
  sizes?: string;
  priority?: boolean;
  /** Fill a positioned parent (ratio well) instead of flowing at intrinsic size. */
  fill?: boolean;
  className?: string;
}

/**
 * Art-directed CMS campaign image.
 *
 * Renders a real `<picture>` so mobile and desktop creatives can differ,
 * keeps the intrinsic width/height ratio (no forced cropping) and falls back
 * to the raw URL when Next image optimization is disabled.
 */
export function CampaignImage({
  desktop,
  mobile,
  alt,
  width,
  height,
  mobileWidth,
  mobileHeight,
  sizes,
  priority = false,
  fill = false,
  className,
}: CampaignImageProps) {
  const sources = getArtDirectedImageSources({
    desktop,
    mobile,
    alt,
    width,
    height,
    mobileWidth,
    mobileHeight,
    sizes,
    priority,
  });

  const mobileSource =
    mobile && mobile !== desktop ? sources.mobile : null;

  return (
    <picture>
      {mobileSource ? (
        <source
          media="(max-width: 767px)"
          srcSet={mobileSource.srcSet ?? mobileSource.src}
        />
      ) : null}
      <img
        src={sources.desktop.src}
        srcSet={sources.desktop.srcSet}
        alt={alt}
        width={width}
        height={height}
        sizes={sizes}
        loading={priority ? "eager" : "lazy"}
        fetchPriority={priority ? "high" : undefined}
        decoding="async"
        className={cn(
          fill
            ? "absolute inset-0 h-full w-full object-contain"
            : "block",
          className,
        )}
      />
    </picture>
  );
}
