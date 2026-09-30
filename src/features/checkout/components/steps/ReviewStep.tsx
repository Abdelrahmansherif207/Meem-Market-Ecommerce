"use client";
import { useLocale, useTranslations } from "next-intl";
import { Check, Pencil } from "lucide-react";
import type { CheckoutFormData, EligiblePromotion, FlowValue, Governorate, OrderFlowDefinition, PaymentGatewayOption } from "../../types";
import { flowDisplayValue, flowLabel } from "../../schemas/checkoutSchema";
import type { CheckoutFormController } from "../../hooks/useCheckoutForm";
import { SectionHeader } from "./stepStyles";

export type ReviewSectionId = "contact" | "delivery" | "payment";

interface ReviewStepProps {
  isFast?: boolean;
  form: CheckoutFormData;
  flow: OrderFlowDefinition | null;
  flowValues: Record<string, FlowValue>;
  controller: CheckoutFormController;
  selectedGovernorateId: number | null;
  governorates: Governorate[];
  selectedGateway: string | null;
  gateways: PaymentGatewayOption[] | null;
  promotions: EligiblePromotion[] | null;
  pickupLocationName: string;
  onEdit: (section: ReviewSectionId) => void;
  submitting: boolean;
  submitDisabled: boolean;
}

function ReviewRow({
  label,
  value,
  onEdit,
  last = false,
}: {
  label: string;
  value: string;
  onEdit: () => void;
  last?: boolean;
}) {
  return (
    <div className={`flex items-start justify-between gap-4 py-3 ${last ? "" : "border-b border-border"}`}>
      <div className="min-w-0">
        <p className="text-xs font-semibold uppercase tracking-wide text-text-secondary">{label}</p>
        <p className="mt-1 text-sm text-text-primary whitespace-pre-line break-words">{value}</p>
      </div>
      <button
        type="button"
        onClick={onEdit}
        aria-label={`${label} — edit`}
        className="inline-flex shrink-0 items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold text-primary transition-colors hover:bg-primary/5"
      >
        <Pencil className="size-3.5" aria-hidden="true" />
      </button>
    </div>
  );
}

export function ReviewStep({
  isFast,
  form,
  flow,
  flowValues,
  selectedGovernorateId,
  governorates,
  selectedGateway,
  gateways,
  promotions,
  pickupLocationName,
  onEdit,
  submitting,
  submitDisabled,
}: ReviewStepProps) {
  const t = useTranslations("checkout");
  const locale = useLocale();

  const shippingTypeLabel = form.shipping_type === "international" ? t("shippingType.international") : t("shippingType.local");
  const fulfillmentLabel =
    isFast || form.fulfillment_type === "delivery"
      ? t("delivery")
      : `${t("pickup")}${pickupLocationName ? ` — ${pickupLocationName}` : ""}`;

  const selectedGovernorate = governorates.find((g) => g.id === selectedGovernorateId);
  const addressValue = form.fulfillment_type === "delivery" || isFast
    ? [
        form.street_address,
        form.city,
        selectedGovernorate?.name,
        form.country,
      ].filter((part) => part?.trim()).join(", ") || "—"
    : pickupLocationName || "—";

  const gatewayName = gateways?.find((g) => g.code === selectedGateway)?.display_name;
  const methodValue =
    form.payment_method === "online"
      ? `${t("onlineLabel")}${gatewayName ? ` — ${gatewayName}` : ""}`
      : form.payment_method === "cod"
        ? t("codLabel")
        : t("pay_at_cashierLabel");

  const selectedPromotion = promotions?.find((p) => p.id === form.selected_promotion_id) ?? null;

  const scalarFlowEntries = (flow?.inputs ?? [])
    .map((input) => {
      const value = flowValues[input.key];
      return { input, display: value !== undefined ? flowDisplayValue(input, value) : null };
    })
    .filter((entry) => entry.display !== null);

  const flowSummary = scalarFlowEntries
    .map((entry) => `${flowLabel(entry.input, locale)}: ${entry.display}`)
    .join("\n");

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border-2 border-border bg-white p-6">
        <SectionHeader title={t("review.title")} />
        <div className="mt-2">
          <ReviewRow
            label={t("contactInfo")}
            value={[form.name, form.user_phone, form.user_email].filter((v) => v.trim()).join("\n")}
            onEdit={() => onEdit("contact")}
          />
          <ReviewRow
            label={t("shippingType")}
            value={shippingTypeLabel}
            onEdit={() => onEdit("contact")}
          />
          <ReviewRow
            label={t("fulfillmentType")}
            value={fulfillmentLabel}
            onEdit={() => onEdit("delivery")}
          />
          <ReviewRow
            label={t("addressTitle")}
            value={addressValue}
            onEdit={() => onEdit("delivery")}
          />
          {flowSummary && (
            <ReviewRow
              label={t("flowInputs.title")}
              value={flowSummary}
              onEdit={() => onEdit("delivery")}
            />
          )}
          {!isFast && (
            <ReviewRow
              label={t("paymentMethod")}
              value={methodValue}
              onEdit={() => onEdit("payment")}
            />
          )}
          {!isFast && (
            <ReviewRow
              label={t("promotions")}
              value={selectedPromotion ? selectedPromotion.title : t("review.noPromotion")}
              onEdit={() => onEdit("payment")}
            />
          )}
          <ReviewRow
            label={t("notes")}
            value={form.notes.trim() || t("review.noNotes")}
            onEdit={() => onEdit("payment")}
            last
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={submitDisabled}
        aria-busy={submitting}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3.5 text-sm font-bold text-white transition-all hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <Check className="size-4" aria-hidden="true" />
        {isFast
          ? t("fastCheckout")
          : form.payment_method === "online"
            ? t("payNow")
            : form.payment_method === "cod"
              ? t("placeOrderCod")
              : t("placeOrderCashier")}
      </button>
    </div>
  );
}
