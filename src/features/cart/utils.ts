export function calcSubtotal(items: Array<{ price: number; quantity: number }>): number {
  return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
}

export function calcTotalQuantity(items: Array<{ quantity: number }>): number {
  return items.reduce((sum, item) => sum + item.quantity, 0);
}

export function isFreeShipping(subtotal: number, freeShippingThreshold: number): boolean {
  return subtotal >= freeShippingThreshold;
}

export function canCheckout(subtotal: number, minimumOrderAmount: number): boolean {
  return subtotal >= minimumOrderAmount;
}