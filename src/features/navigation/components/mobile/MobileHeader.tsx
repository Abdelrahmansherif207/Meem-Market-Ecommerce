import { getLocale, getTranslations } from "next-intl/server";
import DeliveryModes from "../header/DeliveryModes";
import { SearchAutocomplete } from "../header/SearchAutocomplete";
import { LocaleSwitcher } from "../header/LocaleSwitcher";
import { WishlistIcon } from "../header/WishlistIcon";
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
          <div className="flex items-center gap-2 ms-auto">
            <WishlistIcon />
            <LocaleSwitcher />
          </div>
        </div>
        <SearchAutocomplete
          prefixText={t("mainPlaceholderPrefix")}
          highlightText={t("mainPlaceholderHighlight")}
          wrapperClassName="w-full"
        />
      </div>
    </header>
  );
}
