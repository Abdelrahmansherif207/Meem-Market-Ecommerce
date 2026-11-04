import Image from "next/image";
import { getTranslations } from "next-intl/server";

/**
 * Stitch "Catch Beauty Journal" — three editorial story cards. The backend
 * has no blog/articles API, so this is a purely decorative static section:
 * visuals and copy ship with the design, and cards are intentionally not
 * links (there is no real destination to point at).
 */

const ARTICLES = [
  {
    key: "one" as const,
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCNlop8xiN88d7GFoEsrxXvVZTV9Y27ykuQZAONjvCblfV2rOigXtkeA6loJBEfxNu9GJ0cS0mj3lwssQcCrpwRavR41MXqq7-dWbItIvCFVkn2ae0FcMgUJ8Wrt2tDsfBVevbv1FXX9A70VSVabu4_kSROwEiaz6fig0Rou3ApBhCwR7D1IhI7Vomn6FywVoagN0Hy2byldFpA4mDYxxV_sXoedTdTdKLc-eBaNXE",
  },
  {
    key: "two" as const,
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAEFQGbd3No8RYn6zF2-zjKOKhcMeyOD-2Y2uB8NLj9-cWa9Hg0YSarBDs6vZ9XWSvWTSEaQyy8_3nkmAf4xoVLEvv42Ld_HQV8Jo7R3dWO1x0jZvM3pWasQLa0TOkBS15Fm3l8AAdtZPlQkpLZM_ZBKjFkLJf1w3D_gQ_P5AVKh7r6Np20bteh0o0X75-t0pvPDWc9o4L0IOC0Z7b1aWpnehyfCfP6WxtbW181ARs",
  },
  {
    key: "three" as const,
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuB0pHiJ3NfwOK3ROrWyV6hP1yEiHGpsQdDZrfQvp2Q8wGCSYi_ZWaqN5YSeEbmaerWldQzXUqzdc0DFrErKHYagQeISW6wCstpd1PVj9fUTkqt76Qkcu0Ge4Vpk2sd0I6srcfB15_xLaZvCNJElPXS7mdkYKtpJWYC0-c8PbUpB2dDx_W0y5_FuDBVI-1JENUQdMMZZrJvmo7boeyhXL_b8m5Ivu0TLyGVAnLwvAKs",
  },
];

export default async function BeautyJournal({
  locale,
}: {
  locale: string;
}) {
  const t = await getTranslations({ locale, namespace: "home.journal" });

  return (
    <section className="home-container" aria-label={t("title")}>
      <div className="flex flex-col justify-between gap-2 pb-4 sm:flex-row sm:items-center">
        <div>
          <h3 className="home-display text-[22px] font-semibold leading-[28px] text-(--home-ink)">
            {t("title")}
          </h3>
          <p className="mt-0.5 text-[12px] leading-[18px] text-(--home-ink-muted)">
            {t("subtitle")}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {ARTICLES.map((article) => (
          <article
            key={article.key}
            className="flex flex-col justify-between overflow-hidden rounded-xl bg-white shadow-[0_1px_8px_rgba(0,0,0,0.04)] transition-shadow hover:shadow-[0_12px_32px_-8px_rgba(18,18,20,0.06)]"
          >
            <div>
              <div className="h-52 w-full overflow-hidden bg-(--home-canvas-deep)">
                <Image
                  src={article.image}
                  alt={t(`articles.${article.key}.title`)}
                  width={640}
                  height={416}
                  loading="lazy"
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="p-4 pb-0">
                <div className="mb-1 flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-(--home-ink-muted)">
                  <span>{t(`articles.${article.key}.category`)}</span>
                  <span aria-hidden>•</span>
                  <span>{t(`articles.${article.key}.readTime`)}</span>
                </div>
                <h4 className="text-lg font-[700] leading-snug text-(--home-ink)">
                  {t(`articles.${article.key}.title`)}
                </h4>
                <p className="mt-2 line-clamp-2 text-[12px] leading-[18px] text-text-secondary">
                  {t(`articles.${article.key}.excerpt`)}
                </p>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
