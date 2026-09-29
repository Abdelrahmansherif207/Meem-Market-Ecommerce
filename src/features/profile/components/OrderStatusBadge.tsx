"use client";

import { useLocale, useTranslations } from "next-intl";

type Localized = { en?: string; ar?: string } | null | undefined;

/**
 * Color map for the known legacy catalog codes. Any other (newer) code gets a
 * neutral badge and must never break rendering.
 */
const LEGACY_STATUS_COLORS: Record<string, string> = {
  completed: "bg-green-100 text-success",
  pending: "bg-amber-100 text-amber-700",
  cancelled: "bg-red-100 text-red-700",
  processing: "bg-blue-100 text-blue-700",
  delivered: "bg-purple-100 text-purple-700",
};

/** `customs_clearance` → "Customs Clearance" (code itself is never translated). */
export function prettifyStatusCode(code: string): string {
  return code
    .replace(/[_-]+/g, " ")
    .trim()
    .replace(/\b\p{L}/gu, (c) => c.toUpperCase());
}

type FlowLocalized = { en?: string; ar?: string } | null | undefined;

/** Localized object → display string with en↔ar fallback. */
export function resolveLocalizedName(name: FlowLocalized, locale: string): string {
  if (!name) return "";
  const primary = locale === "ar" ? name.ar : name.en;
  const fallback = locale === "ar" ? name.en : name.ar;
  return primary || fallback || "";
}

/**
 * Shipping chip label: prefer the flow's localized name, else prettify the
 * machine shipping_type/flow code (never translated).
 */
export function resolveShippingChipLabel(
  order: {
    flow?: { code: string; name?: FlowLocalized; shipping_type: string } | null;
    shipping_type?: string | null;
  },
  locale: string,
  translate: (key: string, values?: Record<string, string>) => string,
): string | null {
  const shippingType = order.shipping_type ?? order.flow?.shipping_type ?? null;
  if (!shippingType) return null;
  const flowName = resolveLocalizedName(order.flow?.name, locale);
  const value = flowName || prettifyStatusCode(shippingType);
  return translate("shippingChip", { value });
}

export function resolveOrderStatusCode(order: {
  status: string;
  current_status?: { code: string } | null;
}): string {
  return order.current_status?.code ?? order.status;
}

function resolveStatusName(name: Localized, locale: string): string {
  if (!name) return "";
  const primary = locale === "ar" ? name.ar : name.en;
  const fallback = locale === "ar" ? name.en : name.ar;
  return primary || fallback || "";
}

export function resolveOrderStatusLabel(
  order: { status: string; current_status?: { code: string; name?: Localized } | null },
  locale: string,
  translate: (key: string) => string,
): string {
  const code = resolveOrderStatusCode(order);
  const name = resolveStatusName(order.current_status?.name, locale);
  if (name) return name;
  const localized = translate(`status.${code}`);
  // next-intl falls back to the key path when missing — detect and prettify.
  if (localized === `status.${code}` || localized === code) {
    return prettifyStatusCode(code);
  }
  return localized;
}

interface OrderStatusBadgeProps {
  order: { status: string; current_status?: { code: string; name?: Localized } | null };
  className?: string;
}

export function OrderStatusBadge({ order, className }: OrderStatusBadgeProps) {
  const t = useTranslations("profile.orders");
  const locale = useLocale();
  const code = resolveOrderStatusCode(order);
  const label = resolveOrderStatusLabel(order, locale, (key) => t(key, { defaultValue: "" }));
  const colorClass = LEGACY_STATUS_COLORS[code] ?? "bg-surface text-text-primary";

  return (
    <span
      className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${colorClass} ${className ?? ""}`}
      title={code}
    >
      {label || prettifyStatusCode(code)}
    </span>
  );
}
