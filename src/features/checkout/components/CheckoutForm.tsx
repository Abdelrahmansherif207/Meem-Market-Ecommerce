"use client";
import { useEffect, useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { Loader2, CreditCard, MapPin, Store, Truck, Plus } from "lucide-react";
import { useShallow } from "zustand/react/shallow";
import { useAuthStore } from "@/features/auth/store/useAuthStore";
import { usePickupLocationStore } from "@/features/pickup-location";
import { PickupSelector } from "./PickupSelector";
import { cartService } from "@/features/cart/services/cartService";
import { checkoutService } from "../services/checkoutService";
import { governorateService } from "../services/governorateService";
import { PromotionsPanel } from "./PromotionsPanel";
import { OrderSummary } from "./OrderSummary";
import { CheckoutFormSkeleton } from "./CheckoutFormSkeleton";
import type { CheckoutFormData, FulfillmentType, PaymentMethod, EligiblePromotion, Governorate } from "../types";
import { addressService } from "@/features/profile/services/addressService";
import type { Address } from "@/features/profile/types";
import type { CartApiCart } from "@/features/cart/types";
import type { AppliedCoupon } from "@/features/coupons/types";
import { ApiError } from "@/shared/lib/api";

const initialForm = (user: { name?: string | null; email?: string | null; phone?: string | null }): CheckoutFormData => ({
  name: user.name ?? "",
  user_phone: user.phone ?? "",
  user_email: user.email ?? "",
  governorate_id: null,
  city: "",
  state: "",
  country: "",
  street_address: "",
  notes: "",
  fulfillment_type: "delivery",
  payment_method: "online",
  selected_promotion_id: null,
  selected_promotion_discount: 0,
  selected_gift_product_id: null,
  shipping_fee: 0,
});

interface FieldError {
  field: string;
  message: string;
}

interface CartCheckoutData {
  subtotal: number;
  totalQuantity: number;
  couponDiscount: number;
  appliedCoupon: AppliedCoupon | null;
  expired: boolean;
}

function validate(form: CheckoutFormData): FieldError[] {
  const errors: FieldError[] = [];
  if (!form.name.trim()) errors.push({ field: "name", message: "Name is required" });
  if (!form.user_phone.trim()) errors.push({ field: "user_phone", message: "Phone is required" });
  if (!form.user_email.trim()) {
    errors.push({ field: "user_email", message: "Email is required" });
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.user_email)) {
    errors.push({ field: "user_email", message: "Invalid email" });
  }
  if (form.fulfillment_type === "delivery") {
    if (form.governorate_id === null) errors.push({ field: "governorate_id", message: "Governorate is required" });
    if (!form.city.trim()) errors.push({ field: "city", message: "City is required" });
    if (!form.country.trim()) errors.push({ field: "country", message: "Country is required" });
    if (!form.street_address.trim()) errors.push({ field: "street_address", message: "Street address is required" });
  }
  return errors;
}

export function CheckoutForm() {
  const t = useTranslations("checkout");
  const router = useRouter();
  const locale = useLocale();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const user = useAuthStore(
    useShallow((s) => ({ name: s.name, email: s.email, phone: s.phoneNumber })),
  );
  const selectedLocationId = usePickupLocationStore((s) => s.selectedLocationId);
  const clearLocation = usePickupLocationStore((s) => s.clear);

  const [form, setForm] = useState<CheckoutFormData>(() => initialForm(user));
  const [errors, setErrors] = useState<FieldError[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [cartData, setCartData] = useState<CartCheckoutData | null>(null);
  const [cartLoading, setCartLoading] = useState(true);
  const [pickupLocationName, setPickupLocationName] = useState<string>("");
  const [governorates, setGovernorates] = useState<Governorate[]>([]);
  const [governoratesLoading, setGovernoratesLoading] = useState(true);
  const [governoratesError, setGovernoratesError] = useState(false);

  const [savedAddresses, setSavedAddresses] = useState<Address[]>([]);
  const [addressesLoading, setAddressesLoading] = useState(false);
  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null);
  const [showAddAddress, setShowAddAddress] = useState(false);
  const [newAddressTitle, setNewAddressTitle] = useState("");
  const [newAddressZip, setNewAddressZip] = useState("");
  const [newAddressDefault, setNewAddressDefault] = useState(false);
  const [addingAddress, setAddingAddress] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const unsub = useAuthStore.persist.onFinishHydration(() => setHydrated(true));
    if (useAuthStore.persist.hasHydrated()) setHydrated(true);
    return unsub;
  }, []);

  const fetchedRef = useRef(false);

  useEffect(() => {
    if (!hydrated) return;
    if (!isAuthenticated) {
      router.replace("/auth?redirect=/payment");
      return;
    }
    if (fetchedRef.current) return;
    fetchedRef.current = true;

    setCartLoading(true);
    cartService.getCart(locale)
      .then((cart: CartApiCart | null) => {
        if (!cart) {
          setCartData({ subtotal: 0, totalQuantity: 0, couponDiscount: 0, appliedCoupon: null, expired: true });
          return;
        }
        const appliedCoupon: AppliedCoupon | null = cart.coupon && cart.coupon_code
          ? { code: cart.coupon_code, name: cart.coupon.name, discount_amount: cart.coupon_discount }
          : null;
        setCartData({
          subtotal: cart.subtotal,
          totalQuantity: cart.total_quantity,
          couponDiscount: cart.coupon_discount,
          appliedCoupon,
          expired: false,
        });
      })
      .catch(() => {
        setCartData({ subtotal: 0, totalQuantity: 0, couponDiscount: 0, appliedCoupon: null, expired: true });
      })
      .finally(() => setCartLoading(false));
  }, [hydrated, isAuthenticated, locale, router]);

  useEffect(() => {
    if (!isAuthenticated) return;
    let cancelled = false;
    const interval = setInterval(async () => {
      try {
        const cart = await cartService.getCart(locale);
        if (!cancelled && (!cart || cart.status === "expired")) {
          setCartData((prev) => prev ? { ...prev, expired: true } : prev);
        }
      } catch {}
    }, 30000);
    return () => { cancelled = true; clearInterval(interval); };
  }, [isAuthenticated, locale]);

  useEffect(() => {
    let cancelled = false;
    setGovernoratesLoading(true);
    setGovernoratesError(false);
    governorateService.getAll(locale)
      .then((data) => {
        if (!cancelled) {
          setGovernorates(data);
          setGovernoratesLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setGovernoratesError(true);
          setGovernoratesLoading(false);
        }
      });
    return () => { cancelled = true; };
  }, [locale]);

  useEffect(() => {
    let cancelled = false;
    setAddressesLoading(true);
    addressService.getAll(locale)
      .then((data) => {
        if (cancelled) return;
        setSavedAddresses(data);
        setAddressesLoading(false);
        const defaultAddr = data.find((a) => a.default);
        if (defaultAddr) {
          setSelectedAddressId(defaultAddr.id);
          setForm((prev) => ({
            ...prev,
            city: defaultAddr.address.city,
            state: defaultAddr.address.state,
            country: defaultAddr.address.country,
            street_address: defaultAddr.address.street_address,
          }));
        }
      })
      .catch(() => {
        if (!cancelled) setAddressesLoading(false);
      });
    return () => { cancelled = true; };
  }, [locale]);

  const handleRetryGovernorates = () => {
    setGovernoratesError(false);
    setGovernoratesLoading(true);
    governorateService.getAll(locale)
      .then((data) => {
        setGovernorates(data);
        setGovernoratesLoading(false);
      })
      .catch(() => {
        setGovernoratesError(true);
        setGovernoratesLoading(false);
      });
  };

  const handleAddressSelect = (id: number | null) => {
    setSelectedAddressId(id);
    if (id === null) {
      setShowAddAddress(false);
      setForm((prev) => ({
        ...prev,
        city: "",
        state: "",
        country: "",
        street_address: "",
      }));
    } else {
      const addr = savedAddresses.find((a) => a.id === id);
      if (addr) {
        setShowAddAddress(false);
        setForm((prev) => ({
          ...prev,
          city: addr.address.city,
          state: addr.address.state,
          country: addr.address.country,
          street_address: addr.address.street_address,
        }));
      }
    }
  };

  const handleAddAddress = async () => {
    if (!newAddressTitle.trim()) return;
    setAddingAddress(true);
    try {
      const created = await addressService.create({
        title: newAddressTitle.trim(),
        type: "billing",
        default: newAddressDefault ? "1" : "0",
        address: {
          zip: newAddressZip.trim(),
          city: form.city.trim() || " ",
          state: form.state.trim() || " ",
          country: form.country.trim() || " ",
          street_address: form.street_address.trim() || " ",
        },
      }, locale);
      setSavedAddresses((prev) => [...prev, created]);
      setSelectedAddressId(created.id);
      setShowAddAddress(false);
      setNewAddressTitle("");
      setNewAddressZip("");
      setNewAddressDefault(false);
    } catch {
      setApiError(t("errorProcessing"));
    } finally {
      setAddingAddress(false);
    }
  };

  const fieldError = (name: string) => errors.find((e) => e.field === name)?.message;

  const set = (field: keyof CheckoutFormData) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    const value = e.target.value;
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => prev.filter((e) => e.field !== field));
    setApiError(null);
  };

  const handleGovernorateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setForm((prev) => ({ ...prev, governorate_id: val ? Number(val) : null }));
    setErrors((prev) => prev.filter((e) => e.field !== "governorate_id"));
    setApiError(null);
  };

  const handleFulfillmentChange = (type: FulfillmentType) => {
    setForm((prev) => {
      let payment_method = prev.payment_method;
      if (type === "pickup" && payment_method === "cod") payment_method = "online";
      if (type === "delivery" && payment_method === "pay_at_cashier") payment_method = "online";
      return { ...prev, fulfillment_type: type, payment_method };
    });
    if (type === "pickup") {
      setErrors((prev) => prev.filter(
        (e) => !["governorate_id", "city", "state", "country", "street_address"].includes(e.field),
      ));
    }
    if (type === "delivery") {
      clearLocation();
    }
  };

  const handlePaymentMethodChange = (method: PaymentMethod) => {
    setForm((prev) => ({ ...prev, payment_method: method }));
  };

  const handlePromotionSelect = (promotion: EligiblePromotion | null) => {
    setForm((prev) => ({
      ...prev,
      selected_promotion_id: promotion?.id ?? null,
      selected_promotion_discount: promotion?.discount ?? 0,
    }));
  };

  const handleCouponApplied = useCallback(() => {
    cartService.getCart(locale).then((cart) => {
      if (cart) {
        const appliedCoupon: AppliedCoupon | null = cart.coupon && cart.coupon_code
          ? { code: cart.coupon_code, name: cart.coupon.name, discount_amount: cart.coupon_discount }
          : null;
        setCartData((prev) => prev ? {
          ...prev,
          couponDiscount: cart.coupon_discount,
          appliedCoupon,
        } : prev);
      }
    }).catch(() => {});
  }, [locale]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError(null);

    const validationErrors = validate(form);
    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      setApiError(t("fixRequiredFields"));
      const firstEl = document.querySelector(`[name="${validationErrors[0].field}"]`);
      firstEl?.scrollIntoView({ behavior: "smooth", block: "center" });
      (firstEl as HTMLElement)?.focus();
      return;
    }

    setSubmitting(true);

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
      gateway: "myfatoorah",
      governorate_id: form.fulfillment_type === "delivery" ? form.governorate_id ?? undefined : undefined,
      selected_promotion_id: form.selected_promotion_id,
      selected_gift_product_id: form.selected_gift_product_id,
      ...(form.fulfillment_type === "pickup" && { pickup_location_id: selectedLocationId }),
    };

    try {
      const result = await checkoutService.processCheckout(payload);

      if (form.payment_method === "online" && result.url) {
        window.location.href = result.url;
      } else if (form.payment_method === "cod") {
        router.push(`/payment/success?order_id=${result.order_id}`);
      } else if (form.payment_method === "pay_at_cashier") {
        if (result.qr_code) {
          sessionStorage.setItem("checkout_qr", result.qr_code);
        }
        router.push(`/payment/success?order_id=${result.order_id}&transaction_id=${result.transaction_uuid}`);
      }
    } catch (err) {
      if (err instanceof ApiError) {
        setApiError(err.message);
        if (Object.keys(err.fields).length > 0) {
          const fieldErrors: FieldError[] = [];
          for (const [field, messages] of Object.entries(err.fields)) {
            fieldErrors.push({ field, message: messages[0] });
          }
          setErrors(fieldErrors);
        }
      } else {
        setApiError(err instanceof Error ? err.message : t("errorProcessing"));
      }
      setSubmitting(false);
    }
  };

  if (!isAuthenticated) return null;

  if (cartLoading) return <CheckoutFormSkeleton />;

  if (cartData?.expired) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <Store className="mb-4 size-12 text-text-secondary" />
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
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <Loader2 className="mb-4 size-10 animate-spin text-primary" />
        <h1 className="text-xl font-bold text-text-primary">{t("processing")}</h1>
        <p className="mt-2 text-sm text-text-secondary">{t("processingDesc")}</p>
      </div>
    );
  }

  const inputClass =
    "w-full rounded-xl border-2 border-border bg-white px-4 py-3 text-sm text-text-primary outline-none transition-colors placeholder:text-text-secondary/50 focus:border-primary";
  const errorClass =
    "w-full rounded-xl border-2 border-red-300 bg-white px-4 py-3 text-sm text-text-primary outline-none transition-colors placeholder:text-text-secondary/50 focus:border-red-400";
  const labelClass = "text-sm font-semibold text-text-primary";
  const radioClass = "h-4 w-4 accent-primary";

  return (
    <form onSubmit={handleSubmit}>
      {apiError && (
        <div className="mb-6 rounded-xl border-2 border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {apiError}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-2xl border-2 border-border bg-white p-6 space-y-5">
            <div className="flex items-center gap-2">
              <div className="h-1 w-6 rounded-full bg-primary" />
              <h2 className="text-sm font-bold uppercase tracking-wider text-text-primary">
                {t("contactInfo")}
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2 space-y-1.5">
                <label className={labelClass}>{t("name")}</label>
                <input name="name" className={fieldError("name") ? errorClass : inputClass} value={form.name} onChange={set("name")} />
                {fieldError("name") && <p className="text-xs text-red-500">{fieldError("name")}</p>}
              </div>
              <div className="space-y-1.5">
                <label className={labelClass}>{t("phone")}</label>
                <input name="user_phone" className={fieldError("user_phone") ? errorClass : inputClass} value={form.user_phone} onChange={set("user_phone")} />
                {fieldError("user_phone") && <p className="text-xs text-red-500">{fieldError("user_phone")}</p>}
              </div>
              <div className="space-y-1.5">
                <label className={labelClass}>{t("email")}</label>
                <input name="user_email" className={fieldError("user_email") ? errorClass : inputClass} type="email" value={form.user_email} onChange={set("user_email")} />
                {fieldError("user_email") && <p className="text-xs text-red-500">{fieldError("user_email")}</p>}
              </div>
            </div>
          </div>

          <div className="rounded-2xl border-2 border-border bg-white p-6 space-y-4">
            <div className="flex items-center gap-2">
              <div className="h-1 w-6 rounded-full bg-primary" />
              <h2 className="text-sm font-bold uppercase tracking-wider text-text-primary">
                {t("fulfillmentType")}
              </h2>
            </div>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => handleFulfillmentChange("delivery")}
                className={`flex-1 flex items-center justify-center gap-2 rounded-xl border-2 p-4 text-sm font-semibold transition-colors ${
                  form.fulfillment_type === "delivery"
                    ? "border-primary bg-primary/5 text-primary"
                    : "border-border text-text-secondary hover:border-primary/50"
                }`}
              >
                <Truck className="size-5" />
                {t("delivery")}
              </button>
              <button
                type="button"
                onClick={() => handleFulfillmentChange("pickup")}
                className={`flex-1 flex items-center justify-center gap-2 rounded-xl border-2 p-4 text-sm font-semibold transition-colors ${
                  form.fulfillment_type === "pickup"
                    ? "border-primary bg-primary/5 text-primary"
                    : "border-border text-text-secondary hover:border-primary/50"
                }`}
              >
                <MapPin className="size-5" />
                {t("pickup")}
              </button>
            </div>

            {form.fulfillment_type === "delivery" && (
              <div className="space-y-4">
                <div className="border-t border-border pt-4 space-y-4">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-text-secondary">
                    {t("addressTitle")}
                  </h3>

                  {addressesLoading ? (
                    <div className="h-10 w-full animate-pulse rounded-xl bg-gray-200" />
                  ) : savedAddresses.length > 0 && (
                    <div className="space-y-1.5">
                      <label className={labelClass}>{t("savedAddresses")}</label>
                      <select
                        className={inputClass}
                        value={selectedAddressId ?? ""}
                        onChange={(e) => handleAddressSelect(e.target.value ? Number(e.target.value) : null)}
                      >
                        <option value="">{t("newAddress")}</option>
                        {savedAddresses.map((a) => (
                          <option key={a.id} value={a.id}>
                            {a.title}{a.default ? ` (${t("default")})` : ""}
                          </option>
                        ))}
                      </select>
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
                        <p className="text-xs text-red-500">{t("governorateError")}</p>
                        <button
                          type="button"
                          onClick={handleRetryGovernorates}
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
                          className={fieldError("governorate_id") ? errorClass : inputClass}
                          value={form.governorate_id ?? ""}
                          onChange={handleGovernorateChange}
                        >
                          <option value="">{t("governoratePlaceholder")}</option>
                          {governorates.map((g) => (
                            <option key={g.id} value={g.id}>
                              {g.name}
                            </option>
                          ))}
                        </select>
                        {fieldError("governorate_id") && (
                          <p className="text-xs text-red-500">{fieldError("governorate_id")}</p>
                        )}
                      </>
                    )}
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <div className="space-y-1.5">
                      <label className={labelClass}>{t("country")}</label>
                    <input name="country" className={fieldError("country") ? errorClass : inputClass} value={form.country} onChange={set("country")} />
                    {fieldError("country") && <p className="text-xs text-red-500">{fieldError("country")}</p>}
                    </div>
                    <div className="space-y-1.5 sm:col-span-2">
                      <label className={labelClass}>{t("city")}</label>
                      <input name="city" className={fieldError("city") ? errorClass : inputClass} value={form.city} onChange={set("city")} />
                      {fieldError("city") && <p className="text-xs text-red-500">{fieldError("city")}</p>}
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className={labelClass}>{t("streetAddress")}</label>
                    <input name="street_address" className={fieldError("street_address") ? errorClass : inputClass} value={form.street_address} onChange={set("street_address")} />
                    {fieldError("street_address") && <p className="text-xs text-red-500">{fieldError("street_address")}</p>}
                  </div>

                  {selectedAddressId === null && savedAddresses.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setShowAddAddress(!showAddAddress)}
                      className="flex items-center gap-2 text-sm font-semibold text-primary"
                    >
                      <Plus className="size-4" />
                      {t("addAddress")}
                    </button>
                  )}

                  {showAddAddress && (
                    <div className="rounded-xl border border-border p-4 space-y-3">
                      <div className="space-y-1.5">
                        <label className={labelClass}>{t("addressTitleLabel")}</label>
                        <input
                          className={inputClass}
                          placeholder={t("addressTitlePlaceholder")}
                          value={newAddressTitle}
                          onChange={(e) => setNewAddressTitle(e.target.value)}
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className={labelClass}>{t("zip")}</label>
                        <input
                          className={inputClass}
                          placeholder={t("zipPlaceholder")}
                          value={newAddressZip}
                          onChange={(e) => setNewAddressZip(e.target.value)}
                        />
                      </div>
                      <label className="flex items-center gap-2 text-sm text-text-primary">
                        <input
                          type="checkbox"
                          checked={newAddressDefault}
                          onChange={(e) => setNewAddressDefault(e.target.checked)}
                          className={radioClass}
                        />
                        {t("setDefault")}
                      </label>
                      <button
                        type="button"
                        disabled={addingAddress || !newAddressTitle.trim()}
                        onClick={handleAddAddress}
                        className="w-full rounded-xl bg-primary py-2.5 text-sm font-semibold text-white transition-all hover:opacity-90 disabled:opacity-50"
                      >
                        {addingAddress ? t("saving") : t("saveAddress")}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {form.fulfillment_type === "pickup" && (
              <PickupSelector onSelect={setPickupLocationName} />
            )}
          </div>

          <div className="rounded-2xl border-2 border-border bg-white p-6 space-y-4">
            <div className="flex items-center gap-2">
              <div className="h-1 w-6 rounded-full bg-primary" />
              <h2 className="text-sm font-bold uppercase tracking-wider text-text-primary">
                {t("paymentMethod")}
              </h2>
            </div>
            <div className="space-y-2">
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
                    onChange={() => handlePaymentMethodChange(method)}
                    className={radioClass}
                  />
                  <div>
                    <span className="text-sm font-medium text-text-primary">{t(`${method}Label`)}</span>
                    <p className="text-xs text-text-secondary mt-0.5">{t(`${method}Desc`)}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border-2 border-border bg-white p-6 space-y-3">
            <div className="flex items-center gap-2">
              <div className="h-1 w-6 rounded-full bg-primary" />
              <h2 className="text-sm font-bold uppercase tracking-wider text-text-primary">{t("notes")}</h2>
            </div>
            <textarea
              className={`${inputClass} min-h-[80px] resize-none`}
              placeholder={t("notesPlaceholder")}
              value={form.notes}
              onChange={set("notes")}
            />
          </div>

          <PromotionsPanel
            selectedId={form.selected_promotion_id}
            onSelect={handlePromotionSelect}
          />
        </div>

        <div className="lg:col-span-1">
          <div className="space-y-4">
            <OrderSummary
              subtotal={cartData?.subtotal ?? 0}
              totalQuantity={cartData?.totalQuantity ?? 0}
              shippingFee={form.shipping_fee}
              promotionDiscount={form.selected_promotion_discount}
              couponDiscount={cartData?.couponDiscount ?? 0}
              pickupLocationName={pickupLocationName || undefined}
              appliedCoupon={cartData?.appliedCoupon}
              onCouponApplied={handleCouponApplied}
            />

            <button
              type="submit"
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3.5 text-sm font-bold text-white transition-all hover:opacity-90"
            >
              <CreditCard className="size-4" />
              {form.payment_method === "online"
                ? t("payNow")
                : form.payment_method === "cod"
                  ? t("placeOrderCod")
                  : t("placeOrderCashier")}
            </button>
          </div>
        </div>
      </div>
    </form>
  );
}
