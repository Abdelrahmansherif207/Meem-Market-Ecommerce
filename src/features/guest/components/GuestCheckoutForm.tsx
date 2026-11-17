"use client";
import { useCallback, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import {
  AlertTriangle,
  Banknote,
  CreditCard,
  Loader2,
  MapPin,
  Package,
  RefreshCw,
  Truck,
} from "lucide-react";
import { Link, useRouter as useIntlRouter } from "@/i18n/navigation";
import { useAuthStore } from "@/features/auth";
import { useDisplayCurrency } from "@/features/currencies";
import {
  checkoutService,
  governorateService,
  isGatewayEligible,
} from "@/features/checkout";
import type { PaymentGatewayOption } from "@/features/checkout";
import { useServerCartStore } from "@/features/cart";
import { PickupSelector } from "@/features/checkout/components/PickupSelector";
import { usePickupLocationStore } from "@/features/pickup-location/store/usePickupLocationStore";
import { ApiError } from "@/shared/lib/api";
import { useOnlineStatus } from "@/shared/hooks/useOnlineStatus";
import { Button } from "@/components/ui/Button";
import { Input, FieldWrapper, Textarea } from "@/components/ui/Input";
import { Price } from "@/components/ui/Price";
import { guestCartService } from "../services/guestCartService";
import { guestCheckoutService } from "../services/guestCheckoutService";
import { useGuestSessionStore } from "../store/useGuestSessionStore";
import { saveGuestOrderTokens } from "../store/useGuestOrderTokensStore";
import {
  clearIdempotencyKey,
  getOrCreateIdempotencyKey,
} from "../utils/idempotency";
import { runWithGuestSession } from "../utils/guestErrors";
import {
  consumeGuestPaymentReturnNote,
  saveGuestPaymentReturnNote,
} from "../utils/paymentReturn";
import type {
  GuestCart,
  GuestCheckoutRequest,
  GuestCheckoutResult,
  GuestFulfillmentType,
  GuestOrderTokensResult,
  GuestPaymentMethod,
} from "../types";

interface GuestFormState {
  name: string;
  user_phone: string;
  user_email: string;
  fulfillment_type: GuestFulfillmentType;
  governorate_id: number | null;
  city: string;
  street: string;
  building: string;
  details: string;
  notes: string;
  payment_method: GuestPaymentMethod;
}

const INITIAL_FORM: GuestFormState = {
  name: "",
  user_phone: "",
  user_email: "",
  fulfillment_type: "delivery",
  governorate_id: null,
  city: "",
  street: "",
  building: "",
  details: "",
  notes: "",
  payment_method: "online",
};

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
/** 8–15 digits with an optional leading `+`. */
const PHONE_PATTERN = /^\+?\d{8,15}$/;
/** Cooldown after a 429 (checkout is rate-limited to ~6 requests/minute). */
const RATE_LIMIT_COOLDOWN_SECONDS = 60;

/**
 * Stable idempotency scope for one logical checkout attempt. The key is
 * derived from the cart snapshot, so retries of the same cart replay the same
 * order while any cart/quantity/total change starts a fresh intent.
 */
function checkoutIntent(cart: GuestCart): string {
  const cents = Math.round(cart.total * 100);
  return `checkout-${cart.id}-${cart.totalQuantity}-${cents}`;
}

/**
 * Guest checkout.
 *
 * - Totals come from the server cart (`subtotal`, `shipping_cost`, `total`);
 *   the client never recomputes prices, fees, or tax.
 * - Delivery needs a governorate + address; pickup needs a pickup location.
 * - Online payment redirects to the gateway URL returned by checkout or
 *   payment-initiation; COD never calls the payment endpoint.
 * - Checkout consumes the cart. A payment-initiation failure must never
 *   resubmit checkout — the confirmation page owns the retry.
 */
export function GuestCheckoutForm() {
  const t = useTranslations("guestCheckout");
  const tc = useTranslations("checkout");
  const intlRouter = useIntlRouter();
  const locale = useLocale();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const displayCurrency = useDisplayCurrency();
  const isOnline = useOnlineStatus();
  const setCartBadge = useServerCartStore((s) => s.setTotalQuantity);
  const pickupLocationId = usePickupLocationStore((s) => s.selectedLocationId);

  // Authenticated users belong on the main checkout.
  useEffect(() => {
    if (isAuthenticated) intlRouter.replace("/payment");
  }, [isAuthenticated, intlRouter]);

  // Returning from the gateway (e.g. the browser restored the checkout tab):
  // route to the confirmation instead of letting the form be submitted twice.
  useEffect(() => {
    const note = consumeGuestPaymentReturnNote();
    if (note) intlRouter.replace(`/guest-order/${note.orderId}`);
  }, [intlRouter]);

  const [form, setForm] = useState<GuestFormState>(INITIAL_FORM);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [apiError, setApiError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  const [cart, setCart] = useState<GuestCart | null>(null);
  const [cartLoading, setCartLoading] = useState(true);
  const [cartError, setCartError] = useState(false);
  const [governorates, setGovernorates] = useState<
    Awaited<ReturnType<typeof governorateService.getAll>>
  >([]);
  const [governoratesLoading, setGovernoratesLoading] = useState(true);
  const [governoratesError, setGovernoratesError] = useState(false);
  const [gateways, setGateways] = useState<PaymentGatewayOption[]>([]);
  const [gatewaysLoading, setGatewaysLoading] = useState(true);
  const [gatewaysError, setGatewaysError] = useState(false);
  const [gateway, setGateway] = useState<string | null>(null);

  const hasFastItems = useMemo(
    () => (cart?.items ?? []).some((item) => item.shippingMethod === "fast"),
    [cart],
  );

  // Tick the 429 cooldown down to zero.
  const coolingDown = cooldown > 0;
  useEffect(() => {
    if (!coolingDown) return;
    const id = window.setInterval(
      () => setCooldown((seconds) => Math.max(0, seconds - 1)),
      1000,
    );
    return () => window.clearInterval(id);
  }, [coolingDown]);

  // NOW delivery is per-order; pickup cannot apply to it.
  useEffect(() => {
    if (!hasFastItems) return;
    setForm((prev) => // eslint-disable-line react-hooks/set-state-in-effect
      prev.fulfillment_type === "delivery"
        ? prev
        : { ...prev, fulfillment_type: "delivery" },
    );
  }, [hasFastItems]);

  const setField = useCallback(
    (field: keyof GuestFormState, value: string | number | null) => {
      setForm((prev) => ({ ...prev, [field]: value }));
      setFieldErrors((prev) => {
        if (!prev[field]) return prev;
        const next = { ...prev };
        delete next[field];
        return next;
      });
    },
    [],
  );

  const loadCart = useCallback(async () => {
    setCartLoading(true);
    setCartError(false);
    try {
      await useGuestSessionStore.getState().ensureSession(locale);
      const data = await runWithGuestSession(locale, () =>
        guestCartService.getCart(locale),
      );
      setCart(data);
    } catch {
      setCart(null);
      setCartError(true);
    } finally {
      setCartLoading(false);
    }
  }, [locale]);

  useEffect(() => {
    loadCart(); // eslint-disable-line react-hooks/set-state-in-effect
  }, [loadCart, displayCurrency.code]);

  // Governorates + gateways are public general endpoints.
  useEffect(() => {
    let cancelled = false;
    governorateService
      .getAll(locale)
      .then((data) => {
        if (cancelled) return;
        setGovernorates(data);
        setGovernoratesError(false);
        setGovernoratesLoading(false);
      })
      .catch(() => {
        if (cancelled) return;
        setGovernoratesError(true);
        setGovernoratesLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [locale]);

  useEffect(() => {
    let cancelled = false;
    checkoutService
      .getPaymentGateways(locale)
      .then((list) => {
        if (cancelled) return;
        const eligible = list.filter(isGatewayEligible);
        setGateways(eligible);
        setGateway((prev) =>
          prev && eligible.some((g) => g.code === prev)
            ? prev
            : (eligible[0]?.code ?? null),
        );
        setGatewaysError(false);
        setGatewaysLoading(false);
      })
      .catch(() => {
        if (cancelled) return;
        setGateways([]);
        setGatewaysError(true);
        setGatewaysLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [locale]);

  const retryGateways = useCallback(() => {
    setGatewaysLoading(true);
    setGatewaysError(false);
    checkoutService
      .getPaymentGateways(locale)
      .then((list) => {
        const eligible = list.filter(isGatewayEligible);
        setGateways(eligible);
        setGateway((prev) =>
          prev && eligible.some((g) => g.code === prev)
            ? prev
            : (eligible[0]?.code ?? null),
        );
        setGatewaysLoading(false);
      })
      .catch(() => {
        setGateways([]);
        setGatewaysError(true);
        setGatewaysLoading(false);
      });
  }, [locale]);

  // ---------------------------------------------------------------------------
  // Validation
  // ---------------------------------------------------------------------------
  const validate = useCallback((): Record<string, string> => {
    const errors: Record<string, string> = {};
    if (!form.name.trim()) errors.name = tc("validation.nameRequired");

    const phone = form.user_phone.trim();
    if (!phone) errors.user_phone = tc("validation.phoneRequired");
    else if (!PHONE_PATTERN.test(phone))
      errors.user_phone = tc("validation.phoneInvalid");

    // Email is optional — only validate it when the shopper provides one.
    const email = form.user_email.trim();
    if (email && !EMAIL_PATTERN.test(email)) {
      errors.user_email = tc("validation.emailInvalid");
    }

    if (form.fulfillment_type === "delivery") {
      if (!form.governorate_id) {
        errors.governorate_id = tc("validation.governorateRequired");
      }
      if (!form.city.trim()) errors.city = tc("validation.cityRequired");
      if (!form.street.trim()) errors.street = tc("validation.streetRequired");
    } else if (!pickupLocationId) {
      errors.pickup_location_id = t("pickupRequired");
    }

    return errors;
  }, [form, pickupLocationId, t, tc]);

  // ---------------------------------------------------------------------------
  // Submit
  // ---------------------------------------------------------------------------
  const handleSubmit = useCallback(
    async (event: React.FormEvent) => {
      event.preventDefault();
      if (submitting || coolingDown || !cart) return;

      setApiError(null);

      const errors = validate();
      if (Object.keys(errors).length > 0) {
        setFieldErrors(errors);
        setApiError(tc("fixRequiredFields"));
        return;
      }
      if (form.payment_method === "online" && !gateway) {
        setApiError(
          gatewaysError ? tc("paymentGatewaysError") : tc("onlineUnavailable"),
        );
        return;
      }

      setSubmitting(true);

      const payload: GuestCheckoutRequest = {
        name: form.name.trim(),
        user_phone: form.user_phone.trim(),
        ...(form.user_email.trim()
          ? { user_email: form.user_email.trim() }
          : {}),
        address:
          form.fulfillment_type === "delivery"
            ? {
                street: form.street.trim(),
                city: form.city.trim(),
                ...(form.building.trim()
                  ? { building: form.building.trim() }
                  : {}),
                ...(form.details.trim() ? { details: form.details.trim() } : {}),
              }
            : {
                street: "",
                city: "",
                ...(form.details.trim() ? { details: form.details.trim() } : {}),
              },
        ...(form.notes.trim() ? { notes: form.notes.trim() } : {}),
        fulfillment_type: form.fulfillment_type,
        payment_method: form.payment_method,
        shipping_type: "local",
        ...(form.fulfillment_type === "delivery" && form.governorate_id
          ? { governorate_id: form.governorate_id }
          : {}),
        ...(form.fulfillment_type === "pickup" && pickupLocationId
          ? { pickup_location_id: pickupLocationId }
          : {}),
        ...(form.payment_method === "online" && gateway ? { gateway } : {}),
      };

      const intent = checkoutIntent(cart);

      let result: GuestCheckoutResult;
      try {
        // Guard against a stale guest session before a state-changing call.
        const session = useGuestSessionStore.getState();
        const expiresAt = session.expiresAt
          ? Date.parse(session.expiresAt)
          : Number.NaN;
        if (
          !session.csrfToken ||
          (Number.isFinite(expiresAt) && expiresAt <= Date.now())
        ) {
          if (session.csrfToken) session.reset();
          await session.ensureSession(locale);
          const refreshed = useGuestSessionStore.getState();
          if (refreshed.status !== "ready") {
            throw refreshed.lastError ?? new Error("Guest session unavailable");
          }
        }

        const checkoutKey = getOrCreateIdempotencyKey(intent);
        result = await runWithGuestSession(locale, () =>
          guestCheckoutService.checkout(payload, checkoutKey, locale),
        );
        clearIdempotencyKey(intent);
      } catch (error) {
        if (error instanceof ApiError) {
          // A rejected checkout must not keep its intent key — only genuine
          // in-progress states (409) and network failures should reuse it.
          if (error.status === 400 || error.status === 422) {
            clearIdempotencyKey(intent);
          }
          if (error.status === 400) {
            setApiError(tc("errors.cartNotFound"));
            // The cart may have been consumed/expired — show the real state.
            void loadCart();
          } else if (error.status === 401 || error.status === 419) {
            setApiError(t("sessionExpired"));
          } else if (error.status === 429) {
            setCooldown(RATE_LIMIT_COOLDOWN_SECONDS);
            setApiError(tc("errors.tooManyAttempts"));
          } else if (error.fields && Object.keys(error.fields).length > 0) {
            const mapped: Record<string, string> = {};
            for (const [field, messages] of Object.entries(error.fields)) {
              const clean = field
                .replace(/^item\./, "")
                .replace(/^address\./, "")
                .replace(/^phone$/, "user_phone")
                .replace(/^email$/, "user_email");
              mapped[clean] = messages[0] ?? tc("errorProcessing");
            }
            setFieldErrors(mapped);
            setApiError(tc("fixRequiredFields"));
          } else {
            setApiError(error.message || tc("errorProcessing"));
          }
        } else {
          setApiError(tc("errors.network"));
        }
        setSubmitting(false);
        return;
      }

      // The cart is consumed from here on. Never resubmit checkout; only
      // payment initiation may be retried (from the confirmation page).
      const orderId = result.order.id;
      const orderNumber = result.order.orderNumber;
      setCartBadge(0);

      let tokens: GuestOrderTokensResult | null =
        result.trackingToken || result.cancellationToken
          ? {
              orderId,
              trackingToken: result.trackingToken,
              cancellationToken: result.cancellationToken,
              trackingRevoked: false,
              trackingExpiresAt: null,
            }
          : null;

      // Older deployments expose tokens only through the access-token
      // endpoint. Non-fatal: the confirmation page retries this too.
      if (!tokens) {
        try {
          tokens = await runWithGuestSession(locale, () =>
            guestCheckoutService.issueAccessTokens(orderId, locale),
          );
        } catch {
          tokens = null;
        }
      }

      saveGuestOrderTokens({
        orderId,
        orderNumber,
        trackingToken: tokens?.trackingToken ?? null,
        cancellationToken: tokens?.cancellationToken ?? null,
      });

      const goToConfirmation = (retryPayment: boolean) => {
        intlRouter.replace(
          retryPayment
            ? `/guest-order/${orderId}?payment=retry`
            : `/guest-order/${orderId}`,
        );
      };

      const redirectToGateway = (url: string) => {
        saveGuestPaymentReturnNote(orderId);
        window.location.assign(url);
      };

      const next = result.payment.next.toLowerCase();

      // COD is confirmed immediately — the payment endpoint is not involved.
      if (form.payment_method === "cod" || next === "cod") {
        goToConfirmation(false);
        return;
      }

      // Some deployments return the gateway URL directly on checkout.
      if (result.payment.redirectUrl) {
        redirectToGateway(result.payment.redirectUrl);
        return;
      }

      // Already paid online (e.g. zero-value orders or replay).
      if (["paid", "completed", "captured"].includes(next)) {
        goToConfirmation(false);
        return;
      }

      try {
        const paymentKey = getOrCreateIdempotencyKey(`payment-${orderId}`);
        const payment = await runWithGuestSession(locale, () =>
          guestCheckoutService.initiatePayment(
            orderId,
            { payment_method: "online", gateway: gateway ?? undefined },
            paymentKey,
            locale,
          ),
        );

        if (payment.url) {
          redirectToGateway(payment.url);
          return;
        }

        clearIdempotencyKey(`payment-${orderId}`);
        // Zero-value online orders settle without a redirect.
        goToConfirmation(!payment.zeroValue);
      } catch {
        // The order exists and the cart is gone — the confirmation page
        // offers a "complete payment" retry instead.
        goToConfirmation(true);
      }
    },
    [
      submitting,
      coolingDown,
      cart,
      validate,
      form,
      gateway,
      gatewaysError,
      pickupLocationId,
      locale,
      setCartBadge,
      intlRouter,
      t,
      tc,
      loadCart,
    ],
  );

  // ---------------------------------------------------------------------------
  // Empty / loading states
  // ---------------------------------------------------------------------------
  if (cartLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (cartError) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <AlertTriangle className="mb-3 h-10 w-10 text-amber-400" />
        <p className="text-sm text-text-secondary">{t("cartLoadError")}</p>
        <Button
          type="button"
          variant="outline"
          className="mt-4"
          onClick={loadCart}
        >
          {tc("retry")}
        </Button>
      </div>
    );
  }

  if (!cart || cart.totalQuantity === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <AlertTriangle className="mb-3 h-10 w-10 text-red-400" />
        <p className="text-sm font-semibold text-text-primary">
          {t("emptyCart")}
        </p>
        <p className="mt-1 text-sm text-text-secondary">{t("emptyCartDesc")}</p>
        <Link
          href="/cart"
          className="mt-5 inline-flex items-center gap-2 rounded-xl bg-primary px-8 py-3 text-sm font-bold text-white shadow-sm shadow-primary/40 transition-all hover:bg-primary-dark"
        >
          {t("goToCart")}
        </Link>
      </div>
    );
  }

  const err = (field: string) => fieldErrors[field];
  const isPickup = form.fulfillment_type === "pickup";
  const shipping = cart.shippingCost;

  return (
    <form
      onSubmit={handleSubmit}
      className="grid grid-cols-1 lg:grid-cols-3 gap-8"
    >
      <div className="lg:col-span-2 space-y-6">
        {!isOnline && (
          <div className="flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            {tc("offlineBanner")}
          </div>
        )}
        {apiError && (
          <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            <span>{apiError}</span>
          </div>
        )}

        {/* Contact */}
        <section className="rounded-2xl border-2 border-border bg-white p-5 sm:p-6 space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-wider rtl:tracking-normal text-text-primary">
            {tc("contactInfo")}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label={tc("name")}
              name="name"
              autoComplete="name"
              value={form.name}
              onChange={(e) => setField("name", e.target.value)}
              error={err("name")}
              required
            />
            <Input
              label={tc("phone")}
              name="user_phone"
              type="tel"
              dir="ltr"
              inputMode="tel"
              autoComplete="tel"
              value={form.user_phone}
              onChange={(e) => setField("user_phone", e.target.value)}
              error={err("user_phone")}
              required
            />
          </div>
          <Input
            label={t("emailOptional")}
            name="user_email"
            type="email"
            dir="ltr"
            inputMode="email"
            autoComplete="email"
            value={form.user_email}
            onChange={(e) => setField("user_email", e.target.value)}
            error={err("user_email")}
          />
        </section>

        {/* Fulfillment */}
        <section className="rounded-2xl border-2 border-border bg-white p-5 sm:p-6 space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-wider rtl:tracking-normal text-text-primary">
            {tc("fulfillmentType")}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <label
              className={`flex cursor-pointer items-start gap-3 rounded-xl border-2 p-4 transition-colors ${
                !isPickup
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/40"
              }`}
            >
              <input
                type="radio"
                name="fulfillment_type"
                value="delivery"
                checked={!isPickup}
                onChange={() => setField("fulfillment_type", "delivery")}
                className="mt-1 accent-primary"
              />
              <Truck className="h-5 w-5 shrink-0 text-primary" />
              <span>
                <span className="block text-sm font-semibold text-text-primary">
                  {tc("delivery")}
                </span>
                <span className="block text-xs text-text-secondary">
                  {t("deliveryDesc")}
                </span>
              </span>
            </label>
            <label
              className={`flex items-start gap-3 rounded-xl border-2 p-4 transition-colors ${
                hasFastItems
                  ? "cursor-not-allowed opacity-60"
                  : isPickup
                    ? "cursor-pointer border-primary bg-primary/5"
                    : "cursor-pointer border-border hover:border-primary/40"
              }`}
            >
              <input
                type="radio"
                name="fulfillment_type"
                value="pickup"
                checked={isPickup}
                onChange={() => setField("fulfillment_type", "pickup")}
                disabled={hasFastItems}
                className="mt-1 accent-primary"
              />
              <MapPin className="h-5 w-5 shrink-0 text-primary" />
              <span>
                <span className="block text-sm font-semibold text-text-primary">
                  {tc("pickup")}
                </span>
                <span className="block text-xs text-text-secondary">
                  {hasFastItems
                    ? t("pickupUnavailableForFast")
                    : t("pickupDesc")}
                </span>
              </span>
            </label>
          </div>

          {isPickup ? (
            <div className="space-y-2">
              <PickupSelector />
              {err("pickup_location_id") && (
                <p className="text-xs text-error" role="alert">
                  {err("pickup_location_id")}
                </p>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <FieldWrapper
                label={tc("governorate")}
                error={err("governorate_id")}
                htmlFor="governorate_id"
              >
                <select
                  id="governorate_id"
                  name="governorate_id"
                  value={form.governorate_id ?? ""}
                  onChange={(e) =>
                    setField(
                      "governorate_id",
                      e.target.value ? Number(e.target.value) : null,
                    )
                  }
                  disabled={governoratesLoading}
                  required
                  className="w-full rounded-lg border bg-white px-3 py-2.5 text-sm text-text-primary focus:border-primary/50 focus:outline-none disabled:cursor-not-allowed disabled:bg-surface"
                >
                  <option value="">
                    {governoratesLoading
                      ? tc("governorateLoading")
                      : tc("governoratePlaceholder")}
                  </option>
                  {governorates.map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.name}
                    </option>
                  ))}
                </select>
              </FieldWrapper>
              {governoratesError && (
                <button
                  type="button"
                  onClick={() => {
                    setGovernoratesError(false);
                    setGovernoratesLoading(true);
                    governorateService
                      .getAll(locale)
                      .then((data) => {
                        setGovernorates(data);
                        setGovernoratesLoading(false);
                      })
                      .catch(() => {
                        setGovernoratesError(true);
                        setGovernoratesLoading(false);
                      });
                  }}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary"
                >
                  <RefreshCw className="h-3 w-3" />
                  {tc("governorateRetry")}
                </button>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label={tc("city")}
                  name="city"
                  autoComplete="address-level2"
                  value={form.city}
                  onChange={(e) => setField("city", e.target.value)}
                  error={err("city")}
                  required
                />
                <Input
                  label={tc("streetAddress")}
                  name="street"
                  autoComplete="address-line1"
                  value={form.street}
                  onChange={(e) => setField("street", e.target.value)}
                  error={err("street")}
                  required
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label={t("building")}
                  name="building"
                  autoComplete="address-line2"
                  value={form.building}
                  onChange={(e) => setField("building", e.target.value)}
                  error={err("building")}
                />
                <Input
                  label={t("addressDetails")}
                  name="details"
                  value={form.details}
                  onChange={(e) => setField("details", e.target.value)}
                  placeholder={t("addressDetailsPlaceholder")}
                  error={err("details")}
                />
              </div>
            </div>
          )}

          <Textarea
            label={tc("notes")}
            name="notes"
            value={form.notes}
            onChange={(e) => setField("notes", e.target.value)}
            placeholder={tc("notesPlaceholder")}
          />
        </section>

        {/* Payment */}
        <section className="rounded-2xl border-2 border-border bg-white p-5 sm:p-6 space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-wider rtl:tracking-normal text-text-primary">
            {tc("paymentMethod")}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <label
              className={`flex cursor-pointer items-start gap-3 rounded-xl border-2 p-4 transition-colors ${
                form.payment_method === "online"
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/40"
              }`}
            >
              <input
                type="radio"
                name="payment_method"
                value="online"
                checked={form.payment_method === "online"}
                onChange={() => setField("payment_method", "online")}
                className="mt-1 accent-primary"
              />
              <CreditCard className="h-5 w-5 shrink-0 text-primary" />
              <span>
                <span className="block text-sm font-semibold text-text-primary">
                  {tc("onlineLabel")}
                </span>
                <span className="block text-xs text-text-secondary">
                  {tc("onlineDesc")}
                </span>
              </span>
            </label>
            <label
              className={`flex cursor-pointer items-start gap-3 rounded-xl border-2 p-4 transition-colors ${
                form.payment_method === "cod"
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/40"
              }`}
            >
              <input
                type="radio"
                name="payment_method"
                value="cod"
                checked={form.payment_method === "cod"}
                onChange={() => setField("payment_method", "cod")}
                className="mt-1 accent-primary"
              />
              <Banknote className="h-5 w-5 shrink-0 text-primary" />
              <span>
                <span className="block text-sm font-semibold text-text-primary">
                  {tc("codLabel")}
                </span>
                <span className="block text-xs text-text-secondary">
                  {tc("codDesc")}
                </span>
              </span>
            </label>
          </div>

          {form.payment_method === "online" && (
            <div className="space-y-2">
              {gatewaysLoading ? (
                <p className="text-xs text-text-secondary">
                  {tc("loadingPaymentGateways")}
                </p>
              ) : gatewaysError ? (
                <div className="flex items-center gap-3">
                  <p className="text-xs text-error">
                    {tc("paymentGatewaysError")}
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={retryGateways}
                  >
                    {tc("retry")}
                  </Button>
                </div>
              ) : gateways.length === 0 ? (
                <p className="text-xs text-text-secondary">
                  {tc("onlineUnavailable")}
                </p>
              ) : gateways.length > 1 ? (
                <FieldWrapper label={tc("paymentGatewayLabel")}>
                  <select
                    value={gateway ?? ""}
                    onChange={(e) => setGateway(e.target.value)}
                    className="w-full rounded-lg border bg-white px-3 py-2.5 text-sm text-text-primary focus:border-primary/50 focus:outline-none"
                  >
                    {gateways.map((g) => (
                      <option key={g.code} value={g.code}>
                        {g.display_name}
                      </option>
                    ))}
                  </select>
                </FieldWrapper>
              ) : null}
            </div>
          )}

          {form.payment_method === "cod" && (
            <p className="rounded-xl bg-surface px-4 py-3 text-xs leading-relaxed text-text-secondary">
              {t("codNote")}
            </p>
          )}
        </section>
      </div>

      {/* Summary — every amount comes from the server cart. */}
      <div className="lg:col-span-1">
        <div className="rounded-2xl border-2 border-border bg-white p-5 space-y-4 lg:sticky lg:top-24">
          <h3 className="text-sm font-bold uppercase tracking-wider rtl:tracking-normal text-text-primary">
            {tc("orderSummary")}
          </h3>

          <ul className="max-h-64 space-y-3 overflow-y-auto">
            {cart.items.map((line) => (
              <li
                key={`${line.id}-${line.shippingMethod}`}
                className="flex items-center gap-3"
              >
                <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg border border-border bg-surface">
                  {line.image ? (
                    <Image
                      src={line.image}
                      alt={line.name}
                      width={48}
                      height={48}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <Package className="m-auto h-5 w-5 text-text-muted" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="line-clamp-2 text-xs font-medium text-text-primary">
                    {line.name}
                  </p>
                  <p className="text-xs text-text-secondary">
                    × {line.quantity}
                  </p>
                </div>
                <Price
                  amount={line.subtotal}
                  className="shrink-0 text-xs font-medium text-text-primary"
                />
              </li>
            ))}
          </ul>

          <div className="space-y-2 border-t border-border pt-3 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-text-secondary">
                {tc("subtotal")}{" "}
                <span className="text-xs">
                  ({cart.totalQuantity} {tc("items")})
                </span>
              </span>
              <Price
                amount={cart.subtotal}
                className="font-medium text-text-primary"
              />
            </div>
            {shipping > 0 && (
              <div className="flex items-center justify-between">
                <span className="text-text-secondary">{tc("shipping")}</span>
                <Price
                  amount={shipping}
                  className="font-medium text-text-primary"
                />
              </div>
            )}
          </div>

          <div className="space-y-1 border-t border-border pt-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium uppercase tracking-wider rtl:tracking-normal text-text-secondary">
                {tc("total")}
              </span>
              <Price
                amount={cart.total}
                className="text-lg font-medium text-text-primary"
              />
            </div>
            <p className="text-end text-xs text-text-secondary">
              {t("totalNote")}
            </p>
          </div>

          <Button
            type="submit"
            size="lg"
            full
            loading={submitting}
            disabled={submitting || !isOnline || coolingDown}
          >
            {form.payment_method === "cod" ? tc("placeOrderCod") : tc("payNow")}
          </Button>
          {cooldown > 0 && (
            <p className="text-center text-xs text-text-secondary">
              {t("retryIn", { seconds: cooldown })}
            </p>
          )}
          {submitting && (
            <p className="text-center text-xs text-text-secondary">
              {tc("processing")}
            </p>
          )}
        </div>
      </div>
    </form>
  );
}
