import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { FaApple, FaGooglePlay, FaWhatsapp } from "react-icons/fa6";
import { Mail, Phone } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { assembleFooterContent } from "../../services/footerService";
import { categoryMenuService } from "@/features/categories/services/categoryMenuService";
import { sanitizeLegacyBrand } from "@/shared/utils/legacyBrand";
import type { PaymentGatewaySettings } from "@/features/settings";
import { SocialIcon } from "../footer/SocialIcons";
import MeemPaymentStrip, { PaymentBadges } from "./MeemPaymentStrip";

interface MeemFooterProps {
  params: Promise<{ locale: string }>;
}

/**
 * Site footer: cool surface 5-column grid (popular categories, company
 * links, profile links, social/contact, app badges) followed by the
 * copyright + payment strip. Social/contact/logo/copyright data comes from
 * the backend settings; popular categories come from the backend navigation
 * tree (with generic Meem fallbacks), and the remaining link columns are
 * static per the screen.
 */
export default async function MeemFooter({ params }: MeemFooterProps) {
  const { locale } = await params;
  const t = await getTranslations("meemFooter");

  let siteName = "";
  let socialLinks: { platform: string; url: string; label: string }[] = [];
  let contact = { email: "", phone: "", whatsapp: "" };
  let copyright = "";
  let logoSrc = "";
  let paymentGateways: PaymentGatewaySettings[] | null = null;
  let appStoreUrl = "";
  let googlePlayUrl = "";
  let fastShippingPageEnabled = false;

  try {
    const assembled = await assembleFooterContent(locale);
    siteName = assembled.siteName;
    socialLinks = assembled.mergedSocialLinks;
    contact = {
      email: assembled.contactInfo.email,
      phone: assembled.contactInfo.phoneNumber,
      whatsapp: assembled.contactInfo.whatsappUrl,
    };
    copyright = assembled.copyright;
    logoSrc = assembled.logoSrc;
    paymentGateways = assembled.paymentGateways;
    appStoreUrl = assembled.data.bottomRow.appStore.url || "";
    googlePlayUrl = assembled.data.bottomRow.googlePlay.url || "";
    fastShippingPageEnabled = assembled.fastShippingPageEnabled;
  } catch (e) {
    console.warn("[MeemFooter] Failed to assemble footer content", e);
  }

  let backendCategories: { label: string; href: string }[] = [];
  try {
    const categories = await categoryMenuService.getMenu(locale, 1);
    backendCategories = categories
      .filter((category) => Boolean(category.slug))
      .slice(0, 6)
      .map((category) => ({
        label: sanitizeLegacyBrand(category.name, locale),
        href: `/category/${category.slug}`,
      }));
  } catch (e) {
    console.warn("[MeemFooter] Failed to load backend categories", e);
  }

  const popularCategories =
    backendCategories.length > 0
      ? backendCategories
      : [
          { label: t("categories.electronics"), href: "/category/electronics" },
          { label: t("categories.fashion"), href: "/category/fashion" },
          { label: t("categories.beauty"), href: "/category/beauty" },
          { label: t("categories.home"), href: "/category/home" },
          { label: t("categories.grocery"), href: "/category/grocery" },
          { label: t("categories.sports"), href: "/category/sports" },
        ];

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
  const hasContact = Boolean(contact.email || contact.phone || contact.whatsapp);
  const hasConnectColumn = hasSocialLinks || hasContact;
  const contactPhoneHref = contact.phone.replace(/\s+/g, "");
  const hasGooglePlayUrl = Boolean(googlePlayUrl) && googlePlayUrl !== "#";
  const hasAppStoreUrl = Boolean(appStoreUrl) && appStoreUrl !== "#";
  const hasAppLinks = hasGooglePlayUrl || hasAppStoreUrl;
  const hasPaymentBadges = Boolean(
    paymentGateways?.some((gateway) => gateway.enabled),
  );

  const desktopColumnCount =
    3 + (hasConnectColumn ? 1 : 0) + (hasAppLinks ? 1 : 0);
  const desktopGridClass =
    desktopColumnCount >= 5
      ? "md:grid-cols-5"
      : desktopColumnCount === 4
        ? "md:grid-cols-4"
        : "md:grid-cols-3";

  return (
    <>
      {/* Mobile footer — centered stacked block (mobile screen spec) */}
      <div className="space-y-5 border-t border-meem-border bg-meem-surface px-3 pb-8 pt-4 text-center lg:hidden">
        {/* Follow us */}
        {hasSocialLinks && (
          <div className="space-y-2.5">
            <h3 className="text-xs font-extrabold tracking-tight text-meem-charcoal">
              {t("followUs")}
            </h3>
            <div className="flex items-center justify-center space-x-2.5 rtl:space-x-reverse">
              {visibleSocialLinks.map((s) => (
                <a
                  key={s.platform}
                  href={s.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.label}
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-meem-ivory text-xs font-bold text-meem-charcoal transition-colors hover:bg-meem-primary hover:text-white"
                >
                  <SocialIcon platform={s.platform} className="h-3.5 w-3.5" />
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Contact details from settings */}
        {hasContact && (
          <div className="space-y-2">
            <h3 className="text-xs font-extrabold tracking-tight text-meem-charcoal">
              {t("contactUs")}
            </h3>
            <div className="flex flex-col items-center gap-1.5 text-xs text-meem-muted">
              {contact.email && (
                <a
                  href={`mailto:${contact.email}`}
                  className="inline-flex items-center gap-1.5 transition-colors hover:text-meem-primary"
                >
                  <Mail className="h-3.5 w-3.5" aria-hidden />
                  <span className="break-all">{contact.email}</span>
                </a>
              )}
              {contact.phone && (
                <a
                  href={`tel:${contactPhoneHref}`}
                  className="inline-flex items-center gap-1.5 transition-colors hover:text-meem-primary"
                >
                  <Phone className="h-3.5 w-3.5" aria-hidden />
                  <span>{contact.phone}</span>
                </a>
              )}
              {contact.whatsapp && (
                <a
                  href={contact.whatsapp}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 transition-colors hover:text-meem-primary"
                >
                  <FaWhatsapp className="h-3.5 w-3.5" aria-hidden />
                  <span>{t("contact.whatsapp")}</span>
                </a>
              )}
            </div>
          </div>
        )}

        {/* Download apps */}
        {hasAppLinks && (
          <div className="space-y-2.5">
            <h3 className="text-xs font-extrabold tracking-tight text-meem-charcoal">
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
                  <span className="flex items-center gap-2 rounded-lg bg-meem-charcoal px-3 py-1.5 text-white">
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
                  <span className="flex items-center gap-2 rounded-lg bg-meem-charcoal px-3 py-1.5 text-white">
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

        {/* Payment badges from settings */}
        {hasPaymentBadges && (
          <div className="flex justify-center">
            <PaymentBadges
              gateways={paymentGateways}
              className="justify-center"
            />
          </div>
        )}

        {/* Footer logo + copyright */}
        <div className="space-y-2 border-t border-meem-border pt-4">
          {logoSrc && (
            <Image
              src={logoSrc}
              alt={siteName || t("companyTitle")}
              width={160}
              height={48}
              className="mx-auto h-8 w-auto object-contain"
            />
          )}
          {copyright && (
            <p className="text-[10px] leading-relaxed text-meem-muted">
              {copyright}
            </p>
          )}
        </div>
      </div>

      <footer className="hidden border-b border-meem-border bg-meem-surface px-4 py-12 lg:block lg:px-8">
        <div className={`mx-auto grid max-w-[1440px] grid-cols-2 gap-8 ${desktopGridClass}`}>
          {/* Column 1: Popular Categories */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold tracking-wider text-meem-charcoal">
              {t("popularCategories")}
            </h4>
            <div className="flex flex-wrap gap-x-3 gap-y-2 text-xs text-meem-muted">
              {popularCategories.map((category) => (
                <Link
                  key={category.href}
                  href={category.href}
                  className="transition-colors hover:text-meem-primary"
                >
                  {category.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Column 2: Company */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold tracking-wider text-meem-charcoal">
              {siteName || t("companyTitle")}
            </h4>
            <ul className="space-y-2 text-xs text-meem-muted">
              {companyLinks.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="transition-colors hover:text-meem-primary">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Profile */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold tracking-wider text-meem-charcoal">
              {t("profileTitle")}
            </h4>
            <ul className="space-y-2 text-xs text-meem-muted">
              {profileLinks.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="transition-colors hover:text-meem-primary">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: Follow us + contact */}
          {hasConnectColumn && (
            <div className="space-y-3">
              {hasSocialLinks && (
                <>
                  <h4 className="text-xs font-bold tracking-wider text-meem-charcoal">
                    {t("followUs")}
                  </h4>
                  <div className="grid w-fit grid-cols-4 gap-2">
                    {visibleSocialLinks.map((s) => (
                      <a
                        key={s.platform}
                        href={s.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={s.label}
                        className="flex h-8 w-8 items-center justify-center rounded-full bg-meem-charcoal text-white transition-colors hover:bg-meem-primary"
                      >
                        <SocialIcon platform={s.platform} className="h-3.5 w-3.5" />
                      </a>
                    ))}
                  </div>
                </>
              )}

              {hasContact && (
                <div className={hasSocialLinks ? "space-y-2 pt-1" : "space-y-2"}>
                  {!hasSocialLinks && (
                    <h4 className="text-xs font-bold tracking-wider text-meem-charcoal">
                      {t("contactUs")}
                    </h4>
                  )}
                  <ul className="space-y-2 text-xs text-meem-muted">
                    {contact.email && (
                      <li>
                        <a
                          href={`mailto:${contact.email}`}
                          className="inline-flex items-center gap-2 transition-colors hover:text-meem-primary"
                        >
                          <Mail className="h-3.5 w-3.5 shrink-0" aria-hidden />
                          <span className="break-all">{contact.email}</span>
                        </a>
                      </li>
                    )}
                    {contact.phone && (
                      <li>
                        <a
                          href={`tel:${contactPhoneHref}`}
                          className="inline-flex items-center gap-2 transition-colors hover:text-meem-primary"
                        >
                          <Phone className="h-3.5 w-3.5 shrink-0" aria-hidden />
                          <span>{contact.phone}</span>
                        </a>
                      </li>
                    )}
                    {contact.whatsapp && (
                      <li>
                        <a
                          href={contact.whatsapp}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 transition-colors hover:text-meem-primary"
                        >
                          <FaWhatsapp className="h-3.5 w-3.5 shrink-0" aria-hidden />
                          <span>{t("contact.whatsapp")}</span>
                        </a>
                      </li>
                    )}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Column 5: Download apps */}
          {hasAppLinks && (
            <div className="space-y-3">
              <h4 className="text-xs font-bold tracking-wider text-meem-charcoal">
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
                    <span className="flex w-36 items-center gap-2 rounded-lg bg-meem-charcoal px-3 py-1.5 text-white">
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
                    <span className="flex w-36 items-center gap-2 rounded-lg bg-meem-charcoal px-3 py-1.5 text-white">
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

      <MeemPaymentStrip
        copyright={copyright}
        logoSrc={logoSrc}
        siteName={siteName || t("companyTitle")}
        gateways={paymentGateways}
      />
    </>
  );
}
