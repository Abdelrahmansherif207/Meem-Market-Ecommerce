import { getLocale, getTranslations } from "next-intl/server";
import { categoryMenuService } from "@/features/categories/services/categoryMenuService";
import type { CategoryMenuItem } from "@/features/categories/types";
import DeliveryModes from "@/features/fast-shipping/components/DeliveryModes";
import MeemAnnouncementBar from "./MeemAnnouncementBar";
import MeemMobileLogoLockup from "./MeemMobileLogoLockup";
import MeemMobileSearchBar from "./MeemMobileSearchBar";
import MeemMobileNavRow from "./MeemMobileNavRow";

interface MeemMobileHeaderProps {
  settingsLogo?: string | null;
  siteName?: string;
}

/**
 * Mobile header: deep-blue announcement strip, then a compact logo + search
 * row and the action row (Categories pill + language/profile/bell/cart icons).
 * The categories pill opens the Nice One-style mega panel; primary
 * navigation stays in the bottom bar. The compact fixed header on scroll
 * lives in MeemStickyHeader.
 */
export default async function MeemMobileHeader({
  settingsLogo,
  siteName,
}: MeemMobileHeaderProps) {
  const t = await getTranslations("meemHeader");
  const locale = await getLocale();

  let categories: CategoryMenuItem[] = [];
  try {
    categories = await categoryMenuService.getMenu(locale);
  } catch (e) {
    console.error("[MeemMobileHeader] Failed to fetch category menu", e);
  }

  return (
    <header className="relative z-40 border-b border-meem-border bg-background lg:hidden">
      <MeemAnnouncementBar />
      <MeemMobileSearchBar
        placeholder={t("searchPlaceholder")}
        leading={<MeemMobileLogoLockup src={settingsLogo} siteName={siteName} />}
      />
      <div className="px-3 pb-1.5">
        <DeliveryModes compact />
      </div>
      <MeemMobileNavRow categoriesLabel={t("categories")} categories={categories} />
    </header>
  );
}
