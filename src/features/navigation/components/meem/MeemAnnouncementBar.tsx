import { getTranslations } from "next-intl/server";

/**
 * Meem top announcement strip: deep Meem blue with cool ivory text,
 * matching the footer bookend. Static copy (no API).
 */
export default async function MeemAnnouncementBar() {
  const t = await getTranslations("meemHeader");

  return (
    <aside className="bg-meem-deepest py-2 text-center text-xs font-bold tracking-wider text-meem-ivory">
      {t("announcement")}
    </aside>
  );
}
