"use client";
import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { AlertTriangle, Banknote, CreditCard, Loader2, RefreshCw } from "lucide-react";
import { useRouter as useIntlRouter } from "@/i18n/navigation";
import { useAuthStore } from "@/features/auth";
import { useDisplayCurrency } from "@/features/currencies";
import {
  checkoutService,
  governorateService,
  isGatewayEligible,
  resolveShippingQuote,
} from "@/features/checkout";
import type { PaymentGatewayOption } from "@/features/checkout";
import { useServerCartStore } from "@/features/cart";
import { ApiError } from "@/shared/lib/api";
import { useOnlineStatus } from "@/shared/hooks/useOnlineStatus";
import { Button } from "@/components/ui/Button";
import { Input, FieldWrapper } from "@/components/ui/Input";
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
  GuestOrderTokensResult,
  GuestPaymentMethod,
} from "../types";

interface GuestCheckoutFormProps {
  taxEnabled?: boolean;
  taxRate?: number | null;
}

interface GuestFormState {
  name: string;
  user_phone: string;
  user_email: string;
  governorate_id: number | null;
  city: string;
  street: string;
  notes: string;
  payment_method: GuestPaymentMethod;
}

const INITIAL_FORM: GuestFormState = {
  name: "",
  user_phone: "",
  user_email: "",
  governorate_id: null,
  city: "",
  street: "",
  notes: "",
  payment_method: "online",
};

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
/** 8–15 digits with an optional leading `+`. */
const PHONE_PATTERN = /^\+?\d{8,15}$/;
/** Cooldown after a 429 (checkout is rate-limited to ~6 requests/minute). */
const RATE_LIMIT_COOLDOWN_SECONDS = 60;

export function GuestCheckoutForm({ taxEnabled = false, taxRate = null }: GuestCheckoutFormProps) {
  const t = useTranslations("guestCheckout");
  const tc = useTranslations("checkout");
  const intlRouter = useIntlRouter();
  const locale = useLocale();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const displayCurrency = useDisplayCurrency();
  const isOnline = useOnlineStatus();
  const setCartBadge = useServerCartStore((s) => s.setTotalQuantity);

  // Authenticated users belong on the main checkout.
  useEffect(() => {
    if (isAuthenticated) intlRouter.replace("/payment");
  }, [isAuthenticated, intlRouter]);

  // Returning from the gateway: route to the confirmation immediately.
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
  const [governorates, setGovernorates] = useState<Awaited<ReturnType<typeof governorateService.getAll>>>([]);
  const [governoratesLoading, setGovernoratesLoading] = useState(true);
  const [governoratesError, setGovernoratesError] = useState(false);
  const [gateways, setGateways] = useState<PaymentGatewayOption[]>([]);
  const [gatewaysLoading, setGatewaysLoading] = useState(true);
  const [gatewaysError, setGatewaysError] = useState(false);
  const [gateway, setGateway] = useState<string | null>(null);

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

  const setField = useCallback((field: keyof GuestFormState, value: string | number | null) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setFieldErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  }, []);

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
          prev && eligible.some((g) => g.code === prev) ? prev : eligible[0]?.code ?? null,
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
          prev && eligible.some((g) => g.code === prev) ? prev : eligible[0]?.code ?? null,
        );
        setGatewaysLoading(false);
      })
      .catch(() => {
        setGateways([]);
        setGatewaysError(true);
        setGatewaysLoading(false);
      });
  }, [locale]);

  const selectedGovernorate = useMemo(
    () => governorates.find((g) => g.id === form.governorate_id) ?? null,
    [governorates, form.governorate_id],
  );

  const subtotal = cart?.subtotal ?? 0;
  const totalQuantity = cart?.total_quantity ?? 0;
  const shippingQuote = useMemo(
    () =>
      resolveShippingQuote({
        fulfillmentType: "delivery",
        governorate: selectedGovernorate,
        subtotal,
        ratePerBase: null,
      }),
    [selectedGovernorate, subtotal],
  );
  const taxAmount =
    taxEnabled && taxRate && taxRate > 0 ? subtotal * (taxRate / 100) : 0;
  const total = subtotal + (shippingQuote.free ? 0 : shippingQuote.fee) + taxAmount;

  // ---------------------------------------------------------------------------
  // Validation
  // ---------------------------------------------------------------------------
  const validate = useCallback((): Record<string, string> => {
    const errors: Record<string, string> = {};
    if (!form.name.trim()) errors.name = tc("validation.nameRequired");

    const phone = form.user_phone.trim();
    if (!phone) errors.user_phone = tc("validation.phoneRequired");
    else if (!PHONE_PATTERN.test(phone)) errors.user_phone = tc("validation.phoneInvalid");

    // Email is optional — only validate it when the shopper provides one.
    const email = form.user_email.trim();
    if (email && !EMAIL_PATTERN.test(email)) {
      errors.user_email = tc("validation.emailInvalid");
    }

    if (!form.governorate_id) {
      errors.governorate_id = tc("validation.governorateRequired");
    }
    if (!form.city.trim()) errors.city = tc("validation.cityRequired");
    if (!form.street.trim()) errors.street = tc("validation.streetRequired");
    return errors;
  }, [form, tc]);

  // ---------------------------------------------------------------------------
  // Submit
  // ---------------------------------------------------------------------------
  const handleSubmit = useCallback(
    async (event: React.FormEvent) => {
      event.preventDefault();
      if (submitting || coolingDown) return;

      setApiError(null);

      const errors = validate();
      if (Object.keys(errors).length > 0) {
        setFieldErrors(errors);
        setApiError(tc("fixRequiredFields"));
        return;
      }
      if (form.payment_method === "online" && !gateway) {
        setApiError(gatewaysError ? tc("paymentGatewaysError") : tc("onlineUnavailable"));
        return;
      }

      setSubmitting(true);
      const payload = {
        name: form.name.trim(),
        user_phone: form.user_phone.trim(),
        ...(form.user_email.trim() ? { user_email: form.user_email.trim() } : {}),
        address: {
          street: form.street.trim(),
          city: form.city.trim(),
        },
        notes: form.notes.trim() || undefined,
        governorate_id: form.governorate_id as number,
        fulfillment_type: "delivery" as const,
        payment_method: form.payment_method,
        ...(form.payment_method === "online" && gateway ? { gateway } : {}),
        shipping_type: "local",
      };

      let orderId: number;
      let orderNumber: string;

      try {
        const checkoutKey = getOrCreateIdempotencyKey("checkout");
        const result = await runWithGuestSession(locale, () =>
          guestCheckoutService.checkout(payload, checkoutKey, locale),
        );
        clearIdempotencyKey("checkout");

        orderId = result.order.id;
        orderNumber = result.order.order_number;
        setCartBadge(0);
      } catch (error) {
        if (error instanceof ApiError) {
          // A rejected checkout must not keep its intent key — only genuine
          // in-progress states (409) and network failures should reuse it.
          if (error.status === 400 || error.status === 422) {
            clearIdempotencyKey("checkout");
          }
          if (error.status === 400) {
            setApiError(tc("errors.cartNotFound"));
          } else if (error.status === 429) {
            setCooldown(RATE_LIMIT_COOLDOWN_SECONDS);
            setApiError(tc("errors.tooManyAttempts"));
          } else if (error.fields && Object.keys(error.fields).length > 0) {
            const mapped: Record<string, string> = {};
            for (const [field, messages] of Object.entries(error.fields)) {
              const clean = field
                .replace(/^item\./, "")
                .replace(/^address\./, "");
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

      // Checkout consumed the cart. Re-issue the public tokens: the ones
      // returned by checkout are known to be unusable for track/cancel.
      let issuedTokens: GuestOrderTokensResult | null = null;
      try {
        issuedTokens = await runWithGuestSession(locale, () =>
          guestCheckoutService.issueAccessTokens(orderId, locale),
        );
      } catch {
        // Non-fatal — the confirmation page can re-issue them.
      }
      saveGuestOrderTokens({
        orderId,
        orderNumber,
        trackingToken: issuedTokens?.tracking_token ?? null,
        cancellationToken: issuedTokens?.cancellation_token ?? null,
      });

      let paymentFailed = false;
      try {
        const paymentKey = getOrCreateIdempotencyKey(`payment-${orderId}`);
        const payment = await runWithGuestSession(locale, () =>
          guestCheckoutService.initiatePayment(
            orderId,
            form.payment_method === "online"
              ? { payment_method: "online", gateway: gateway ?? undefined }
              : { payment_method: "cod" },
            paymentKey,
            locale,
          ),
        );
        clearIdempotencyKey(`payment-${orderId}`);

        if (form.payment_method === "online" && payment.url) {
          saveGuestPaymentReturnNote(orderId);
          window.location.href = payment.url;
          return;
        }
      } catch {
        // The order exists and the cart is gone — never resubmit checkout.
        // The confirmation page offers a "complete payment" retry instead.
        paymentFailed = true;
      }

      intlRouter.push(
        paymentFailed
          ? `/guest-order/${orderId}?payment=retry`
          : `/guest-order/${orderId}`,
      );
    },
    [
      submitting,
      coolingDown,
      validate,
      form,
      gateway,
      gatewaysError,
      locale,
      setCartBadge,
      intlRouter,
      tc,
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
        <Button type="button" variant="outline" className="mt-4" onClick={loadCart}>
          {tc("retry")}
        </Button>
      </div>
    );
  }

  if (!cart || totalQuantity === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <AlertTriangle className="mb-3 h-10 w-10 text-red-400" />
        <p className="text-sm font-semibold text-text-primary">{t("emptyCart")}</p>
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

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
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
          <h2 className="text-sm font-bold uppercase tracking-wider text-text-primary">
            {tc("contactInfo")}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label={tc("name")}
              name="name"
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
            value={form.user_email}
            onChange={(e) => setField("user_email", e.target.value)}
            error={err("user_email")}
          />
        </section>

        {/* Address */}
        <section className="rounded-2xl border-2 border-border bg-white p-5 sm:p-6 space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-text-primary">
            {tc("addressTitle")}
          </h2>
          <FieldWrapper label={tc("governorate")} error={err("governorate_id")} htmlFor="governorate_id">
            <select
              id="governorate_id"
              name="governorate_id"
              value={form.governorate_id ?? ""}
              onChange={(e) => setField("governorate_id", e.target.value ? Number(e.target.value) : null)}
              disabled={governoratesLoading}
              required
              className="w-full rounded-lg border bg-white px-3 py-2.5 text-sm text-text-primary focus:border-primary/50 focus:outline-none disabled:cursor-not-allowed disabled:bg-surface"
            >
              <option value="">
                {governoratesLoading ? tc("governorateLoading") : tc("governoratePlaceholder")}
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
              value={form.city}
              onChange={(e) => setField("city", e.target.value)}
              error={err("city")}
              required
            />
            <Input
              label={tc("streetAddress")}
              name="street"
              value={form.street}
              onChange={(e) => setField("street", e.target.value)}
              error={err("street")}
              required
            />
          </div>
          <Input
            label={tc("notes")}
            name="notes"
            value={form.notes}
            onChange={(e) => setField("notes", e.target.value)}
            placeholder={tc("notesPlaceholder")}
          />
        </section>

        {/* Payment */}
        <section className="rounded-2xl border-2 border-border bg-white p-5 sm:p-6 space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-text-primary">
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
                <span className="block text-xs text-text-secondary">{tc("onlineDesc")}</span>
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
                <span className="block text-xs text-text-secondary">{tc("codDesc")}</span>
              </span>
            </label>
          </div>

          {form.payment_method === "online" && (
            <div className="space-y-2">
              {gatewaysLoading ? (
                <p className="text-xs text-text-secondary">{tc("loadingPaymentGateways")}</p>
              ) : gatewaysError ? (
                <div className="flex items-center gap-3">
                  <p className="text-xs text-error">{tc("paymentGatewaysError")}</p>
                  <Button type="button" variant="outline" size="sm" onClick={retryGateways}>
                    {tc("retry")}
                  </Button>
                </div>
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
        </section>
      </div>

      {/* Summary */}
      <div className="lg:col-span-1">
        <div className="rounded-2xl border-2 border-border bg-white p-5 space-y-4 lg:sticky lg:top-24">
          <h3 className="text-sm font-bold uppercase tracking-wider text-text-primary">
            {tc("orderSummary")}
          </h3>
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-text-secondary">
                {tc("subtotal")} <span className="text-xs">({totalQuantity} {tc("items")})</span>
              </span>
              <Price amount={subtotal} />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-text-secondary">{tc("shipping")}</span>
              {shippingQuote.fee === 0 ? (
                <span className="text-success text-xs font-semibold">{tc("freeShipping")}</span>
              ) : (
                <Price amount={shippingQuote.fee} />
              )}
            </div>
            {taxAmount > 0 && (
              <div className="flex items-center justify-between">
                <span className="text-text-secondary">
                  {taxRate && taxRate > 0 ? tc("taxWithRate", { rate: taxRate }) : tc("tax")}
                </span>
                <Price amount={taxAmount} />
              </div>
            )}
          </div>
          <div className="border-t border-border pt-3 flex items-center justify-between">
            <span className="text-xs font-medium uppercase tracking-wider text-text-secondary">
              {tc("total")}
            </span>
            <Price amount={total} className="text-lg font-bold text-text-primary" />
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
            <p className="text-center text-xs text-text-secondary">{tc("processing")}</p>
          )}
        </div>
      </div>
    </form>
  );
}
