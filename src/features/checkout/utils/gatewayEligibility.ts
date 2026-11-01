import type { PaymentGatewayOption } from "../types";

/**
 * A gateway may only be selected for online payment when the backend reports
 * it as admin-enabled, operationally available, and payable in the catalog
 * currency. Flags are compared strictly (fail closed): a missing `enabled`
 * or `available` field means we cannot prove the gateway is live, so the
 * gateway is withheld from selection and submission.
 */
export function isGatewayEligible(gateway: PaymentGatewayOption): boolean {
  return (
    gateway.enabled === true &&
    gateway.available === true &&
    gateway.supports_catalog_currency
  );
}
