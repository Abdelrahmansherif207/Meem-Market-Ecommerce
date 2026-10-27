/**
 * Locale-aware brand fallbacks used when backend settings are unavailable
 * (GET /general/settings). Pure constants — safe to import from both server
 * and client components without pulling services into the client bundle.
 */

export const DEFAULT_SITE_NAME: Record<string, string> = {
  ar: "روض الأصيل",
  en: "Rawd Al-Aseel",
};

export const DEFAULT_SITE_DESCRIPTION: Record<string, string> = {
  ar: "تسوّق أفضل المنتجات من روض الأصيل — جودة مضمونة بمعايير الصناعة السعودية، مع حلول تعبئة وتغليف وإنتاج متكاملة",
  en: "Shop the best products at Rawd Al-Aseel — quality guaranteed to Saudi industrial standards, backed by integrated packaging and production solutions.",
};

export const DEFAULT_FAVICON = "/raowdalaseel-logo.png";
export const DEFAULT_LOGO = "/raowdalaseel-logo.png";
export const DEFAULT_FOOTER_LOGO = "/raowdalaseel-logo.png";
