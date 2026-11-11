import "../globals.css";
import type { Metadata, Viewport } from "next";
import type { CSSProperties, ReactNode } from "react";
import { NextIntlClientProvider } from "next-intl";
import { routing } from "@/i18n/routing";
import { getMessages, setRequestLocale } from "next-intl/server";
import CatchHeader from "@/features/navigation/components/catch/CatchHeader";
import CatchMobileHeader from "@/features/navigation/components/catch/CatchMobileHeader";
import CatchStickyHeader from "@/features/navigation/components/catch/CatchStickyHeader";
import MobileBottomNav from "@/features/navigation/components/mobile/MobileBottomNav";
import CatchFooter from "@/features/navigation/components/catch/CatchFooter";
import { AuthModal, AuthSyncHandler } from "@/features/auth";
import { ProfileSyncHandler } from "@/features/profile";
import { CartSyncProvider } from "@/features/cart/components/CartSyncProvider";
import { WishlistSyncProvider } from "@/features/wishlist/components/WishlistSyncProvider";
import {
  NotificationSyncHandler,
  NotificationRealtimeProvider,
  NotificationToast,
} from "@/features/notifications";
import { IBM_Plex_Sans_Arabic } from "next/font/google";
import { cn } from "@/shared/utils/cn";
import { getSiteMeta } from "@/features/settings/lib/metadata";
import { getCachedSettings } from "@/features/settings/services/settingsService";
import {
  buildFontCss,
  getFont,
  getFontPreconnectOrigins,
} from "@/features/settings/lib/font";
import { CurrencyProvider, currencyService } from "@/features/currencies";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export const revalidate = 60;

const ibmPlexSansArabic = IBM_Plex_Sans_Arabic({
  weight: ["300", "400", "500", "600", "700"],
  subsets: ["arabic", "latin"],
  variable: "--font-ibm-arabic",
});

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const site = await getSiteMeta(locale);

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
  const metadataBase = siteUrl ? new URL(siteUrl) : undefined;
  const ogImages = site.logo
    ? [{ url: site.logo, width: 800, height: 800, alt: site.siteName }]
    : [];

  return {
    metadataBase,
    title: {
      default: site.siteName,
      template: `%s | ${site.siteName}`,
    },
    description: site.description,
    icons: {
      icon: site.favicon,
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
      },
    },
    openGraph: {
      title: site.siteName,
      description: site.description,
      siteName: site.siteName,
      locale: locale === "ar" ? "ar_AR" : "en_US",
      type: "website",
      ...(ogImages.length > 0 ? { images: ogImages } : {}),
    },
    twitter: {
      card: "summary",
      title: site.siteName,
      description: site.description,
      ...(ogImages.length > 0 ? { images: [ogImages[0].url] } : {}),
    },
  };
}

export const viewport: Viewport = {
  themeColor: "#ffffff",
};

export default async function RootLayout({
  children,
  params,
}: Readonly<{
  children: ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  const { locale } = await params;
  
  setRequestLocale(locale);
  
  const dir = locale === "ar" ? "rtl" : "ltr";

  const [messages, font] = await Promise.all([getMessages(), getFont()]);

  // Admin-uploaded font (validated server-side). When absent, the CSS falls
  // back to the next/font IBM Plex variable and the site looks unchanged.
  const fontStyle = font
    ? ({ "--font-custom": `"${font.family}"` } as CSSProperties)
    : undefined;

  // Normalized settings already contain locale-aware branding defaults and
  // never throw, so every consumer can share one resolved snapshot.
  const settings = await getCachedSettings(locale);
  const settingsLogo = settings.logo;
  const siteName = settings.site_name;

  // Backend-driven currency: settings own the base/catalog code, the
  // currencies endpoint owns the display metadata (symbol, decimals). The
  // provider mounts both so every `<Price>` renders the backend currency —
  // stale persisted selections are ignored while selection is disabled.
  const [currencySelectionEnabled, siteCurrencyCode, currencies] =
    await Promise.all([
      settings.currency_selection_enabled,
      settings.options.base_currency_code ?? settings.options.currency ?? "",
      currencyService.getCurrencies(locale).catch(() => []),
    ]);

  return (
      <html
        lang={locale}
        dir={dir}
        className={cn("overflow-x-clip", ibmPlexSansArabic.variable)}
        style={fontStyle}
      >
      <body className="flex min-h-dvh flex-col overflow-x-clip">
        <link rel="preconnect" href={process.env.NEXT_PUBLIC_API_URL} />
        {font?.source_type === "file" ? (
          <>
            <style
              id="custom-font"
              href="custom-font"
              precedence="default"
            >{buildFontCss(font)}</style>
            {font.format === "woff2" ? (
              <link
                rel="preload"
                as="font"
                type="font/woff2"
                crossOrigin="anonymous"
                href={font.url}
              />
            ) : null}
          </>
        ) : null}
        {font?.source_type === "link" ? (
          <>
            {getFontPreconnectOrigins(font).map((origin) => (
              <link
                key={origin}
                rel="preconnect"
                href={origin}
                crossOrigin="anonymous"
              />
            ))}
            <link rel="stylesheet" href={font.url} />
          </>
        ) : null}
        <NextIntlClientProvider locale={locale} messages={messages}>
          <CurrencyProvider
            currencies={currencies}
            baseCode={siteCurrencyCode}
            selectionEnabled={currencySelectionEnabled}
          >
          <CatchStickyHeader
            settingsLogo={settingsLogo}
            siteName={siteName}
          />
          <div className="hidden lg:block">
            <CatchHeader
              params={params}
              settingsLogo={settingsLogo}
              siteName={siteName}
            />
          </div>
          <div className="lg:hidden">
            <CatchMobileHeader settingsLogo={settingsLogo} siteName={siteName} />
          </div>
          <MobileBottomNav />
          <AuthSyncHandler />
          <ProfileSyncHandler />
          <NotificationSyncHandler />
          <NotificationRealtimeProvider />
          <CartSyncProvider>
            <div className="flex flex-1 flex-col">
              <div className="container mx-auto flex flex-1 flex-col px-4 pb-[56px] lg:pb-0">
                {children}
              </div>
              <CatchFooter params={params} />
            </div>
          </CartSyncProvider>
          <WishlistSyncProvider />
          <AuthModal logo={settingsLogo} siteName={siteName} />
          <NotificationToast />
          </CurrencyProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}