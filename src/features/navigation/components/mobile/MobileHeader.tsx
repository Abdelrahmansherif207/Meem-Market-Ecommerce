import { getLocale, getTranslations } from "next-intl/server";
import DeliveryModes from "../header/DeliveryModes";
import { SearchInput } from "../header/SearchInput";
import MobileLocaleSwitcher from "./MobileLocaleSwitcher";
import MobileFooterDrawer from "./MobileFooterDrawer";
import { assembleFooterContent } from "../../services/footerService";

export default async function MobileHeader() {
  const t = await getTranslations("header.search");
  const locale = await getLocale();
  const footerContent = await assembleFooterContent(locale);

  return (
    <header className="header-gradient header-shadow mb-5 block lg:hidden">
      <div className="flex flex-col gap-3 px-4 py-2.5">
        <div className="flex items-center gap-3">
          <MobileFooterDrawer {...footerContent} />
          <DeliveryModes />
          <MobileLocaleSwitcher />
        </div>
        <SearchInput
          prefixText={t("mainPlaceholderPrefix")}
          highlightText={t("mainPlaceholderHighlight")}
        />
      </div>
    </header>
  );
}
