import { getTranslations } from "next-intl/server";

/**
 * Top announcement strip (Nice One pattern: site-wide promo line).
 * Scrolls away with the page; only the header below stays sticky.
 */
export default async function AnnouncementBar() {
  const t = await getTranslations("header.announcement");

  return (
    <div className="bg-secondary text-text-primary">
      <div className="container px-3 py-2 text-center text-xs font-medium tracking-wide">
        {t("message")}
      </div>
    </div>
  );
}
