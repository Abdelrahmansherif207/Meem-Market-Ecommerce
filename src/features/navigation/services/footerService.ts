import { apiFetch } from "@/shared/lib/api";
import type { ApiResponse } from "@/shared/types";
import type { FooterData } from "../types";

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
          { id: 6, label: isAr ? "عن كريم شوب" : "About Kareem Shop", slug: "/info/about" },
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
    socialLinks: [
      { platform: "facebook", url: "#", label: "Facebook" },
      { platform: "twitter", url: "#", label: "Twitter" },
      { platform: "instagram", url: "#", label: "Instagram" },
      { platform: "youtube", url: "#", label: "YouTube" },
    ],
    contactInfo: {
      stayInTouchText: isAr ? "ابق على تواصل معنا" : "Stay in touch with us",
      whatsappUrl: "https://api.whatsapp.com/send?phone=%2B201111185469",
      assistanceText: isAr ? "تحدث معنا للمساعدة" : "Chat with us for assistance",
      callUsText: isAr ? "اتصل بنا للمساعدة" : "Call us for assistance",
      phoneNumber: "16061",
    },
    bottomRow: {
      title: isAr ? "حمل تطبيقنا" : "Download Our App",
      appStore: {
        platform: "ios",
        imageSrc: "/images/badges/app-store.svg",
        url: "#",
        alt: "App Store",
      },
      googlePlay: {
        platform: "android",
        imageSrc: "/images/badges/play-store.svg",
        url: "#",
        alt: "Google Play",
      },
    },
    cookieSettingsLabel: isAr ? "إعدادات ملفات تعريف الارتباط" : "Cookie Settings",
  };
}
