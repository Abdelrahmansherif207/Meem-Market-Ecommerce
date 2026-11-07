import { getTranslations } from "next-intl/server";

/**
 * Berry top announcement strip (warm paper frame): deep berry with ivory
 * text, matching the footer bookend. Static copy (no API).
 */
export default async function CatchAnnouncementBar() {
  const t = await getTranslations("catchHeader");

  return (
    <aside className="bg-catch-berry-deep py-2 text-center text-xs font-bold tracking-wider text-catch-ivory">
      {t("announcement")}
    </aside>
  );
}
