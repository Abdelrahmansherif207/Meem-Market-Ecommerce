import "../globals.css";
import type { Metadata } from "next";
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
import { getCachedSettings } from "@/features/settings/services/settingsService";

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

  const isAr = locale === "ar";
  const DEFAULT_TITLE = isAr ? "ميم ماركت" : "Meem Market";
  const DEFAULT_DESC = isAr ? "تسوق أفضل المنتجات في ميم ماركت - إلكترونيات، أزياء، منتجات المنزل والمزيد" : "Shop the best products at Meem Market — electronics, fashion, home goods, and more.";
  const DEFAULT_FAVICON = "/meem-icon.jpeg";

  let siteName = DEFAULT_TITLE;
  let description = DEFAULT_DESC;
  let icon = DEFAULT_FAVICON;

  try {
    const settings = await getCachedSettings(locale);
    if (settings.site_name) siteName = settings.site_name;
    if (settings.meta_desc) description = settings.meta_desc;
    else if (settings.site_desc) description = settings.site_desc;
    if (settings.favicon) icon = settings.favicon;
  } catch {
    // settings unavailable
  }

  return {
    title: {
      default: siteName,
      template: `%s | ${siteName}`,
    },
    description,
    icons: {
      icon,
    },
    openGraph: {
      title: siteName,
      description,
      siteName,
    },
  };
}

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
    const settings = await getCachedSettings(locale);
    if (settings.logo) settingsLogo = settings.logo;
  } catch {
    // Use default
  }
  
  return (
      <html lang={locale} dir={dir} className="overflow-x-clip">
      <body className={cn("flex flex-col overflow-x-clip", montserrat.variable, playfair.variable)}>
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
            <div className="container mx-auto px-4 flex flex-col min-h-screen pb-[56px] lg:pb-0">
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