import type { MetadataRoute } from "next";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/auth", "/profile", "/cart", "/checkout", "/payment", "/api"],
      },
    ],
    ...(siteUrl ? { sitemap: `${siteUrl.replace(/\/$/, "")}/sitemap.xml` } : {}),
  };
}
