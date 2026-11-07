import { getTranslations } from "next-intl/server";
import { FaGooglePlay, FaApple } from "react-icons/fa6";
import { assembleFooterContent } from "../../services/footerService";
import { SocialIcon } from "../footer/SocialIcons";
import CatchPaymentStrip, { PAYMENT_BADGES } from "./CatchPaymentStrip";

interface CatchFooterProps {
  params: Promise<{ locale: string }>;
}

/**
 * Site footer: warm sand 5-column grid (popular categories, company
 * links, profile links, social circles, app badges) followed by the
 * copyright + payment strip. Social/app data comes from the existing
 * footerService assembly; link columns are static per the screen.
 */
export default async function CatchFooter({ params }: CatchFooterProps) {
  const { locale } = await params;
  const t = await getTranslations("catchFooter");

  let copyright = "";
  let socialLinks: { platform: string; url: string; label: string }[] = [];
  let appStoreUrl = "#";
  let googlePlayUrl = "#";

  try {
    const assembled = await assembleFooterContent(locale);
    copyright = assembled.copyright;
    socialLinks = assembled.mergedSocialLinks.slice(0, 8);
    appStoreUrl = assembled.data.bottomRow.appStore.url || "#";
    googlePlayUrl = assembled.data.bottomRow.googlePlay.url || "#";
  } catch (e) {
    console.warn("[CatchFooter] Failed to assemble footer content", e);
  }

  const popularCategories = [
    t("categories.makeup"),
    t("categories.perfume"),
    t("categories.care"),
    t("categories.nails"),
    t("categories.accessories"),
    t("categories.lenses"),
  ];

  const companyLinks = [
    { label: t("company.blogs"), href: "#" },
    { label: t("company.companyWebsite"), href: "#" },
    { label: t("company.careers"), href: "#" },
    { label: t("company.terms"), href: "/terms" },
    { label: t("company.returnRefund"), href: "/returns" },
    { label: t("company.privacy"), href: "/privacy" },
  ];

  const profileLinks = [
    { label: t("profileLinks.profile"), href: "/profile" },
    { label: t("profileLinks.orders"), href: "/profile" },
    { label: t("profileLinks.favourites"), href: "/wishlist" },
    { label: t("profileLinks.affiliate"), href: "#" },
    { label: t("profileLinks.vendor"), href: "#" },
    { label: t("profileLinks.contentCreator"), href: "#" },
  ];

  return (
    <>
      {/* Mobile footer — centered stacked block (mobile screen spec) */}
      <div className="space-y-5 border-t border-catch-border bg-catch-surface px-3 pb-8 pt-4 text-center lg:hidden">
        {/* Stay connected */}
        <div className="space-y-2.5">
          <h3 className="text-xs font-extrabold tracking-tight text-catch-charcoal">
            {t("stayConnected")}
          </h3>
          <div className="flex items-center justify-center space-x-2.5 rtl:space-x-reverse">
            {socialLinks.map((s) => (
              <a
                key={s.platform}
                href={s.url || "#"}
                aria-label={s.label}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-catch-ivory text-xs font-bold text-catch-charcoal transition-colors hover:bg-catch-primary hover:text-white"
              >
                <SocialIcon platform={s.platform} className="h-3.5 w-3.5" />
              </a>
            ))}
          </div>
        </div>

        {/* Download apps */}
        <div className="space-y-2.5">
          <h3 className="text-xs font-extrabold tracking-tight text-catch-charcoal">
            {t("downloadApps")}
          </h3>
          <div className="flex items-center justify-center gap-2.5">
            <a href={googlePlayUrl} className="transition-opacity hover:opacity-90">
              <span className="flex items-center gap-2 rounded-lg bg-catch-charcoal px-3 py-1.5 text-white">
                <FaGooglePlay className="h-4 w-4" />
                <span className="text-[9px] leading-tight">
                  <span className="block">{t("apps.getTag")}</span>
                  <span className="block text-[11px] font-bold">{t("apps.googlePlay")}</span>
                </span>
              </span>
            </a>
            <a href={appStoreUrl} className="transition-opacity hover:opacity-90">
              <span className="flex items-center gap-2 rounded-lg bg-catch-charcoal px-3 py-1.5 text-white">
                <FaApple className="h-4 w-4" />
                <span className="text-[9px] leading-tight">
                  <span className="block">{t("apps.downloadOn")}</span>
                  <span className="block text-[11px] font-bold">{t("apps.appStore")}</span>
                </span>
              </span>
            </a>
          </div>
        </div>

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

        {/* Copyright */}
        <div className="text-[10px] text-catch-muted">
          <div>{copyright || t("copyright")}</div>
          <div>{t("crVat")}</div>
        </div>
      </div>

      <footer className="hidden border-b border-catch-border bg-catch-surface px-4 py-12 lg:block lg:px-8">
        <div className="mx-auto grid max-w-[1440px] grid-cols-2 gap-8 md:grid-cols-5">
          {/* Column 1: Popular Categories */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold tracking-wider text-catch-charcoal">
              {t("popularCategories")}
            </h4>
            <div className="flex flex-wrap gap-x-3 gap-y-2 text-xs text-catch-muted">
              {popularCategories.map((label) => (
                <a key={label} href="#" className="transition-colors hover:text-catch-primary">
                  {label}
                </a>
              ))}
            </div>
          </div>

          {/* Column 2: Company */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold tracking-wider text-catch-charcoal">
              {t("companyTitle")}
            </h4>
            <ul className="space-y-2 text-xs text-catch-muted">
              {companyLinks.map((link) => (
                <li key={link.label}>
                  <a href={link.href} className="transition-colors hover:text-catch-primary">
                    {link.label}
                  </a>
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
                  <a href={link.href} className="transition-colors hover:text-catch-primary">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: Stay connected */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold tracking-wider text-catch-charcoal">
              {t("stayConnected")}
            </h4>
            <div className="grid w-fit grid-cols-4 gap-2">
              {socialLinks.map((s) => (
                <a
                  key={s.platform}
                  href={s.url || "#"}
                  aria-label={s.label}
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-catch-charcoal text-white transition-colors hover:bg-catch-primary"
                >
                  <SocialIcon platform={s.platform} className="h-3.5 w-3.5" />
                </a>
              ))}
            </div>
          </div>

          {/* Column 5: Download apps */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold tracking-wider text-catch-charcoal">
              {t("downloadApps")}
            </h4>
            <div className="space-y-2">
              <a href={googlePlayUrl} className="inline-block transition-opacity hover:opacity-90">
                <span className="flex w-36 items-center gap-2 rounded-lg bg-catch-charcoal px-3 py-1.5 text-white">
                  <FaGooglePlay className="h-5 w-5" />
                  <span className="text-[9px] leading-tight">
                    <span className="block">{t("apps.getTag")}</span>
                    <span className="block text-[11px] font-bold">{t("apps.googlePlay")}</span>
                  </span>
                </span>
              </a>
              <a href={appStoreUrl} className="block transition-opacity hover:opacity-90">
                <span className="flex w-36 items-center gap-2 rounded-lg bg-catch-charcoal px-3 py-1.5 text-white">
                  <FaApple className="h-5 w-5" />
                  <span className="text-[9px] leading-tight">
                    <span className="block">{t("apps.downloadOn")}</span>
                    <span className="block text-[11px] font-bold">{t("apps.appStore")}</span>
                  </span>
                </span>
              </a>
            </div>
          </div>
        </div>
      </footer>

      <CatchPaymentStrip copyright={copyright} />
    </>
  );
}
