"use client";

import { ShoppingCart } from "lucide-react";
import { useSyncExternalStore } from "react";
import { Link } from "@/i18n/navigation";
import { useAuthStore } from "@/features/auth/store/useAuthStore";
import { useGuestCartStore } from "@/features/cart/store/useGuestCartStore";
import { useServerCartStore } from "@/features/cart/store/useServerCartStore";

export default function MobileCartIcon() {
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const guestCartCount = useGuestCartStore((s) => s.getTotalItems());
  const serverCartCount = useServerCartStore((s) => s.totalQuantity);
  const cartCount = isAuthenticated ? serverCartCount : guestCartCount;

  return (
    <Link
      href="/cart"
      className="relative inline-flex h-10 w-10 items-center justify-center rounded-full bg-primary text-white shrink-0"
      aria-label="Cart"
    >
      <ShoppingCart className="h-5 w-5" />
      {mounted && cartCount > 0 && (
        <span className="absolute -top-1 -end-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-secondary text-white font-bold px-1 text-xs">
          {cartCount}
        </span>
      )}
    </Link>
  );
}
