"use client";

import { Timer } from "lucide-react";
import { useTranslations } from "next-intl";

import { useCountdown } from "@/features/flash-sales/hooks/useCountdown";

interface HomeCountdownProps {
  /** ISO end date of the active flash sale (real backend data). */
  endsAt: string;
}

/**
 * Sovereign Rose glass countdown chip (Stitch: "Daily Flash Deals" timer).
 * Blocks sit on the canvas-deep surface, seconds tinted rose; the whole
 * chip mounts on a frosted surface. Hides itself once the sale expires.
 */
export default function HomeCountdown({ endsAt }: HomeCountdownProps) {
  const t = useTranslations("home.flip");
  const { days, hours, minutes, seconds, isExpired } = useCountdown(endsAt);

  if (isExpired) return null;

  const blocks = [
    { key: "d", value: days, label: t("days"), visible: days > 0 },
    { key: "h", value: hours, label: t("hours"), visible: true },
    { key: "m", value: minutes, label: t("minutes"), visible: true },
    {
      key: "s",
      value: seconds,
      label: t("seconds"),
      visible: true,
      hot: true,
    },
  ].filter((block) => block.visible);

  return (
    <div className="home-glass flex items-center gap-2 rounded-xl border border-(--home-stroke) px-3 py-1.5 shadow-sm">
      <span className="flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wider text-text-secondary">
        <Timer className="size-4 text-(--home-rose)" aria-hidden />
        {t("endsIn")}
      </span>
      <div className="home-numeric flex items-center gap-1 text-sm font-bold">
        {blocks.map((block, index) => (
          <span key={block.key} className="flex items-center gap-1">
            <span
              role="timer"
              aria-label={block.label}
              className={`min-w-8 rounded bg-(--home-canvas-deep) px-1.5 py-1 text-center text-(--home-ink) ${
                block.hot ? "text-(--home-rose-deep)" : ""
              }`}
            >
              <span aria-hidden>{String(block.value).padStart(2, "0")}</span>
            </span>
            {index < blocks.length - 1 && (
              <span aria-hidden className="text-black/30">
                :
              </span>
            )}
          </span>
        ))}
      </div>
    </div>
  );
}
