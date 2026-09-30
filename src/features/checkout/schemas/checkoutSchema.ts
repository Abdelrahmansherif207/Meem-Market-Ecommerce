import { isCheckoutRequired } from "../components/FlowInputsSection";
import type { CheckoutFormData, FlowValue, FlowValues, LocalizedText, OrderFlowDefinition } from "../types";
import { localizedText } from "../types";

export interface FieldError {
  field: string;
  message: string;
}

export interface StepValidatorDeps {
  /** Translates `checkout.validation.<key>`. */
  vt: (key: string) => string;
}

function isEmptyFlowValue(value: FlowValue | undefined): boolean {
  if (value === undefined || value === null) return true;
  if (typeof value === "string") return value.trim() === "";
  if (Array.isArray(value)) return value.length === 0;
  return false;
}

export function validateContactStep(
  form: CheckoutFormData,
  { vt }: StepValidatorDeps,
): FieldError[] {
  const errors: FieldError[] = [];
  if (!form.name.trim()) errors.push({ field: "name", message: vt("nameRequired") });
  if (!form.user_phone.trim()) errors.push({ field: "user_phone", message: vt("phoneRequired") });
  if (!form.user_email.trim()) {
    errors.push({ field: "user_email", message: vt("emailRequired") });
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.user_email)) {
    errors.push({ field: "user_email", message: vt("emailInvalid") });
  }
  return errors;
}

export interface DeliveryStepDeps extends StepValidatorDeps {
  governorateId: number | null;
  flow: OrderFlowDefinition | null;
  flowValues: FlowValues;
  /** Translates a flow input label into a "field required" message. */
  flowLabel: (input: { key: string; label: LocalizedText }) => string;
}

export function validateDeliveryStep(
  form: CheckoutFormData,
  { vt, governorateId, flow, flowValues, flowLabel }: DeliveryStepDeps,
): FieldError[] {
  const errors: FieldError[] = [];
  if (form.fulfillment_type === "delivery") {
    if (governorateId === null) errors.push({ field: "governorate_id", message: vt("governorateRequired") });
    if (!form.city.trim()) errors.push({ field: "city", message: vt("cityRequired") });
    if (!form.country.trim()) errors.push({ field: "country", message: vt("countryRequired") });
    if (!form.street_address.trim()) errors.push({ field: "street_address", message: vt("streetRequired") });
  }
  if (flow) {
    for (const input of flow.inputs ?? []) {
      if (!isCheckoutRequired(input)) continue;
      if (isEmptyFlowValue(flowValues[input.key])) {
        errors.push({ field: `flow:${input.key}`, message: flowLabel(input) });
      }
    }
  }
  return errors;
}

export interface PaymentStepDeps {
  selectedGateway: string | null;
  gatewaysError: boolean;
}

export function validatePaymentStep(
  form: CheckoutFormData,
  { selectedGateway, gatewaysError }: PaymentStepDeps,
): FieldError[] {
  // The gateway-missing case is surfaced as a banner (translated inside the
  // orchestrator) rather than a field error — it has no input to anchor to.
  if (form.payment_method === "online" && !selectedGateway) {
    return [{ field: "__gateway", message: gatewaysError ? "paymentGatewaysError" : "onlineUnavailable" }];
  }
  return [];
}

/** Localized display value for filled flow inputs of scalar widget types. */
export function flowDisplayValue(input: { type: string }, value: FlowValue): string | null {
  if (input.type === "multi_select") return null;
  if (typeof value === "boolean") return value ? "✓" : null;
  if (typeof value === "string" && value.trim()) return value;
  if (typeof value === "number") return String(value);
  return null;
}

export function flowLabel(input: { label: LocalizedText }, locale: string): string {
  return localizedText(input.label, locale);
}
