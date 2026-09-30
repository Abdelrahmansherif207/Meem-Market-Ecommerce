"use client";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { ChevronLeft, ChevronRight, CreditCard, Loader2, Store, WifiOff } from "lucide-react";
import { useShallow } from "zustand/react/shallow";
import { useAuthStore } from "@/features/auth";
import { useCurrencyStore } from "@/features/currencies";
import { usePickupLocationStore } from "@/features/pickup-location";
import { MapPickerModal, useLocationStore } from "@/features/location";
import type { PickedAddress } from "@/features/location";
import Stepper, { type StepperStep } from "@/components/ui/Stepper";
import { useRouter as useIntlRouter } from "@/i18n/navigation";
import { matchGovernorateByName } from "../utils/matchGovernorate";
import { OrderSummary } from "./OrderSummary";
import { CheckoutFormSkeleton } from "./CheckoutFormSkeleton";
import { resolveShippingQuote } from "../utils/shippingFee";
import { mapCheckoutError } from "../utils/errorMessages";
import { handleCheckoutSubmitError } from "../utils/submitErrors";
import { saveMapPickedAddress, useCheckoutForm } from "../hooks/useCheckoutForm";
import { useCheckoutData } from "../hooks/useCheckoutData";
import { checkoutService } from "../services/checkoutService";
import {
  validateContactStep,
  validateDeliveryStep,
  validatePaymentStep,
} from "../schemas/checkoutSchema";
import type { FieldError } from "../schemas/checkoutSchema";
import { ContactStep } from "./steps/ContactStep";
import { DeliveryStep } from "./steps/DeliveryStep";
import { PaymentStep } from "./steps/PaymentStep";
import { ReviewStep, type ReviewSectionId } from "./steps/ReviewStep";
import { localizedText, SHIPPING_TYPE_CODES } from "../types";
import type { ShippingType } from "../types";
import { useOnlineStatus } from "@/shared/hooks/useOnlineStatus";

type StepId = "contact" | "delivery" | "payment" | "review";

const ALL_STEPS: StepId[] = ["contact", "delivery", "payment", "review"];

/** Maps a field name to the wizard step that owns it (for 422 error jumps). */
function fieldToStep(field: string): StepId {
  if (["name", "user_phone", "user_email"].includes(field)) return "contact";
  if (
    ["governorate_id", "city", "state", "country", "street_address"].includes(field) ||
    field.startsWith("flow:")
  ) {
    return "delivery";
  }
  return "payment";
}

function stepOfFieldErrors(errors: FieldError[]): StepId {
  for (const error of errors) {
    if (error.field === "__gateway") continue;
    return fieldToStep(error.field);
  }
  return "delivery";
}

export function CheckoutForm() {
  const t = useTranslations("checkout");
  const locationT = useTranslations("locationPicker");
  const router = useRouter();
  const intlRouter = useIntlRouter();
  const locale = useLocale();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  // Re-fetch cart totals when the currency changes (client `apiFetch`
  // already attaches `X-Currency`).
  const selectedCurrency = useCurrencyStore((s) => s.selectedCode);
  const user = useAuthStore(
    useShallow((s) => ({ name: s.name, email: s.email, phone: s.phoneNumber })),
  );
  const searchParams = useSearchParams();
  const selectedLocationId = usePickupLocationStore((s) => s.selectedLocationId);
  const clearLocation = usePickupLocationStore((s) => s.clear);
  const isOnline = useOnlineStatus();
  const browserCoords = useLocationStore((s) => s.coords);

  const controller = useCheckoutForm({ user });
  const { form } = controller;

  const [hydrated, setHydrated] = useState(() =>
    typeof window !== "undefined" ? useAuthStore.persist.hasHydrated() : false,
  );

  useEffect(() => useAuthStore.persist.onFinishHydration(() => setHydrated(true)), []);

  const steps: StepId[] = ALL_STEPS;

  // ---- URL-synced step state ------------------------------------------------
  const stepParam = searchParams.get("step");
  const [stepIndex, setStepIndex] = useState(() => {
    const idx = steps.indexOf((stepParam ?? "") as StepId);
    return idx >= 0 ? idx : 0;
  });
  const mountedRef = useRef(false);
  const prevStepRef = useRef(stepIndex);

  const goToStep = useCallback(
    (index: number) => {
      const clamped = Math.min(Math.max(index, 0), steps.length - 1);
      setStepIndex(clamped);
      const query: Record<string, string> = {};
      if (clamped > 0) query.step = steps[clamped];
      intlRouter.replace(
        { pathname: "/payment", query },
        { scroll: false },
      );
    },
    [intlRouter, steps],
  );

  useEffect(() => {
    // Sanitize stale/foreign `?step=` values (e.g. after locale change).
    if (!mountedRef.current) return;
    const idx = stepParam ? steps.indexOf(stepParam as StepId) : 0;
    if (idx >= 0 && idx !== stepIndex) setStepIndex(idx);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stepParam]);

  useEffect(() => {
    if (prevStepRef.current !== stepIndex) {
      prevStepRef.current = stepIndex;
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [stepIndex]);

  useEffect(() => {
    mountedRef.current = true;
  }, []);

  // ---- Shared data ----------------------------------------------------------
  const data = useCheckoutData({
    locale,
    currency: selectedCurrency,
    hydrated,
    isAuthenticated,
    shippingType: form.shipping_type,
    onShippingTypeUnsupported: (type) => {
      if (form.shipping_type !== type) return;
      const remaining = SHIPPING_TYPE_CODES.filter((st) => st !== type);
      if (remaining.length > 0) controller.setShippingType(remaining[0] as ShippingType);
    },
    onFirstAddressSelected: (address) => {
      controller.setSelectedAddressId(address.id);
      controller.applyAddress(address);
    },
  });

  const {
    cartData,
    cartLoading,
    refreshCartCoupon,
    governorates,
    governoratesLoading,
    governoratesError,
    retryGovernorates,
    gateways,
    gatewaysError,
    retryGateways,
    selectedGateway,
    setSelectedGateway,
    availableShippingTypes,
    flow,
    flowError,
    savedAddresses,
    addressesLoading,
    addressesError,
    retryAddresses,
    addSavedAddress,
    promotions,
    promotionsError,
    retryPromotions,
  } = data;

  const [submitting, setSubmitting] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [navStalled, setNavStalled] = useState(false);
  const [stickyTop, setStickyTop] = useState<number | null>(null);

  useEffect(() => {
    const header = document.querySelector("header");
    if (!header) return;
    const update = () =>
      setStickyTop(window.innerWidth >= 1024 ? header.offsetHeight + 12 : null);
    const rafId = requestAnimationFrame(update);
    const observer = new ResizeObserver(update);
    observer.observe(header);
    window.addEventListener("resize", update);
    return () => {
      cancelAnimationFrame(rafId);
      observer.disconnect();
      window.removeEventListener("resize", update);
    };
  }, []);

  // ---- Derived values -------------------------------------------------------
  const autoGovernorateId = useMemo<number | null>(() => {
    if (form.governorate_id !== null) return null;
    if (governoratesLoading || governorates.length === 0 || !controller.selectedAddressId) return null;
    const addr = savedAddresses.find((a) => a.id === controller.selectedAddressId);
    if (!addr) return null;
    return matchGovernorateByName(addr.address.city, addr.address.state, governorates)?.id ?? null;
  }, [form.governorate_id, governorates, governoratesLoading, controller.selectedAddressId, savedAddresses]);
  const selectedGovernorateId = form.governorate_id ?? autoGovernorateId;

  const selectedCurrencyRate = useCurrencyStore(
    (s) => s.byCode[s.selectedCode]?.effectiveRate ?? null,
  );
  const shippingQuote = useMemo(
    () =>
      resolveShippingQuote({
        fulfillmentType: form.fulfillment_type,
        governorate: governorates.find((g) => g.id === selectedGovernorateId) ?? null,
        subtotal: cartData?.subtotal ?? 0,
        ratePerBase: selectedCurrencyRate,
      }),
    [form.fulfillment_type, governorates, selectedGovernorateId, cartData?.subtotal, selectedCurrencyRate],
  );

  const selectedAddress = savedAddresses.find((a) => a.id === controller.selectedAddressId) ?? null;
  const mapDefaultCenter = selectedAddress?.location
    ? { lat: selectedAddress.location.latitude, lng: selectedAddress.location.longitude }
    : browserCoords;
  const mapInitialValue: PickedAddress | null = selectedAddress
    ? {
        title: selectedAddress.title,
        coords: selectedAddress.location
          ? { lat: selectedAddress.location.latitude, lng: selectedAddress.location.longitude }
          : browserCoords ?? { lat: 29.3759, lng: 47.9774 },
        formattedAddress: [
          selectedAddress.address.street_address,
          selectedAddress.address.city,
          selectedAddress.address.state,
          selectedAddress.address.country,
        ].filter((part) => part.trim()).join(", "),
        city: selectedAddress.address.city,
        state: selectedAddress.address.state,
        country: selectedAddress.address.country,
        zip: selectedAddress.address.zip,
        streetAddress: selectedAddress.address.street_address,
      }
    : null;

  // ---- Validation -----------------------------------------------------------
  const vt = useCallback((key: string) => t(`validation.${key}`), [t]);
  const flowLabel = useCallback(
    (input: { key: string; label: { en?: string; ar?: string } }) =>
      t("flowInputs.requiredField", { field: localizedText(input.label, locale) }),
    [t, locale],
  );

  const runStepValidation = useCallback(
    (step: StepId): FieldError[] => {
      switch (step) {
        case "contact":
          return validateContactStep(form, { vt });
        case "delivery":
          return validateDeliveryStep(form, {
            vt,
            governorateId: selectedGovernorateId,
            flow,
            flowValues: controller.flowValues,
            flowLabel,
          });
        case "payment":
          return validatePaymentStep(form, { selectedGateway, gatewaysError });
        default:
          return [];
      }
    },
    [form, vt, selectedGovernorateId, flow, controller.flowValues, flowLabel, selectedGateway, gatewaysError],
  );

  const handleContinue = useCallback(
    (step: StepId) => {
      setApiError(null);
      const errors = runStepValidation(step);
      if (errors.length > 0) {
        const bannerError = errors.find((e) => e.field === "__gateway");
        if (bannerError) {
          setApiError(t(bannerError.message));
          return;
        }
        controller.setErrors(errors);
        setApiError(t("fixRequiredFields"));
        const firstError = errors[0];
        const selector = firstError.field.startsWith("flow:")
          ? `[data-flow-key="${firstError.field.slice(5)}"]`
          : `[name="${firstError.field}"]`;
        const firstEl = document.querySelector(selector);
        firstEl?.scrollIntoView({ behavior: "smooth", block: "center" });
        (firstEl as HTMLElement)?.focus();
        return;
      }
      goToStep(stepIndex + 1);
    },
    [runStepValidation, controller, goToStep, stepIndex, t],
  );

  // ---- Submission (contracts unchanged) -------------------------------------
  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setApiError(null);

      // Final gate: validate every step, jump to the first offender.
      const allErrors = [
        ...validateContactStep(form, { vt }),
        ...validateDeliveryStep(form, {
          vt,
          governorateId: selectedGovernorateId,
          flow,
          flowValues: controller.flowValues,
          flowLabel,
        }),
      ];
      const gatewayErrors = validatePaymentStep(form, { selectedGateway, gatewaysError });
      if (allErrors.length > 0 || gatewayErrors.length > 0) {
        const bannerError = gatewayErrors.find((err) => err.field === "__gateway");
        if (allErrors.length > 0) {
          controller.setErrors(allErrors);
          setApiError(t("fixRequiredFields"));
          const offender = stepOfFieldErrors(allErrors);
          goToStep(steps.indexOf(offender));
        } else {
          setApiError(t(bannerError ? bannerError.message : "fixRequiredFields"));
          goToStep(steps.indexOf("payment"));
        }
        return;
      }
      if (form.payment_method === "online" && !selectedGateway) {
        setApiError(gatewaysError ? t("paymentGatewaysError") : t("onlineUnavailable"));
        return;
      }

      setSubmitting(true);
      // The submit CTA lives at the bottom of the review step; the processing
      // panel renders at the top of the page. Jump there instantly so the
      // loading state is actually in the viewport.
      window.scrollTo({ top: 0, behavior: "auto" });

      // flow_values contract:
      // - only keys that exist among the flow's active inputs are sent
      //   (unknown keys are rejected server-side — fail closed);
      // - sent when the flow loaded and the user provided values;
      // - omitted entirely when no flow loaded (classic checkout) or nothing
      //   was filled.
      const flowInputKeySet = new Set((flow?.inputs ?? []).map((i) => i.key));
      const sanitizedFlowValues = flow
        ? Object.fromEntries(
            Object.entries(controller.flowValues).filter(
              ([key, value]) =>
                flowInputKeySet.has(key) &&
                !(value === undefined || value === null ||
                  (typeof value === "string" && value.trim() === "") ||
                  (Array.isArray(value) && value.length === 0)),
            ),
          )
        : null;
      const includeFlowValues =
        sanitizedFlowValues !== null && Object.keys(sanitizedFlowValues).length > 0;

      const jumpToFieldErrors = (fieldErrors: FieldError[]) => {
        controller.setErrors(fieldErrors);
        setApiError(t("fixRequiredFields"));
        const target = stepOfFieldErrors(fieldErrors);
        goToStep(steps.indexOf(target));
      };

      const payload = {
        name: form.name.trim(),
        user_phone: form.user_phone.trim(),
        user_email: form.user_email.trim(),
        address: {
          city: form.fulfillment_type === "delivery" ? form.city.trim() : "",
          state: form.fulfillment_type === "delivery" ? form.state.trim() : "",
          country: form.fulfillment_type === "delivery" ? form.country.trim() : "",
          street_address: form.fulfillment_type === "delivery" ? form.street_address.trim() : "",
        },
        notes: form.notes.trim() || undefined,
        fulfillment_type: form.fulfillment_type,
        payment_method: form.payment_method,
        ...(form.payment_method === "online" && selectedGateway
          ? { gateway: selectedGateway }
          : {}),
        governorate_id: form.fulfillment_type === "delivery" ? selectedGovernorateId ?? undefined : undefined,
        selected_promotion_id: form.selected_promotion_id,
        selected_gift_product_id: form.selected_gift_product_id,
        ...(form.fulfillment_type === "pickup" && { pickup_location_id: selectedLocationId }),
        shipping_type: form.shipping_type,
        ...(includeFlowValues ? { flow_values: sanitizedFlowValues } : {}),
      };

      try {
        const result = await checkoutService.processCheckout(payload);

        if (form.payment_method === "online" && result.url) {
          setTimeout(() => setNavStalled(true), 10_000);
          window.location.href = result.url;
        } else if (form.payment_method === "cod") {
          intlRouter.push(`/payment/success?order_id=${result.order_id}`);
        } else if (form.payment_method === "pay_at_cashier") {
          if (result.qr_code) {
            sessionStorage.setItem("checkout_qr", result.qr_code);
          }
          intlRouter.push(`/payment/success?order_id=${result.order_id}&transaction_id=${result.transaction_uuid}`);
        }
      } catch (err) {
        handleCheckoutSubmitError(err, t, locale, flow, jumpToFieldErrors, () => {
          setApiError(mapCheckoutError(err, t));
        }, () => {
          setApiError(t("fixRequiredFields"));
        });
        setSubmitting(false);
      }
    },
    [form, vt, selectedGovernorateId, flow, controller, selectedGateway, gatewaysError, t, locale, flowLabel, selectedLocationId, goToStep, steps, intlRouter],
  );

  // ---- Map pick (unchanged behavior) ----------------------------------------
  const handleMapPicked = useCallback(
    async (picked: PickedAddress) => {
      controller.setMapError(null);
      controller.applyPickedAddress(picked);

      const matched = matchGovernorateByName(picked.city, picked.state, governorates);
      if (matched) controller.setGovernorate(matched.id);

      controller.setMapSaving(true);
      const created = await saveMapPickedAddress(
        picked,
        locale,
        locationT("defaultTitle"),
        matched?.id ?? null,
      );
      controller.setMapSaving(false);
      if (created) {
        addSavedAddress(created);
        controller.setSelectedAddressId(created.id);
        controller.closeMapModal();
      } else {
        controller.setMapError(locationT("saveError"));
      }
    },
    [controller, governorates, locale, locationT, addSavedAddress],
  );

  const handleCouponApplied = useCallback(() => {
    refreshCartCoupon();
  }, [refreshCartCoupon]);

  // ---- Guards ----------------------------------------------------------------
  useEffect(() => {
    if (!hydrated) return;
    if (!isAuthenticated) {
      router.replace("/auth?redirect=/payment");
    }
  }, [hydrated, isAuthenticated, router]);

  const handleEditSection = useCallback(
    (section: ReviewSectionId) => {
      goToStep(steps.indexOf(section));
    },
    [goToStep, steps],
  );

  if (!isAuthenticated) return null;

  if (cartLoading) return <CheckoutFormSkeleton />;

  if (cartData?.expired) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <Store className="mb-4 size-12 text-text-secondary" aria-hidden="true" />
        <h1 className="text-xl font-bold text-text-primary">{t("cartExpired")}</h1>
        <p className="mt-2 text-sm text-text-secondary">{t("cartExpiredDesc")}</p>
        <button
          onClick={() => router.push("/cart")}
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-2.5 text-sm font-semibold text-white"
        >
          {t("goToCart")}
        </button>
      </div>
    );
  }

  if (submitting) {
    return (
      <div
        role="status"
        aria-live="polite"
        className="flex flex-col items-center justify-center py-10 text-center"
      >
        <Loader2 className="mb-4 size-10 animate-spin text-primary" aria-hidden="true" />
        <h1 className="text-xl font-bold text-text-primary">{t("processing")}</h1>
        <p className="mt-2 text-sm text-text-secondary">{t("processingDesc")}</p>
        {navStalled && (
          <div className="mt-6 w-full max-w-sm rounded-2xl border-2 border-border bg-white p-5">
            <p className="text-sm text-text-secondary">{t("navStalledHint")}</p>
            <div className="mt-4 flex items-center justify-center gap-3">
              <Link
                href="/profile"
                className="inline-flex items-center rounded-xl border border-border px-4 py-2 text-sm font-semibold text-text-primary transition-colors hover:bg-surface"
              >
                {t("checkOrders")}
              </Link>
              <button
                type="button"
                onClick={() => {
                  setNavStalled(false);
                  setSubmitting(false);
                }}
                className="inline-flex items-center rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white transition-colors hover:opacity-90"
              >
                {t("retry")}
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  const stepperSteps: StepperStep[] = steps.map((id) => ({ id, label: t(`steps.${id}`) }));
  const currentStep = steps[stepIndex];
  const isReviewStep = currentStep === "review";

  const stepContent = (() => {
    switch (currentStep) {
      case "contact":
        return (
          <ContactStep
            form={form}
            controller={controller}
            availableShippingTypes={availableShippingTypes}
          />
        );
      case "delivery":
        return (
          <DeliveryStep
            form={form}
            controller={controller}
            selectedGovernorateId={selectedGovernorateId}
            governorates={governorates}
            governoratesLoading={governoratesLoading}
            governoratesError={governoratesError}
            onRetryGovernorates={retryGovernorates}
            savedAddresses={savedAddresses}
            addressesLoading={addressesLoading}
            addressesError={addressesError}
            onRetryAddresses={retryAddresses}
            flow={flow}
            flowError={flowError}
            onFulfillmentChange={(type) => {
              controller.setFulfillment(type);
              if (type === "delivery") clearLocation();
            }}
          />
        );
      case "payment":
        return (
          <PaymentStep
            form={form}
            controller={controller}
            gateways={gateways}
            gatewaysError={gatewaysError}
            onRetryGateways={retryGateways}
            selectedGateway={selectedGateway}
            onSelectGateway={setSelectedGateway}
            promotions={promotions}
            promotionsError={promotionsError}
            onRetryPromotions={retryPromotions}
          />
        );
      default:
        return null;
    }
  })();

  return (
    <form
      onSubmit={(e) => {
        if (isReviewStep) {
          void handleSubmit(e);
        } else {
          e.preventDefault();
          handleContinue(currentStep);
        }
      }}
    >
      {!isOnline && (
        <div
          role="alert"
          className="mb-6 flex items-center gap-2 rounded-xl border-2 border-amber-300 bg-amber-50 p-4 text-sm font-medium text-amber-800"
        >
          <WifiOff className="size-4 shrink-0" aria-hidden="true" />
          {t("offlineBanner")}
        </div>
      )}
      {apiError && (
        <div
          role="alert"
          aria-live="polite"
          className="mb-6 rounded-xl border-2 border-red-200 bg-red-50 p-4 text-sm text-red-700"
        >
          {apiError}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <Stepper
            steps={stepperSteps}
            current={stepIndex}
            clickableCount={stepIndex}
            onStepClick={goToStep}
            stepOfLabel={t("stepOf", { current: stepIndex + 1, total: steps.length })}
          />

          {stepContent}

          {isReviewStep ? (
            <ReviewStep
              form={form}
              flow={flow}
              flowValues={controller.flowValues}
              controller={controller}
              selectedGovernorateId={selectedGovernorateId}
              governorates={governorates}
              selectedGateway={selectedGateway}
              gateways={gateways}
              promotions={promotions}
              pickupLocationName={controller.pickupLocationName}
              onEdit={handleEditSection}
              submitting={submitting}
              submitDisabled={!isOnline}
            />
          ) : (
            <div className="flex items-center justify-between gap-3">
              {stepIndex > 0 ? (
                <button
                  type="button"
                  onClick={() => goToStep(stepIndex - 1)}
                  className="inline-flex items-center gap-2 rounded-xl border border-border px-5 py-3 text-sm font-semibold text-text-primary transition-colors hover:bg-surface"
                >
                  <ChevronLeft className="size-4 rtl:rotate-180" aria-hidden="true" />
                  {t("actions.back")}
                </button>
              ) : (
                <span />
              )}
              <button
                type="submit"
                className="inline-flex items-center gap-2 rounded-xl bg-primary px-8 py-3 text-sm font-bold text-white transition-all hover:opacity-90"
              >
                {t("actions.continue")}
                <ChevronRight className="size-4 rtl:rotate-180" aria-hidden="true" />
              </button>
            </div>
          )}
        </div>

        <div className="lg:col-span-1">
          <div
            className="space-y-4 lg:sticky lg:top-24"
            style={stickyTop !== null ? { top: stickyTop } : undefined}
          >
            <OrderSummary
              subtotal={cartData?.subtotal ?? 0}
              totalQuantity={cartData?.totalQuantity ?? 0}
              shipping={shippingQuote}
              promotionDiscount={form.selected_promotion_discount}
              couponDiscount={cartData?.couponDiscount ?? 0}
              pickupLocationName={controller.pickupLocationName || undefined}
              appliedCoupon={cartData?.appliedCoupon}
              onCouponApplied={handleCouponApplied}
            />
            <p className="hidden items-center justify-center gap-2 text-xs text-text-secondary lg:flex">
              <CreditCard className="size-3.5" aria-hidden="true" />
              {t("review.summaryHint")}
            </p>
          </div>
        </div>
      </div>

      {/* Mobile sticky step navigation (above the global bottom nav) */}
      <div className="fixed inset-x-0 bottom-14 z-40 border-t border-border bg-white px-4 py-3 lg:hidden">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-3">
          {stepIndex > 0 ? (
            <button
              type="button"
              onClick={() => goToStep(stepIndex - 1)}
              className="inline-flex items-center gap-1 rounded-xl border border-border px-4 py-2.5 text-sm font-semibold text-text-primary"
            >
              <ChevronLeft className="size-4 rtl:rotate-180" aria-hidden="true" />
              {t("actions.back")}
            </button>
          ) : (
            <span />
          )}
          {isReviewStep ? (
            <button
              type="submit"
              disabled={!isOnline}
              aria-busy={submitting}
              className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-primary py-2.5 text-sm font-bold text-white disabled:opacity-50"
            >
              <CreditCard className="size-4" aria-hidden="true" />
              {form.payment_method === "online"
                ? t("payNow")
                : form.payment_method === "cod"
                  ? t("placeOrderCod")
                  : t("placeOrderCashier")}
            </button>
          ) : (
            <button
              type="submit"
              className="flex-1 inline-flex items-center justify-center gap-1 rounded-xl bg-primary py-2.5 text-sm font-bold text-white"
            >
              {t("actions.continue")}
              <ChevronRight className="size-4 rtl:rotate-180" aria-hidden="true" />
            </button>
          )}
        </div>
      </div>

      <MapPickerModal
        open={controller.mapModalOpen}
        onClose={controller.closeMapModal}
        onConfirm={handleMapPicked}
        initialValue={mapInitialValue}
        initialTitle={controller.selectedAddressId === null ? controller.addressTitle : undefined}
        defaultCenter={mapDefaultCenter}
        title={t("pickOnMapTitle")}
        saving={controller.savingLocation}
        error={controller.mapSaveError}
      />
    </form>
  );
}
