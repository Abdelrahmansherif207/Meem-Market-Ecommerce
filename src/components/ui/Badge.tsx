import type { ReactNode } from "react";
import { cn } from "@/shared/utils/cn";

export type BadgeTone =
  | "discount"
  | "flash"
  | "success"
  | "error"
  | "neutral"
  | "violet"
  | "teal"
  | "rose"
  | "warning"
  | "dark"
  | "slate";

interface BadgeProps {
  tone?: BadgeTone;
  children: ReactNode;
  className?: string;
}

/**
 * Product/section badge using the canonical ProductCard badge shape:
 * asymmetric rounded corners, bold micro text.
 */
export function Badge({ tone = "neutral", children, className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center justify-center gap-1 rounded-bl-xl rounded-br-xs rounded-tl-xs rounded-tr-xl px-2 py-1 text-2xs font-bold leading-4",
        TONES[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

/**
 * Fixed palette — one color per badge type. Dark shades only: deliberately
 * excludes gold, brown, beige, orange, pink, and the primary brand blue.
 */
const TONES: Record<BadgeTone, string> = {
  /** Percentage discount — dark red. */
  discount: "bg-[#7f1d1d] text-white",
  /** Flash sale — dark violet. */
  flash: "bg-[#4c1d95] text-white",
  /** New — dark green. */
  success: "bg-[#14532d] text-white",
  error: "bg-[#450a0a] text-white",
  neutral: "bg-[#4b5563] text-white",
  /** Best seller — deep indigo. */
  violet: "bg-[#312e81] text-white",
  /** Free shipping — dark teal. */
  teal: "bg-[#134e4a] text-white",
  /** Hot / trending — deep cyan. */
  rose: "bg-[#164e63] text-white",
  /** Low stock / urgency — dark slate. */
  warning: "bg-[#334155] text-white",
  /** Limited / exclusive — near black. */
  dark: "bg-[#111827] text-white",
  /** Any other CMS badge — dark slate. */
  slate: "bg-[#3f3f46] text-white",
};

/**
 * Badge colors are assigned by badge TYPE, never randomly per product:
 *   Flash Sale      → dark violet
 *   Discount / OFF  → dark red
 *   New             → dark green
 *   Best Seller     → deep indigo
 *   Limited / Excl. → near black
 *   Hot / Trending  → deep cyan
 *   Free Shipping   → dark teal
 *   Low stock       → dark slate
 *   Anything else   → dark slate
 *
 * Dark shades only: no gold, brown, beige, orange, pink, or primary blue.
 * The seed argument is kept for call-site stability but intentionally unused.
 */
export function badgeToneFor(_seed: string | number, text?: string): BadgeTone {
  const t = (text ?? "").toLowerCase();
  if (/(flash|عرض سريع|فلاش)/.test(t)) return "flash";
  if (/(best|bestseller|top seller|الأكثر|الأفضل|الأعلى)/.test(t))
    return "violet";
  if (/(new|جديد)/.test(t)) return "success";
  if (/(limited|exclusive|حصري|محدود)/.test(t)) return "dark";
  if (/(hot|trending|شائع|رائج)/.test(t)) return "rose";
  if (/(free|مجاني)/.test(t)) return "teal";
  if (/(sale|off|discount|خصم|تخفيض|عرض)/.test(t)) return "discount";
  if (/(low stock|last chance|كمية|آخر)/.test(t)) return "warning";
  return "slate";
}

/** Raw tone classes for surfaces that draw their own badge shape. */
export function badgeToneClass(tone: BadgeTone): string {
  return TONES[tone];
}
