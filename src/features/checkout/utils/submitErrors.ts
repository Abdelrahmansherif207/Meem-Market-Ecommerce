import { ApiError } from "@/shared/lib/api";
import type { useTranslations } from "next-intl";
import type { OrderFlowDefinition } from "../types";
import { localizedText } from "../types";
import type { FieldError } from "../schemas/checkoutSchema";

/**
 * Maps checkout 422 errors to field errors. `apiFetch` normalizes both error
 * shapes (bare FormRequest maps and the `{data:{errors}}` service envelope)
 * into `ApiError.fields`, so each error key is mapped to its flow input and
 * rendered under the field (`flow:<key>`); unknown keys land in the banner.
 */
export function handleCheckoutSubmitError(
  err: unknown,
  t: ReturnType<typeof useTranslations>,
  locale: string,
  flow: OrderFlowDefinition | null,
  onFieldErrors: (errors: FieldError[]) => void,
  onGeneric: () => void,
  onUnknownKey: () => void,
): void {
  if (!(err instanceof ApiError) || Object.keys(err.fields).length === 0) {
    onGeneric();
    return;
  }
  const inputsByKey = new Map((flow?.inputs ?? []).map((input) => [input.key, input]));
  const fieldErrors: FieldError[] = [];
  let hasUnknown = false;
  for (const [field, messages] of Object.entries(err.fields)) {
    const input = inputsByKey.get(field);
    if (input) {
      const label = localizedText(input.label, locale);
      fieldErrors.push({
        field: `flow:${field}`,
        message: messages[0] ?? t("flowInputs.invalidValue", { field: label }),
      });
    } else {
      fieldErrors.push({ field, message: messages[0] });
      hasUnknown = true;
    }
  }
  if (hasUnknown) {
    onUnknownKey();
  }
  if (fieldErrors.length > 0) {
    onFieldErrors(fieldErrors);
  } else {
    onGeneric();
  }
}
