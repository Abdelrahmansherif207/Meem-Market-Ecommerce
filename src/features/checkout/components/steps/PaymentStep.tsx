"use client";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { Loader2 } from "lucide-react";
import { PromotionsPanel } from "../PromotionsPanel";
import type { CheckoutFormData, EligiblePromotion, PaymentGatewayOption, PaymentMethod } from "../../types";
import type { CheckoutFormController } from "../../hooks/useCheckoutForm";
import { SectionHeader, inputClass, radioClass } from "./stepStyles";

const GATEWAY_LOGOS: { match: RegExp; src: string; alt: string }[] = [
  { match: /stripe/i, src: "/stripe-Logo.png", alt: "Stripe" },
  { match: /fatoorah/i, src: "/myfatoorah-logo.webp", alt: "MyFatoorah" },
];

function gatewayLogo(code: string, displayName: string) {
  const text = `${code} ${displayName}`;
  return GATEWAY_LOGOS.find((logo) => logo.match.test(text)) ?? null;
}

interface PaymentStepProps {
  form: CheckoutFormData;
  controller: CheckoutFormController;
  gateways: PaymentGatewayOption[] | null;
  gatewaysError: boolean;
  onRetryGateways: () => void;
  selectedGateway: string | null;
  onSelectGateway: (code: string) => void;
  promotions: EligiblePromotion[] | null;
  promotionsError: boolean;
  onRetryPromotions: () => void;
}

export function PaymentStep({
  form,
  controller,
  gateways,
  gatewaysError,
  onRetryGateways,
  selectedGateway,
  onSelectGateway,
  promotions,
  promotionsError,
  onRetryPromotions,
}: PaymentStepProps) {
  const t = useTranslations("checkout");

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border-2 border-border bg-white p-6 space-y-4">
        <SectionHeader title={t("paymentMethod")} />
        <fieldset className="space-y-2">
          <legend className="sr-only">{t("paymentMethod")}</legend>
          {((form.fulfillment_type === "delivery"
            ? ["online", "cod"]
            : ["online", "pay_at_cashier"]) as PaymentMethod[]).map((method) => (
            <label
              key={method}
              className={`flex items-center gap-3 rounded-xl border p-4 cursor-pointer transition-colors ${
                form.payment_method === method
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/50"
              }`}
            >
              <input
                type="radio"
                name="payment_method"
                checked={form.payment_method === method}
                onChange={() => controller.setPaymentMethod(method)}
                className={radioClass}
              />
              <div>
                <span className="text-sm font-medium text-text-primary">{t(`${method}Label`)}</span>
                <p className="text-xs text-text-secondary mt-0.5">{t(`${method}Desc`)}</p>
              </div>
            </label>
          ))}
        </fieldset>

        {form.payment_method === "online" && (
          <div className="border-t border-border pt-3">
            {gateways === null && !gatewaysError && (
              <div className="flex items-center justify-center gap-2 py-2 text-sm text-text-secondary">
                <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                {t("loadingPaymentGateways")}
              </div>
            )}
            {gatewaysError && (
              <div className="flex items-center justify-between gap-2 rounded-xl bg-error/5 px-3 py-2 text-sm text-error">
                <span>{t("paymentGatewaysError")}</span>
                <button type="button" onClick={onRetryGateways} className="font-semibold underline">
                  {t("retry")}
                </button>
              </div>
            )}
            {gateways !== null && !gatewaysError && gateways.length === 0 && (
              <p className="py-1 text-sm text-text-secondary">{t("onlineUnavailable")}</p>
            )}
            {gateways !== null && !gatewaysError && gateways.length > 0 && (
              <>
                <p className="text-sm font-semibold text-text-primary">{t("paymentGatewayLabel")}</p>
                <fieldset className="mt-2 grid grid-cols-3 gap-2 sm:grid-cols-4 lg:grid-cols-5">
                  <legend className="sr-only">{t("paymentGatewayLabel")}</legend>
                  {gateways.map((gateway) => {
                    const logo = gatewayLogo(gateway.code, gateway.display_name);
                    return (
                      <label
                        key={gateway.code}
                        className="flex w-full cursor-pointer flex-col"
                      >
                        <span
                          className={`relative block w-full aspect-square overflow-hidden rounded-xl bg-white ${
                            selectedGateway === gateway.code
                              ? "border-2 border-primary"
                              : "border border-border-light hover:border-primary/50"
                          }`}
                        >
                          <input
                            type="radio"
                            name="gateway"
                            checked={selectedGateway === gateway.code}
                            onChange={() => onSelectGateway(gateway.code)}
                            aria-label={gateway.display_name}
                            className="absolute top-2 end-2 z-10 h-3.5 w-3.5 shrink-0 accent-primary"
                          />
                          {logo ? (
                            <Image
                              src={logo.src}
                              alt={logo.alt}
                              fill
                              sizes="(max-width: 640px) 50vw, 30vw"
                              className="object-contain p-4"
                            />
                          ) : (
                            <span className="absolute inset-0 flex items-center justify-center p-6">
                              <span className="h-3 w-3/4 rounded bg-surface" aria-hidden="true" />
                            </span>
                          )}
                        </span>
                        <span className="mt-2 line-clamp-1 text-center text-xs font-medium leading-4 text-text-primary">
                          {gateway.display_name}
                        </span>
                      </label>
                    );
                  })}
                </fieldset>
              </>
            )}
          </div>
        )}
      </div>

      <div className="rounded-2xl border-2 border-border bg-white p-6 space-y-3">
        <SectionHeader title={t("notes")} />
        <textarea
          className={`${inputClass} min-h-[80px] resize-none`}
          placeholder={t("notesPlaceholder")}
          value={form.notes}
          onChange={controller.setField("notes")}
        />
      </div>

      <PromotionsPanel
        promotions={promotions}
        error={promotionsError}
        onRetry={onRetryPromotions}
        selectedId={form.selected_promotion_id}
        onSelect={controller.handlePromotionSelect}
      />
    </div>
  );
}
