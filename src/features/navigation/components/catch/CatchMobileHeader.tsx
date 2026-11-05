import { getLocale, getTranslations } from "next-intl/server";
import { categoryMenuService } from "@/features/categories/services/categoryMenuService";
import type { CategoryMenuItem } from "@/features/categories/types";
import CatchAnnouncementBar from "./CatchAnnouncementBar";
import CatchMobileSearchBar from "./CatchMobileSearchBar";
import CatchMobileNavRow from "./CatchMobileNavRow";

/**
 * Mobile header (mobile screen spec): black announcement strip, search
 * bar, and the action row (Categories pill + language/profile/bell/cart
 * icons). The categories pill opens the Nice One-style mega panel;
 * primary navigation stays in the bottom bar.
 */
export default async function CatchMobileHeader() {
  const t = await getTranslations("catchHeader");
  const locale = await getLocale();

  let categories: CategoryMenuItem[] = [];
  try {
    categories = await categoryMenuService.getMenu(locale);
  } catch (e) {
    console.error("[CatchMobileHeader] Failed to fetch category menu", e);
  }

  return (
    <header className="sticky top-0 z-40 border-b border-neutral-100 bg-white lg:hidden">
      <CatchAnnouncementBar />
      <CatchMobileSearchBar placeholder={t("searchPlaceholder")} />
      <CatchMobileNavRow categoriesLabel={t("categories")} categories={categories} />
    </header>
  );
}
