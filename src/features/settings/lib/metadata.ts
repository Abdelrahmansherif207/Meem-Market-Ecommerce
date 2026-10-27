import type { Metadata } from "next";
import { getCachedSettings } from "../services/settingsService";
import {
  DEFAULT_FAVICON,
  DEFAULT_FOOTER_LOGO,
  DEFAULT_LOGO,
  DEFAULT_SITE_DESCRIPTION,
  DEFAULT_SITE_NAME,
} from "../constants";

// Re-exported so existing imports from `lib/metadata` keep working.
export { DEFAULT_FAVICON, DEFAULT_FOOTER_LOGO, DEFAULT_LOGO, DEFAULT_SITE_DESCRIPTION, DEFAULT_SITE_NAME };

export interface SiteMeta {
  siteName: string;
  description: string;
  favicon: string;
  logo: string | null;
}

export async function getSiteMeta(locale: string): Promise<SiteMeta> {
  const fallbackName = DEFAULT_SITE_NAME[locale] ?? DEFAULT_SITE_NAME.en;
  const fallbackDescription =
    DEFAULT_SITE_DESCRIPTION[locale] ?? DEFAULT_SITE_DESCRIPTION.en;

  const meta: SiteMeta = {
    siteName: fallbackName,
    description: fallbackDescription,
    favicon: DEFAULT_FAVICON,
    logo: DEFAULT_LOGO,
  };

  try {
    const settings = await getCachedSettings(locale);
    if (settings.site_name) meta.siteName = settings.site_name;
    if (settings.meta_desc) meta.description = settings.meta_desc;
    else if (settings.site_desc) meta.description = settings.site_desc;
    if (settings.favicon) meta.favicon = settings.favicon;
    if (settings.logo) meta.logo = settings.logo;
  } catch {
    // settings unavailable — keep locale-aware Rawd Al-Aseel defaults
  }

  return meta;
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

  const openGraphImages = images.filter(Boolean).map((url) => ({
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
      card: images.length > 0 ? "summary_large_image" : "summary",
      title: resolvedTitle,
      description: resolvedDescription,
      ...(images.length > 0 ? { images } : {}),
    },
  };
}
