import { getTranslations } from "next-intl/server";
import { FaGooglePlay, FaApple } from "react-icons/fa6";
import { Link } from "@/i18n/navigation";
import { categoryMenuService } from "@/features/categories";
import type { CategoryMenuItem } from "@/features/categories";
import { assembleFooterContent } from "../../services/footerService";
import { SocialIcon } from "../footer/SocialIcons";
import CatchPaymentStrip, { PAYMENT_BADGES } from "./CatchPaymentStrip";

interface CatchFooterProps {
  params: Promise<{ locale: string }>;
}

/**
 * Site footer: light surface grid (popular categories, company links,
 * profile links, social circles, app badges) followed by the copyright +
 * payment strip. Categories come from the nav-data endpoint; social/app
 * data comes from the existing footerService assembly.
 */
export default async function CatchFooter({ params }: CatchFooterProps) {
  const { locale } = await params;
  const t = await getTranslations("catchFooter");

  let siteName = "";
  let socialLinks: { platform: string; url: string; label: string }[] = [];
  let appStoreUrl = "";
  let googlePlayUrl = "";
  let fastShippingPageEnabled = false;
  let categories: CategoryMenuItem[] = [];

  try {
    const assembled = await assembleFooterContent(locale);
    siteName = assembled.siteName;
    socialLinks = assembled.mergedSocialLinks.slice(0, 8);
    appStoreUrl = assembled.data.bottomRow.appStore.url || "";
    googlePlayUrl = assembled.data.bottomRow.googlePlay.url || "";
    fastShippingPageEnabled = assembled.fastShippingPageEnabled;
  } catch (e) {
    console.warn("[CatchFooter] Failed to assemble footer content", e);
  }

  try {
    const menu = await categoryMenuService.getMenu(locale, 1);
    categories = menu.slice(0, 6);
  } catch (e) {
    console.warn("[CatchFooter] Failed to load footer categories", e);
  }

  const companyLinks = [
    { label: t("company.terms"), href: "/terms" },
    { label: t("company.returnRefund"), href: "/returns" },
    { label: t("company.privacy"), href: "/privacy" },
    ...(fastShippingPageEnabled
      ? [{ label: t("company.fastShipping"), href: "/shipping" }]
      : []),
  ];

  const profileLinks = [
    { label: t("profileLinks.profile"), href: "/profile" },
    {
      label: t("profileLinks.orders"),
      href: { pathname: "/profile", query: { tab: "orders" } },
    },
    { label: t("profileLinks.favourites"), href: "/wishlist" },
  ];

  const visibleSocialLinks = socialLinks.filter(
    (link) => Boolean(link.url) && link.url !== "#",
  );
  const hasSocialLinks = visibleSocialLinks.length > 0;
  const hasGooglePlayUrl = Boolean(googlePlayUrl) && googlePlayUrl !== "#";
  const hasAppStoreUrl = Boolean(appStoreUrl) && appStoreUrl !== "#";
  const hasAppLinks = hasGooglePlayUrl || hasAppStoreUrl;
  const hasCategories = categories.length > 0;

  const desktopColumnCount =
    2 + (hasCategories ? 1 : 0) + (hasSocialLinks ? 1 : 0) + (hasAppLinks ? 1 : 0);
  const desktopGridClass =
    desktopColumnCount >= 5
      ? "md:grid-cols-5"
      : desktopColumnCount === 4
        ? "md:grid-cols-4"
        : desktopColumnCount === 3
          ? "md:grid-cols-3"
          : "md:grid-cols-2";

  return (
    <>
      {/* Mobile footer — centered stacked block (mobile screen spec) */}
      <div className="space-y-5 border-t border-catch-border bg-catch-surface px-3 pb-8 pt-4 text-center lg:hidden">
        {/* Stay connected */}
        {hasSocialLinks && (
          <div className="space-y-2.5">
            <h3 className="text-xs font-extrabold tracking-tight text-catch-charcoal">
              {t("stayConnected")}
            </h3>
            <div className="flex items-center justify-center space-x-2.5 rtl:space-x-reverse">
              {visibleSocialLinks.map((s) => (
                <a
                  key={s.platform}
                  href={s.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.label}
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-catch-ivory text-xs font-bold text-catch-charcoal transition-colors hover:bg-catch-primary hover:text-white"
                >
                  <SocialIcon platform={s.platform} className="h-3.5 w-3.5" />
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Download apps */}
        {hasAppLinks && (
          <div className="space-y-2.5">
            <h3 className="text-xs font-extrabold tracking-tight text-catch-charcoal">
              {t("downloadApps")}
            </h3>
            <div className="flex items-center justify-center gap-2.5">
              {hasGooglePlayUrl && (
                <a
                  href={googlePlayUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="transition-opacity hover:opacity-90"
                >
                  <span className="flex items-center gap-2 rounded-lg bg-catch-charcoal px-3 py-1.5 text-white">
                    <FaGooglePlay className="h-4 w-4" />
                    <span className="text-[9px] leading-tight">
                      <span className="block">{t("apps.getTag")}</span>
                      <span className="block text-[11px] font-bold">{t("apps.googlePlay")}</span>
                    </span>
                  </span>
                </a>
              )}
              {hasAppStoreUrl && (
                <a
                  href={appStoreUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="transition-opacity hover:opacity-90"
                >
                  <span className="flex items-center gap-2 rounded-lg bg-catch-charcoal px-3 py-1.5 text-white">
                    <FaApple className="h-4 w-4" />
                    <span className="text-[9px] leading-tight">
                      <span className="block">{t("apps.downloadOn")}</span>
                      <span className="block text-[11px] font-bold">{t("apps.appStore")}</span>
                    </span>
                  </span>
                </a>
              )}
            </div>
          </div>
        )}

        {/* Payment badges */}
        <div className="flex flex-wrap items-center justify-center gap-2">
          {PAYMENT_BADGES.map((badge) => (
            <span
              key={badge.label}
              className={`rounded border px-2 py-1 text-[10px] font-bold ${badge.className}`}
            >
              {badge.label}
            </span>
          ))}
        </div>
      </div>

      <footer className="hidden border-b border-catch-border bg-catch-surface px-4 py-12 lg:block lg:px-8">
        <div className={`mx-auto grid max-w-[1440px] grid-cols-2 gap-8 ${desktopGridClass}`}>
          {/* Column 1: Popular Categories */}
          {hasCategories && (
            <div className="space-y-3">
              <h4 className="text-xs font-bold tracking-wider text-catch-charcoal">
                {t("popularCategories")}
              </h4>
              <div className="flex flex-wrap gap-x-3 gap-y-2 text-xs text-catch-muted">
                {categories.map((category) => (
                  <Link
                    key={category.id}
                    href={`/category/${category.slug}`}
                    className="transition-colors hover:text-catch-primary"
                  >
                    {category.name}
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Column 2: Company */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold tracking-wider text-catch-charcoal">
              {siteName || t("companyTitle")}
            </h4>
            <ul className="space-y-2 text-xs text-catch-muted">
              {companyLinks.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="transition-colors hover:text-catch-primary">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Profile */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold tracking-wider text-catch-charcoal">
              {t("profileTitle")}
            </h4>
            <ul className="space-y-2 text-xs text-catch-muted">
              {profileLinks.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="transition-colors hover:text-catch-primary">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: Stay connected */}
          {hasSocialLinks && (
            <div className="space-y-3">
              <h4 className="text-xs font-bold tracking-wider text-catch-charcoal">
                {t("stayConnected")}
              </h4>
              <div className="grid w-fit grid-cols-4 gap-2">
                {visibleSocialLinks.map((s) => (
                  <a
                    key={s.platform}
                    href={s.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={s.label}
                    className="flex h-8 w-8 items-center justify-center rounded-full bg-catch-charcoal text-white transition-colors hover:bg-catch-primary"
                  >
                    <SocialIcon platform={s.platform} className="h-3.5 w-3.5" />
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Column 5: Download apps */}
          {hasAppLinks && (
            <div className="space-y-3">
              <h4 className="text-xs font-bold tracking-wider text-catch-charcoal">
                {t("downloadApps")}
              </h4>
              <div className="space-y-2">
                {hasGooglePlayUrl && (
                  <a
                    href={googlePlayUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block transition-opacity hover:opacity-90"
                  >
                    <span className="flex w-36 items-center gap-2 rounded-lg bg-catch-charcoal px-3 py-1.5 text-white">
                      <FaGooglePlay className="h-5 w-5" />
                      <span className="text-[9px] leading-tight">
                        <span className="block">{t("apps.getTag")}</span>
                        <span className="block text-[11px] font-bold">{t("apps.googlePlay")}</span>
                      </span>
                    </span>
                  </a>
                )}
                {hasAppStoreUrl && (
                  <a
                    href={appStoreUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block transition-opacity hover:opacity-90"
                  >
                    <span className="flex w-36 items-center gap-2 rounded-lg bg-catch-charcoal px-3 py-1.5 text-white">
                      <FaApple className="h-5 w-5" />
                      <span className="text-[9px] leading-tight">
                        <span className="block">{t("apps.downloadOn")}</span>
                        <span className="block text-[11px] font-bold">{t("apps.appStore")}</span>
                      </span>
                    </span>
                  </a>
                )}
              </div>
            </div>
          )}
        </div>
      </footer>

      <CatchPaymentStrip />
    </>
  );
}
