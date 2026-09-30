"use client";
import { useCallback, useMemo, useReducer, useState } from "react";
import type { PickedAddress } from "@/features/location";
import { addressService } from "@/features/profile/services/addressService";
import type { Address } from "@/features/profile/types";
import type {
  CheckoutFormData,
  EligiblePromotion,
  FlowValue,
  FlowValues,
  FulfillmentType,
  PaymentMethod,
  ShippingType,
} from "../types";
import type { FieldError } from "../schemas/checkoutSchema";

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
  shipping_type: "local",
});

interface CheckoutFormState {
  form: CheckoutFormData;
  flowValues: FlowValues;
  errors: FieldError[];
}

type CheckoutFormAction =
  | { type: "SET_FIELD"; field: keyof CheckoutFormData; value: string }
  | { type: "SET_GOVERNORATE"; value: number | null }
  | { type: "SET_FLOW_VALUE"; key: string; value: FlowValue }
  | { type: "SET_ERRORS"; errors: FieldError[] }
  | { type: "CLEAR_ERRORS_FOR"; fields: string[] }
  | { type: "CLEAR_FLOW_ERRORS" }
  | { type: "APPLY_ADDRESS"; address: Address }
  | { type: "APPLY_PICKED"; picked: PickedAddress }
  | { type: "RESET_ADDRESS_FIELDS" }
  | { type: "SET_SHIPPING_TYPE"; value: ShippingType }
  | { type: "SET_FULFILLMENT"; value: FulfillmentType }
  | { type: "SET_PAYMENT_METHOD"; value: PaymentMethod }
  | { type: "SET_PROMOTION"; promotion: EligiblePromotion | null };

const ADDRESS_FIELDS = ["governorate_id", "city", "state", "country", "street_address"];

function reducer(state: CheckoutFormState, action: CheckoutFormAction): CheckoutFormState {
  switch (action.type) {
    case "SET_FIELD":
      return {
        ...state,
        form: { ...state.form, [action.field]: action.value },
        errors: state.errors.filter((e) => e.field !== action.field),
      };
    case "SET_GOVERNORATE":
      return {
        ...state,
        form: { ...state.form, governorate_id: action.value },
        errors: state.errors.filter((e) => e.field !== "governorate_id"),
      };
    case "SET_FLOW_VALUE":
      return {
        ...state,
        flowValues: { ...state.flowValues, [action.key]: action.value },
        errors: state.errors.filter((e) => e.field !== `flow:${action.key}`),
      };
    case "SET_ERRORS":
      return { ...state, errors: action.errors };
    case "CLEAR_ERRORS_FOR":
      return { ...state, errors: state.errors.filter((e) => !action.fields.includes(e.field)) };
    case "CLEAR_FLOW_ERRORS":
      return { ...state, errors: state.errors.filter((e) => !e.field.startsWith("flow:")) };
    case "APPLY_ADDRESS":
      return {
        ...state,
        form: {
          ...state.form,
          city: action.address.address.city,
          state: action.address.address.state,
          country: action.address.address.country,
          street_address: action.address.address.street_address,
          governorate_id: null,
        },
        errors: state.errors.filter((e) => !ADDRESS_FIELDS.includes(e.field)),
      };
    case "APPLY_PICKED": {
      const picked = action.picked;
      return {
        ...state,
        form: {
          ...state.form,
          city: picked.city.trim() || state.form.city,
          state: picked.state.trim() || state.form.state,
          country: picked.country.trim() || state.form.country,
          street_address: picked.streetAddress.trim() || state.form.street_address,
        },
        errors: state.errors.filter(
          (e) => !["city", "state", "country", "street_address"].includes(e.field),
        ),
      };
    }
    case "RESET_ADDRESS_FIELDS":
      return {
        ...state,
        form: {
          ...state.form,
          city: "",
          state: "",
          country: "",
          street_address: "",
        },
        errors: state.errors.filter(
          (e) => !["city", "state", "country", "street_address"].includes(e.field),
        ),
      };
    case "SET_SHIPPING_TYPE":
      return {
        ...state,
        form: { ...state.form, shipping_type: action.value },
        errors: state.errors.filter((e) => !e.field.startsWith("flow:")),
      };
    case "SET_FULFILLMENT": {
      let payment_method = state.form.payment_method;
      // Pickup cannot use COD; delivery cannot pay at the cashier.
      if (action.value === "pickup" && payment_method === "cod") payment_method = "online";
      if (action.value === "delivery" && payment_method === "pay_at_cashier") payment_method = "online";
      return {
        ...state,
        form: { ...state.form, fulfillment_type: action.value, payment_method },
        errors:
          action.value === "pickup"
            ? state.errors.filter((e) => !["governorate_id", "city", "state", "country", "street_address"].includes(e.field))
            : state.errors,
      };
    }
    case "SET_PAYMENT_METHOD":
      return { ...state, form: { ...state.form, payment_method: action.value } };
    case "SET_PROMOTION":
      return {
        ...state,
        form: {
          ...state.form,
          selected_promotion_id: action.promotion?.id ?? null,
          selected_promotion_discount: action.promotion?.discount ?? 0,
        },
      };
    default:
      return state;
  }
}

interface UseCheckoutFormArgs {
  user: { name?: string | null; email?: string | null; phone?: string | null };
}

export function useCheckoutForm({ user }: UseCheckoutFormArgs) {
  const [state, dispatch] = useReducer(reducer, undefined, () => ({
    form: initialForm(user),
    flowValues: {} as FlowValues,
    errors: [] as FieldError[],
  }));

  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null);
  const [addressTitle, setAddressTitle] = useState("");
  const [pickupLocationName, setPickupLocationName] = useState("");
  const [mapModalOpen, setMapModalOpen] = useState(false);
  const [savingLocation, setSavingLocation] = useState(false);
  const [mapSaveError, setMapSaveError] = useState<string | null>(null);

  const { form, flowValues, errors } = state;

  const fieldError = useCallback(
    (name: string) => errors.find((e) => e.field === name)?.message,
    [errors],
  );

  const setField = useCallback(
    (field: keyof CheckoutFormData) => (
      e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
    ) => {
      const value = e.target.value;
      dispatch({ type: "SET_FIELD", field, value });
    },
    [],
  );

  const setGovernorate = useCallback((value: number | null) => {
    dispatch({ type: "SET_GOVERNORATE", value });
  }, []);

  const setFlowValue = useCallback((key: string, value: FlowValue) => {
    dispatch({ type: "SET_FLOW_VALUE", key, value });
  }, []);

  const clearFlowErrors = useCallback(() => dispatch({ type: "CLEAR_FLOW_ERRORS" }), []);

  const setErrors = useCallback((next: FieldError[]) => {
    dispatch({ type: "SET_ERRORS", errors: next });
  }, []);

  const applyAddress = useCallback((address: Address) => {
    dispatch({ type: "APPLY_ADDRESS", address });
  }, []);

  const applyPickedAddress = useCallback((picked: PickedAddress) => {
    dispatch({ type: "APPLY_PICKED", picked });
  }, []);

  const selectAddress = useCallback((id: number | null, addresses: Address[]) => {
    setSelectedAddressId(id);
    if (id === null) {
      dispatch({ type: "RESET_ADDRESS_FIELDS" });
    } else {
      const addr = addresses.find((a) => a.id === id);
      if (addr) dispatch({ type: "APPLY_ADDRESS", address: addr });
    }
  }, []);

  const setShippingType = useCallback((value: ShippingType) => {
    dispatch({ type: "SET_SHIPPING_TYPE", value });
  }, []);

  const setFulfillment = useCallback((value: FulfillmentType) => {
    dispatch({ type: "SET_FULFILLMENT", value });
  }, []);

  const setPaymentMethod = useCallback((value: PaymentMethod) => {
    dispatch({ type: "SET_PAYMENT_METHOD", value });
  }, []);

  const handlePromotionSelect = useCallback((promotion: EligiblePromotion | null) => {
    dispatch({ type: "SET_PROMOTION", promotion });
  }, []);

  const flowErrorFor = useCallback(
    (key: string) => errors.find((e) => e.field === `flow:${key}`)?.message,
    [errors],
  );

  return useMemo(
    () => ({
      form,
      flowValues,
      errors,
      selectedAddressId,
      addressTitle,
      pickupLocationName,
      mapModalOpen,
      savingLocation,
      mapSaveError,
      fieldError,
      flowErrorFor,
      setField,
      setGovernorate,
      setFlowValue,
      clearFlowErrors,
      setErrors,
      applyAddress,
      applyPickedAddress,
      selectAddress,
      setShippingType,
      setFulfillment,
      setPaymentMethod,
      handlePromotionSelect,
      setAddressTitle,
      setPickupLocationName,
      openMapModal: () => { setMapSaveError(null); setMapModalOpen(true); },
      closeMapModal: () => setMapModalOpen(false),
      setMapSaving: setSavingLocation,
      setMapError: setMapSaveError,
      setSelectedAddressId,
    }),
    [
      form,
      flowValues,
      errors,
      selectedAddressId,
      addressTitle,
      pickupLocationName,
      mapModalOpen,
      savingLocation,
      mapSaveError,
      fieldError,
      flowErrorFor,
      setField,
      setGovernorate,
      setFlowValue,
      clearFlowErrors,
      setErrors,
      applyAddress,
      applyPickedAddress,
      selectAddress,
      setShippingType,
      setFulfillment,
      setPaymentMethod,
      handlePromotionSelect,
    ],
  );
}

export type CheckoutFormController = ReturnType<typeof useCheckoutForm>;

/** Saves a picked map location as a new address and selects it. */
export async function saveMapPickedAddress(
  picked: PickedAddress,
  locale: string,
  defaultTitle: string,
  matchedGovernorateId: number | null,
): Promise<Address | null> {
  try {
    const created = await addressService.create({
      title: picked.title.trim() || picked.formattedAddress.trim() || defaultTitle,
      address: {
        zip: picked.zip.trim() || " ",
        city: picked.city.trim() || " ",
        state: picked.state.trim() || " ",
        country: picked.country.trim() || " ",
        street_address: picked.streetAddress.trim() || " ",
      },
      governorate_id: matchedGovernorateId ?? 0,
      location: { latitude: picked.coords.lat, longitude: picked.coords.lng },
    }, locale);
    return created;
  } catch {
    return null;
  }
}
