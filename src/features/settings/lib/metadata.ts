import type { Metadata } from "next";
import { getCachedSettings } from "../services/settingsService";
import { DEFAULT_FAVICON, DEFAULT_LOGO } from "../constants";

// Backwards-compatible exports: several components import the defaults
// from this module. The canonical values now live in `../constants`.
export {
  DEFAULT_FAVICON,
  DEFAULT_FOOTER_LOGO,
  DEFAULT_LOGO,
  DEFAULT_SITE_COPYRIGHT,
  DEFAULT_SITE_DESCRIPTION,
  DEFAULT_SITE_NAME,
} from "../constants";

export interface SiteMeta {
  siteName: string;
  description: string;
  favicon: string;
  logo: string;
  footerLogo: string;
  copyright: string;
  siteEmail: string;
  supportEmail: string;
  phone: string;
}

/**
 * Resolved site identity for metadata, header/footer branding and auth
 * screens. Settings are already normalized over locale-aware defaults.
 */
export async function getSiteMeta(locale: string): Promise<SiteMeta> {
  const settings = await getCachedSettings(locale);

  return {
    siteName: settings.site_name,
    description: settings.meta_desc || settings.site_desc,
    favicon: settings.favicon || DEFAULT_FAVICON,
    logo: settings.logo || DEFAULT_LOGO,
    footerLogo: settings.footer_logo,
    copyright: settings.site_copy_right,
    siteEmail: settings.site_email,
    supportEmail: settings.email_support,
    phone: settings.phone,
  };
}

function getMetadataBase(): URL | undefined {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
  if (!siteUrl) return undefined;
  try {
    return new URL(siteUrl);
  } catch {
    return undefined;
  }
}

export interface BuildMetadataOptions {
  locale: string;
  title?: string;
  description?: string;
  images?: string[];
  pathname?: string;
  type?:
    | "website"
    | "article"
    | "book"
    | "profile"
    | "music.song"
    | "music.album"
    | "music.playlist"
    | "music.radio_station"
    | "video.movie"
    | "video.episode"
    | "video.tv_show"
    | "video.other";
}

export async function buildMetadata({
  locale,
  title,
  description,
  images = [],
  pathname,
  type = "website",
}: BuildMetadataOptions): Promise<Metadata> {
  const site = await getSiteMeta(locale);

  const resolvedTitle = title ? `${title} | ${site.siteName}` : site.siteName;
  const resolvedDescription = description || site.description;

  const suppliedImages = images.filter(Boolean);
  const fallbackImage = site.logo || site.footerLogo;
  const socialImages =
    suppliedImages.length > 0
      ? suppliedImages
      : fallbackImage
        ? [fallbackImage]
        : [];

  const openGraphImages = socialImages.map((url) => ({
    url,
    width: 800,
    height: 800,
    alt: resolvedTitle,
  }));

  return {
    metadataBase: getMetadataBase(),
    title: resolvedTitle,
    description: resolvedDescription,
    icons: { icon: site.favicon },
    alternates: pathname ? { canonical: pathname } : undefined,
    openGraph: {
      title: resolvedTitle,
      description: resolvedDescription,
      siteName: site.siteName,
      type,
      ...(openGraphImages.length > 0 ? { images: openGraphImages } : {}),
    },
    twitter: {
      card: suppliedImages.length > 0 ? "summary_large_image" : "summary",
      title: resolvedTitle,
      description: resolvedDescription,
      ...(socialImages.length > 0 ? { images: socialImages } : {}),
    },
  };
}
