"use client";
import { useTranslations } from "next-intl";
import { MapPin, Truck } from "lucide-react";
import Skeleton from "@/components/ui/Skeleton";
import { PickupSelector } from "../PickupSelector";
import { FlowInputsSection } from "../FlowInputsSection";
import type { CheckoutFormData, Governorate, OrderFlowDefinition } from "../../types";
import type { CheckoutFormController } from "../../hooks/useCheckoutForm";
import type { Address } from "@/features/profile/types";
import { FieldErrorText, SectionHeader, fieldClasses, inputClass, labelClass } from "./stepStyles";

interface DeliveryStepProps {
  isFast?: boolean;
  form: CheckoutFormData;
  controller: CheckoutFormController;
  /** Resolved governorate id (manual pick or auto-matched from saved address). */
  selectedGovernorateId: number | null;
  governorates: Governorate[];
  governoratesLoading: boolean;
  governoratesError: boolean;
  onRetryGovernorates: () => void;
  savedAddresses: Address[];
  addressesLoading: boolean;
  addressesError: boolean;
  onRetryAddresses: () => void;
  flow: OrderFlowDefinition | null;
  flowError: boolean;
  onFulfillmentChange: (type: "delivery" | "pickup") => void;
}

export function DeliveryStep({
  isFast,
  form,
  controller,
  selectedGovernorateId,
  governorates,
  governoratesLoading,
  governoratesError,
  onRetryGovernorates,
  savedAddresses,
  addressesLoading,
  addressesError,
  onRetryAddresses,
  flow,
  flowError,
  onFulfillmentChange,
}: DeliveryStepProps) {
  const t = useTranslations("checkout");
  const locationT = useTranslations("locationPicker");

  return (
    <div className="space-y-6">
      {flowError && (
        <div
          role="status"
          className="rounded-xl border-2 border-border bg-surface px-4 py-3 text-sm text-text-secondary"
        >
          {t("flowInputs.loadError")}
        </div>
      )}

      <div className="rounded-2xl border-2 border-border bg-white p-6 space-y-4">
        <SectionHeader title={isFast ? t("fastDelivery") : t("fulfillmentType")} />

        {!isFast && (
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => onFulfillmentChange("delivery")}
              className={`flex-1 flex items-center justify-center gap-2 rounded-xl border-2 p-4 text-sm font-semibold transition-colors ${
                form.fulfillment_type === "delivery"
                  ? "border-primary bg-primary/5 text-primary"
                  : "border-border text-text-secondary hover:border-primary/50"
              }`}
            >
              <Truck className="size-5" aria-hidden="true" />
              {t("delivery")}
            </button>
            <button
              type="button"
              onClick={() => onFulfillmentChange("pickup")}
              className={`flex-1 flex items-center justify-center gap-2 rounded-xl border-2 p-4 text-sm font-semibold transition-colors ${
                form.fulfillment_type === "pickup"
                  ? "border-primary bg-primary/5 text-primary"
                  : "border-border text-text-secondary hover:border-primary/50"
              }`}
            >
              <MapPin className="size-5" aria-hidden="true" />
              {t("pickup")}
            </button>
          </div>
        )}

        {(form.fulfillment_type === "delivery" || isFast) && (
          <div className={isFast ? "space-y-4" : "border-t border-border pt-4 space-y-4"}>
            <h3 className="text-xs font-bold uppercase tracking-wider text-text-secondary">
              {isFast ? t("fastDelivery") : t("addressTitle")}
            </h3>

            {addressesLoading ? (
              <Skeleton className="h-10 w-full rounded-xl" />
            ) : addressesError ? (
              <div className="space-y-2">
                <p className="text-xs text-error">{t("addressesError")}</p>
                <button
                  type="button"
                  onClick={onRetryAddresses}
                  className="text-xs font-semibold text-primary underline underline-offset-2"
                >
                  {t("governorateRetry")}
                </button>
              </div>
            ) : savedAddresses.length > 0 && (
              <div className="space-y-1.5">
                <label className={labelClass}>{t("savedAddresses")}</label>
                <select
                  className={inputClass}
                  value={controller.selectedAddressId ?? ""}
                  onChange={(e) => controller.selectAddress(e.target.value ? Number(e.target.value) : null, savedAddresses)}
                >
                  <option value="">{t("newAddress")}</option>
                  {savedAddresses.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.title}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {controller.selectedAddressId === null && (
              <div className="space-y-1.5">
                <label className={labelClass}>{locationT("addressTitle")}</label>
                <input
                  className={inputClass}
                  value={controller.addressTitle}
                  onChange={(e) => controller.setAddressTitle(e.target.value)}
                  placeholder={locationT("addressTitlePlaceholder")}
                />
              </div>
            )}

            <div className="space-y-1.5">
              <label className={labelClass}>{t("governorate")}</label>
              {governoratesLoading ? (
                <select disabled className={inputClass}>
                  <option>{t("governorateLoading")}</option>
                </select>
              ) : governoratesError ? (
                <div className="space-y-2">
                  <p className="text-xs text-error">{t("governorateError")}</p>
                  <button
                    type="button"
                    onClick={onRetryGovernorates}
                    className="text-xs font-semibold text-primary underline underline-offset-2"
                  >
                    {t("governorateRetry")}
                  </button>
                </div>
              ) : governorates.length === 0 ? (
                <p className="text-xs text-text-secondary">{t("governorateEmpty")}</p>
              ) : (
                <>
                  <select
                    name="governorate_id"
                    className={fieldClasses(!!controller.fieldError("governorate_id"))}
                    value={selectedGovernorateId ?? ""}
                    onChange={(e) => controller.setGovernorate(e.target.value ? Number(e.target.value) : null)}
                  >
                    <option value="">{t("governoratePlaceholder")}</option>
                    {governorates.map((g) => (
                      <option key={g.id} value={g.id}>
                        {g.name}
                      </option>
                    ))}
                  </select>
                  <FieldErrorText message={controller.fieldError("governorate_id")} />
                </>
              )}
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="space-y-1.5">
                <label className={labelClass}>{t("country")}</label>
                <input
                  name="country"
                  className={fieldClasses(!!controller.fieldError("country"))}
                  value={form.country}
                  onChange={controller.setField("country")}
                />
                <FieldErrorText message={controller.fieldError("country")} />
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <label className={labelClass}>{t("city")}</label>
                <input
                  name="city"
                  className={fieldClasses(!!controller.fieldError("city"))}
                  value={form.city}
                  onChange={controller.setField("city")}
                />
                <FieldErrorText message={controller.fieldError("city")} />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className={labelClass}>{t("streetAddress")}</label>
              <input
                name="street_address"
                className={fieldClasses(!!controller.fieldError("street_address"))}
                value={form.street_address}
                onChange={controller.setField("street_address")}
              />
              <FieldErrorText message={controller.fieldError("street_address")} />
            </div>

            <button
              type="button"
              onClick={controller.openMapModal}
              className="flex items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border px-4 py-3 text-sm font-semibold text-primary transition-all hover:border-primary hover:bg-primary/5"
            >
              <MapPin className="size-4" aria-hidden="true" />
              {t("pickOnMap")}
            </button>
          </div>
        )}

        {form.fulfillment_type === "pickup" && (
          <PickupSelector onSelect={controller.setPickupLocationName} />
        )}
      </div>

      {flow && (
        <FlowInputsSection
          inputs={flow.inputs ?? []}
          values={controller.flowValues}
          errors={(flow.inputs ?? [])
            .filter((input) => controller.flowErrorFor(input.key))
            .map((input) => ({ field: input.key, message: controller.flowErrorFor(input.key) ?? "" }))}
          onChange={controller.setFlowValue}
          onBlurField={() => {}}
        />
      )}
    </div>
  );
}
