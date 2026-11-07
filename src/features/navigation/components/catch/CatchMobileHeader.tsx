import { getLocale, getTranslations } from "next-intl/server";
import { categoryMenuService } from "@/features/categories/services/categoryMenuService";
import type { CategoryMenuItem } from "@/features/categories/types";
import CatchAnnouncementBar from "./CatchAnnouncementBar";
import CatchMobileLogoLockup from "./CatchMobileLogoLockup";
import CatchMobileSearchBar from "./CatchMobileSearchBar";
import CatchMobileNavRow from "./CatchMobileNavRow";

interface CatchMobileHeaderProps {
  settingsLogo?: string | null;
}

/**
 * Mobile header: berry announcement strip, then a compact logo + search row
 * and the action row (Categories pill + language/profile/bell/cart icons).
 * The categories pill opens the Nice One-style mega panel; primary
 * navigation stays in the bottom bar. The compact fixed header on scroll
 * lives in CatchStickyHeader.
 */
export default async function CatchMobileHeader({
  settingsLogo,
}: CatchMobileHeaderProps) {
  const t = await getTranslations("catchHeader");
  const locale = await getLocale();

  let categories: CategoryMenuItem[] = [];
  try {
    categories = await categoryMenuService.getMenu(locale);
  } catch (e) {
    console.error("[CatchMobileHeader] Failed to fetch category menu", e);
  }

  return (
    <header className="relative z-40 border-b border-catch-border bg-catch-ivory lg:hidden">
      <CatchAnnouncementBar />
      <CatchMobileSearchBar
        placeholder={t("searchPlaceholder")}
        leading={<CatchMobileLogoLockup src={settingsLogo} />}
      />
      <CatchMobileNavRow categoriesLabel={t("categories")} categories={categories} />
    </header>
  );
}
