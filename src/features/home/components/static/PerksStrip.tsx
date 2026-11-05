import { ShieldCheck, Truck, Wallet, RotateCcw } from "lucide-react";
import { getTranslations } from "next-intl/server";

/**
 * Stitch value-proposition strip — four informational perks in a white
 * elevated card. Marketing copy only (static section, no API equivalent).
 */

export default async function PerksStrip({
  locale,
}: {
  locale: string;
}) {
  const t = await getTranslations({ locale, namespace: "home.perks" });

  const perks = [
    { icon: ShieldCheck, title: t("genuine.title"), desc: t("genuine.desc") },
    { icon: Truck, title: t("delivery.title"), desc: t("delivery.desc") },
    { icon: Wallet, title: t("payments.title"), desc: t("payments.desc") },
    { icon: RotateCcw, title: t("returns.title"), desc: t("returns.desc") },
  ];

  return (
    <section className="home-container" aria-label="Value highlights">
      <div className="grid grid-cols-1 rounded-xl bg-white p-5 shadow-[0_1px_8px_rgba(0,0,0,0.04)] sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {perks.map((perk) => (
          <div key={perk.title} className="flex items-center gap-4">
            <div className="home-perk-chip">
              <perk.icon className="size-[26px]" aria-hidden />
            </div>
            <div className="min-w-0">
              <h4 className="text-base font-bold text-(--home-ink)">
                {perk.title}
              </h4>
              <p className="mt-0.5 text-[12px] leading-[18px] text-(--home-ink-muted) line-clamp-2">
                {perk.desc}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
