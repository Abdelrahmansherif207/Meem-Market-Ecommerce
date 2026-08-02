import "../globals.css";
import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { NextIntlClientProvider } from "next-intl";
import { routing } from "@/i18n/routing";
import { setRequestLocale } from "next-intl/server"; 
import Header from "@/features/navigation/components/header/Header";
import MobileHeader from "@/features/navigation/components/mobile/MobileHeader";
import MobileBottomNav from "@/features/navigation/components/mobile/MobileBottomNav";
import Footer from "@/features/navigation/components/footer/Footer";
import { AuthModal } from "@/features/auth/components/AuthModal";
import { CartSyncProvider } from "@/features/cart/components/CartSyncProvider";
import { ChannelThemeProvider } from "@/features/fast-shipping/components/ChannelThemeProvider";
import { IBM_Plex_Sans_Arabic } from "next/font/google";
import { cn } from "@/shared/utils/cn";
import { getSiteMeta } from "@/features/settings/lib/metadata";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

const ibmPlexSansArabic = IBM_Plex_Sans_Arabic({
  weight: ["300", "400", "500", "600", "700"],
  subsets: ["arabic"],
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

  let settingsLogo: string | null = null;
  try {
    const meta = await getSiteMeta(locale);
    settingsLogo = meta.logo;
  } catch {
    // Use default
  }
  
  return (
      <html lang={locale} dir={dir} className="overflow-x-clip">
      <body className={cn("flex min-h-dvh flex-col overflow-x-clip", ibmPlexSansArabic.variable)}>
        <link rel="preconnect" href={process.env.NEXT_PUBLIC_API_URL} />
        <NextIntlClientProvider>
          <div className="hidden lg:block sticky top-0 z-50">
            <Header params={params} settingsLogo={settingsLogo} />
          </div>
          <div className="block lg:hidden sticky top-0 z-50">
            <MobileHeader />
          </div>
          <MobileBottomNav />
          <ChannelThemeProvider />
          <CartSyncProvider>
            <div className="container mx-auto flex flex-1 flex-col px-4 pb-[56px] lg:pb-0">
              {children}
            </div>
          </CartSyncProvider>
          <Footer params={params} />
          <AuthModal />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}