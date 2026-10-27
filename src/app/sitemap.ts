import type { MetadataRoute } from "next";
import { routing } from "@/i18n/routing";
import { getAllInfoPageSlugs } from "@/features/info/content/pageContent";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;

const STATIC_PATHS = ["", "categories", "brands", "tags", "contact", "faq"];

export default function sitemap(): MetadataRoute.Sitemap {
  if (!siteUrl) return [];

  const base = siteUrl.replace(/\/$/, "");
  const locales = routing.locales;
  const now = new Date();

  const infoPaths = getAllInfoPageSlugs().map((slug) => `info/${slug}`);
  const paths = [...STATIC_PATHS, ...infoPaths];

  const urlFor = (locale: string, path: string) =>
    `${base}/${locale}/${path}`.replace(/\/$/, "");

  return paths.map((path) => ({
    url: urlFor("en", path),
    lastModified: now,
    changeFrequency: "weekly",
    priority: path === "" ? 1 : path.startsWith("info/") ? 0.6 : 0.7,
    alternates: {
      languages: Object.fromEntries(
        locales.map((locale) => [locale, urlFor(locale, path)]),
      ),
    },
  }));
}
