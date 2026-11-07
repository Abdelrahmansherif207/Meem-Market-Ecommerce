import { getImageProps } from "next/image";

export interface ArtDirectedImageSource {
  src: string;
  srcSet?: string;
}

interface GetArtDirectedImageSourcesArgs {
  desktop: string;
  mobile?: string;
  alt: string;
  width: number;
  height: number;
  mobileWidth?: number;
  mobileHeight?: number;
  sizes?: string;
  priority?: boolean;
}

/**
 * Resolve `<picture>` sources for CMS campaign artwork.
 *
 * `next.config.ts` uses `images.unoptimized: true`, so `getImageProps`
 * intentionally returns `srcSet: undefined`. The helper keeps Next's
 * resolved `src` and falls back to the raw URL when no srcSet is produced,
 * which lets `CampaignImage` stay a plain, layout-stable `<picture>`.
 */
export function getArtDirectedImageSources({
  desktop,
  mobile,
  alt,
  width,
  height,
  mobileWidth,
  mobileHeight,
  sizes,
  priority,
}: GetArtDirectedImageSourcesArgs): {
  desktop: ArtDirectedImageSource;
  mobile: ArtDirectedImageSource | null;
} {
  return {
    desktop: resolveSource({
      src: desktop,
      alt,
      width,
      height,
      sizes,
      priority,
    }),
    mobile: mobile
      ? resolveSource({
          src: mobile,
          alt,
          width: mobileWidth ?? width,
          height: mobileHeight ?? height,
          sizes,
          priority,
        })
      : null,
  };
}

function resolveSource({
  src,
  alt,
  width,
  height,
  sizes,
  priority,
}: {
  src: string;
  alt: string;
  width: number;
  height: number;
  sizes?: string;
  priority?: boolean;
}): ArtDirectedImageSource {
  try {
    const props = getImageProps({
      src,
      alt,
      width,
      height,
      sizes,
      priority,
    }).props;

    return {
      src: props.src || src,
      srcSet: props.srcSet || undefined,
    };
  } catch {
    return { src };
  }
}
