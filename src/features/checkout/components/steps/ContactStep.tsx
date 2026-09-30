"use client";
import { useTranslations } from "next-intl";
import { ShippingTypeSelector } from "../ShippingTypeSelector";
import type { CheckoutFormData, ShippingType } from "../../types";
import type { CheckoutFormController } from "../../hooks/useCheckoutForm";
import { FieldErrorText, SectionHeader, fieldClasses } from "./stepStyles";

interface ContactStepProps {
  form: CheckoutFormData;
  controller: CheckoutFormController;
  availableShippingTypes: ShippingType[];
}

export function ContactStep({ form, controller, availableShippingTypes }: ContactStepProps) {
  const t = useTranslations("checkout");

  return (
    <div className="space-y-6">
      <ShippingTypeSelector
        value={form.shipping_type}
        available={availableShippingTypes}
        onChange={controller.setShippingType}
      />

      <div className="rounded-2xl border-2 border-border bg-white p-6 space-y-5">
        <SectionHeader title={t("contactInfo")} />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2 space-y-1.5">
            <label className="text-sm font-semibold text-text-primary">{t("name")}</label>
            <input
              name="name"
              className={fieldClasses(!!controller.fieldError("name"))}
              value={form.name}
              onChange={controller.setField("name")}
            />
            <FieldErrorText message={controller.fieldError("name")} />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-text-primary">{t("phone")}</label>
            <input
              name="user_phone"
              className={fieldClasses(!!controller.fieldError("user_phone"))}
              value={form.user_phone}
              onChange={controller.setField("user_phone")}
            />
            <FieldErrorText message={controller.fieldError("user_phone")} />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-text-primary">{t("email")}</label>
            <input
              name="user_email"
              type="email"
              className={fieldClasses(!!controller.fieldError("user_email"))}
              value={form.user_email}
              onChange={controller.setField("user_email")}
            />
            <FieldErrorText message={controller.fieldError("user_email")} />
          </div>
        </div>
      </div>
    </div>
  );
}
