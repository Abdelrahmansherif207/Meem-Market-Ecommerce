import { getTranslations } from "next-intl/server";

/**
 * Black top announcement strip — screen: `bg-black text-white text-xs
 * font-bold py-2 text-center tracking-wider`. Static copy (no API).
 */
export default async function CatchAnnouncementBar() {
  const t = await getTranslations("catchHeader");

  return (
    <aside className="bg-black py-2 text-center text-xs font-bold tracking-wider text-white">
      {t("announcement")}
    </aside>
  );
}
