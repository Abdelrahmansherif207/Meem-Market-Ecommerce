import { getTranslations } from "next-intl/server";
import DeliveryModes from "../header/DeliveryModes";
import { SearchInput } from "../header/SearchInput";
import MobileLocaleSwitcher from "./MobileLocaleSwitcher";

export default async function MobileHeader() {
  const t = await getTranslations("header.search");

  return (
    <header className="header-gradient header-shadow sticky top-0 z-50 mb-5 block lg:hidden">
      <div className="flex flex-col gap-3 px-4 py-2.5">
        <div className="flex items-center gap-3">
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
