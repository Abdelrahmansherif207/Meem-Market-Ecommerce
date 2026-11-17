import { getCachedSettings } from "@/features/settings/services/settingsService";
import { buildWhatsAppUrl } from "@/features/settings/lib/normalize";
import {
  DEFAULT_FOOTER_LOGO,
  DEFAULT_LOGO,
  DEFAULT_SOCIAL_LINKS,
} from "@/features/settings/constants";
import { isLegacyBrandUrl } from "@/shared/utils/legacyBrand";
import type { PaymentGatewaySettings } from "@/features/settings";
import type { ContactInfo, FooterData, SocialLink } from "../types";

export interface AssembledFooterContent {
  data: FooterData;
  logoSrc: string;
  mainLogoSrc: string;
  siteName: string;
  copyright: string;
  mergedSocialLinks: SocialLink[];
  contactInfo: ContactInfo;
  /** `options.payment_gateways` from site settings; `null` when absent. */
  paymentGateways: PaymentGatewaySettings[] | null;
  /** `fast_shipping_page_publish` from site settings. */
  fastShippingPageEnabled: boolean;
}

export async function assembleFooterContent(locale: string): Promise<AssembledFooterContent> {
  const data = await footerService.getFooter(locale);
  const settings = await getCachedSettings(locale);
  const socialLabels: Record<string, string> = {
    instagram: "Instagram",
    facebook: "Facebook",
    tiktok: "TikTok",
    snapchat: "Snapchat",
    youtube: "YouTube",
    linkedin: "LinkedIn",
    whatsapp: "WhatsApp",
  };

  const mainLogoSrc = settings.logo || DEFAULT_LOGO;
  const logoSrc = settings.footer_logo || mainLogoSrc || DEFAULT_FOOTER_LOGO;
  const siteName = settings.site_name;
  const copyright = settings.site_copy_right;

  const settingsSocial: SocialLink[] = (
    [
      ["instagram", settings.instagram],
      ["facebook", settings.facebook],
      ["tiktok", settings.tiktok],
      ["snapchat", settings.snapchat],
      ["youtube", settings.youtube],
      ["linkedin", settings.linkedin],
    ] as const
  )
    .filter(([, url]) => Boolean(url) && url !== "#" && !isLegacyBrandUrl(url))
    .map(([platform, url]) => ({
      platform,
      url,
      label: socialLabels[platform] ?? platform,
    }));

  // Merge the future `/footer` payload first, then override it with settings.
  // Invalid/legacy entries are dropped per link, never as a whole row.
  const merged = new Map<string, SocialLink>();
  for (const link of data.socialLinks) {
    if (link.url && link.url !== "#" && !isLegacyBrandUrl(link.url)) {
      merged.set(link.platform, link);
    }
  }
  for (const link of settingsSocial) {
    merged.set(link.platform, link);
  }

  const backendSocialLinks = Array.from(merged.values());
  const mergedSocialLinks: SocialLink[] =
    backendSocialLinks.length > 0
      ? backendSocialLinks
      : DEFAULT_SOCIAL_LINKS.map((link) => ({
          platform: link.platform,
          url: link.url,
          label: link.label,
        }));

  const contactInfo: ContactInfo = {
    ...data.contactInfo,
    email: settings.email_support || settings.site_email,
    phoneNumber: settings.phone || data.contactInfo.phoneNumber,
    whatsappUrl: settings.phone
      ? buildWhatsAppUrl(settings.phone)
      : data.contactInfo.whatsappUrl,
  };

  return {
    data,
    logoSrc,
    mainLogoSrc,
    siteName,
    copyright,
    mergedSocialLinks,
    contactInfo,
    paymentGateways: settings.options.payment_gateways,
    fastShippingPageEnabled: settings.fast_shipping_page_publish,
  };
}

// ---------------------------------------------------------------------------
// Footer data is fully dynamic — all content (links, social, contact info,
// app badges, copyright, logos) will be fetched from the backend /footer
// endpoint.  The mock data below simulates that API response so development
// can proceed without a running backend.  Replace with the real API call
// when the endpoint is available.
// ---------------------------------------------------------------------------

export const footerService = {
  getFooter: async (lang: string): Promise<FooterData> => {
    // Backend dev: uncomment when /footer endpoint is ready
    // const response = await apiFetch<ApiResponse<FooterData>>(
    //   "/footer",
    //   { lang },
    // );
    // return response.data;

    return getMockFooterData(lang);
  },
};

function getMockFooterData(lang: string): FooterData {
  const isAr = lang === "ar";

  return {
    columns: [
      { id: 1, title: null, links: [] },
      {
        id: 2,
        title: isAr ? "خدمة العملاء" : "Customer Service",
        links: [
          { id: 1, label: isAr ? "الخدمة والضمان" : "Service and Warranty", slug: "/info/service-warranty" },
          { id: 2, label: isAr ? "الإرجاع والاستبدال" : "Returns and Exchanges", slug: "/info/returns" },
          { id: 3, label: isAr ? "الدفع الآمن عبر الإنترنت" : "Secured Online Payment", slug: "/info/payment" },
          { id: 4, label: isAr ? "الشحن والتوصيل" : "Shipping & Delivery", slug: "/info/shipping" },
          { id: 5, label: isAr ? "الدفع عند الاستلام" : "Cash on Delivery", slug: "/info/cash-on-delivery" },
        ],
      },
      {
        id: 3,
        title: isAr ? "معلومات عنا" : "About Us",
        links: [
          { id: 6, label: isAr ? "عن سوق ميم الكويت" : "About Meem Market Kuwait", slug: "/info/about" },
          { id: 7, label: isAr ? "شركتنا" : "Our Company", slug: "/info/company" },
          { id: 8, label: isAr ? "المسؤولية المجتمعية" : "Community & Society", slug: "/info/community" },
          { id: 9, label: isAr ? "النشرة البريدية" : "Newsletter", slug: "/info/newsletter" },
        ],
      },
      {
        id: 4,
        title: isAr ? "نساعدك على التوفير" : "Helping You Save",
        links: [
          { id: 10, label: isAr ? "الضمان الممتد" : "Extended Warranty", slug: "/info/extended-warranty" },
          { id: 11, label: isAr ? "برنامج الولاء" : "Loyalty Program", slug: "/info/loyalty" },
        ],
      },
      {
        id: 5,
        title: isAr ? "المساعدة والدعم" : "Help & Support",
        links: [
          { id: 12, label: isAr ? "اتصل بنا" : "Contact Us", slug: "/info/contact" },
          { id: 13, label: isAr ? "الشروط والأحكام" : "Terms & Conditions", slug: "/info/terms" },
          { id: 14, label: isAr ? "إخلاء مسؤولية الاحتيال" : "Anti-Fraud Disclaimer", slug: "/info/anti-fraud" },
          { id: 15, label: isAr ? "سياسة الإفصاح المسؤول" : "Responsible Disclosure Policy", slug: "/info/disclosure" },
          { id: 16, label: isAr ? "الأسئلة الشائعة" : "FAQs", slug: "/info/faq" },
          { id: 17, label: isAr ? "ابحث عن متجر" : "Find A Store", slug: "/info/stores" },
          { id: 18, label: isAr ? "سياسة الخصوصية" : "Privacy Policy", slug: "/info/privacy" },
        ],
      },
    ],
    // Real social accounts are not configured yet. Empty by design so the
    // footer hides the "Stay connected" column instead of linking to "#".
    socialLinks: [],
    contactInfo: {
      stayInTouchText: isAr ? "ابق على تواصل معنا" : "Stay in touch with us",
      whatsappUrl: "https://wa.me/96522281130",
      assistanceText: isAr ? "تحدث معنا للمساعدة" : "Have a question? We are here to help.",
      callUsText: isAr ? "اتصل بنا للمساعدة" : "Call us for assistance",
      phoneNumber: "+965 2228 1130",
      email: "",
    },
    bottomRow: {
      title: isAr ? "حمل تطبيقنا" : "Download Our App",
      appStore: {
        platform: "ios",
        imageSrc: "/images/badges/app-store.svg",
        url: "",
        alt: "App Store",
      },
      googlePlay: {
        platform: "android",
        imageSrc: "/images/badges/play-store.svg",
        url: "https://play.google.com/store/apps/details?id=market.meem",
        alt: "Google Play",
      },
    },
    cookieSettingsLabel: isAr ? "إعدادات ملفات تعريف الارتباط" : "Cookie Settings",
  };
}
