import { Link } from "@/i18n/navigation";
import { getTranslations } from "next-intl/server";

import type { SVGProps } from "react";/* Design-crafted visuals exported with the Stitch screen. Public Google
 * CDN images that ship with the approved design file. */
const CARD1_IMAGE =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuBCUEL8-KqZ8QE3r_6kL2f1xI0RN-TgDjmQBiG8X8LtPe7Q1mbJ2d3dNh7DSxjMbuPeI8dZ0oL2N_nCe1SlvWZtSr1qyNzTG07M7izYkPRq6amnpGS6J7QJDC-ixJM78SCKu2d7K3NhLlEtM3rerk5GSLYnuxuoY9batY-pXakDb7tU0v-4h0Clg9-qy568DDgqwuQbY72Wnh55WNJ7DYtQDsDYpQekGoKhIWAnBK0";

const CARD2_IMAGE =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuB-m8mKklwx5otBCBTLIGbIWC7VsCtrLVFSsucnn0k5i-5HKgVTf2lajnDXJSo1NHJwAy7czdhvLsADX04LDMwOMbitXsZ71Mz88GBVQtjOANWMcOq-EVqaM6ljo8xZFX1Cf4ViDJ3USk_lvF9VXp4ogtAFTKs7QDyGhmhybfoxC2Ca2W0cD9ai1dim4vh4B08S8S3Ln8ZrQFn60iU2LYnk3WVsexBf8XRAdfgpUdg";

export default function HeroEditorialCards() {
  return <EditorialCards />;
}

async function EditorialCards() {
  const t = await getTranslations("home.heroEditorial");

  return (
    <>
      {/* Card 1 — K-Beauty (light editorial) */}
      <Link
        href="/tags"
        className="group relative flex min-h-[200px] flex-1 flex-col justify-between overflow-hidden rounded-xl bg-[#f4f3f1] p-5 transition-shadow hover:shadow-[0_12px_32px_-8px_rgba(18,18,20,0.06)]"
      >
        <span
          aria-hidden
          className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
          style={{ backgroundImage: `url('${CARD1_IMAGE}')` }}
        />
        <span
          aria-hidden
          className="absolute inset-0 bg-gradient-to-r from-white/95 via-white/70 to-transparent"
        />
        <span className="relative z-10">
          <span className="block text-[11px] font-bold uppercase tracking-wider text-[#d88b97]">
            {t("card1.eyebrow")}
          </span>
          <span className="mt-1 block home-display text-lg leading-snug text-(--home-ink) line-clamp-2">
            {t("card1.title")}
          </span>
          <span className="mt-1 block text-[12px] leading-[18px] text-[#47464a]">
            {t("card1.desc")}
          </span>
        </span>
        <span className="relative z-10 pt-3 inline-flex items-center gap-1 text-[13px] font-bold text-(--home-ink) transition-all group-hover:gap-2">
          {t("card1.cta")}
          <Caret />
        </span>
      </Link>

      {/* Card 2 — Makeup studio (dark editorial) */}
      <Link
        href="/categories"
        className="group relative flex min-h-[200px] flex-1 flex-col justify-between overflow-hidden rounded-xl bg-(--home-primary) p-5 text-white transition-shadow hover:shadow-[0_12px_32px_-8px_rgba(18,18,20,0.2)]"
      >
        <span
          aria-hidden
          className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
          style={{ backgroundImage: `url('${CARD2_IMAGE}')` }}
        />
        <span
          aria-hidden
          className="absolute inset-0 bg-gradient-to-r from-(--home-primary)/95 via-(--home-primary)/75 to-transparent"
        />
        <span className="relative z-10">
          <span className="block text-[11px] font-bold uppercase tracking-wider text-[#e0c298]">
            {t("card2.eyebrow")}
          </span>
          <span className="mt-1 block home-display text-lg leading-snug text-white line-clamp-2">
            {t("card2.title")}
          </span>
          <span className="mt-1 block text-[12px] leading-[18px] text-white/70">
            {t("card2.desc")}
          </span>
        </span>
        <span className="relative z-10 pt-3 inline-flex items-center gap-1 text-[13px] font-bold text-[#e0c298] transition-all group-hover:gap-2">
          {t("card2.cta")}
          <Caret />
        </span>
      </Link>
    </>
  );
}

function Caret(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4 rtl:rotate-180"
      aria-hidden
      {...props}
    >
      <path d="M5 12h14" />
      <path d="m12 5 7 7-7 7" />
    </svg>
  );
}
