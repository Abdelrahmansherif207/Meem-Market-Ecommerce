export function calcSubtotal(items: Array<{ price: number; quantity: number }>): number {
  return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
}

export function calcTotalQuantity(items: Array<{ quantity: number }>): number {
  return items.reduce((sum, item) => sum + item.quantity, 0);
}

export function canCheckout(subtotal: number, minimumOrderAmount: number): boolean {
  return subtotal >= minimumOrderAmount;
}

/**
 * Storefront tax estimate for summaries. `rate` is the backend percentage
 * (e.g. 15 for 15%). Returns 0 unless tax is enabled and configured.
 */
export function calcTaxAmount(
  taxableAmount: number,
  enabled: boolean,
  rate: number | null,
): number {
  if (!enabled || !rate || rate <= 0) return 0;
  const tax = Math.max(0, taxableAmount) * (rate / 100);
  return Math.round(tax * 100) / 100;
}