"use client";

import { Home, LayoutGrid, ShoppingCart, User } from "lucide-react";
import { useSyncExternalStore } from "react";
import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { cn } from "@/shared/utils/cn";
import { useAuthStore } from "@/features/auth/store/useAuthStore";
import { useGuestCartStore } from "@/features/cart/store/useGuestCartStore";
import { useServerCartStore } from "@/features/cart/store/useServerCartStore";

type NavItem = {
  label: string;
  icon: typeof Home;
  href: string;
  isCenter?: boolean;
  isCart?: boolean;
};

const navItems: NavItem[] = [
  { label: "categories", icon: LayoutGrid, href: "/categories" },
  { label: "home", icon: Home, href: "/", isCenter: true },
  { label: "profile", icon: User, href: "/profile" },
  { label: "cart", icon: ShoppingCart, href: "/cart", isCart: true },
];

function CartBadge({ count }: { count: number }) {
  if (count <= 0) return null;
  return (
    <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-secondary text-[9px] font-bold text-white px-1">
      {count > 99 ? "99+" : count}
    </span>
  );
}

export default function MobileBottomNav() {
  const t = useTranslations("header.bottomNav");
  const pathname = usePathname();
  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };
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
    <nav className="fixed bottom-0 left-0 right-0 z-50 w-full border-t border-border bg-background lg:hidden">
      <div className="flex items-center justify-around py-1">
        {navItems.map((item) => (
          <Link
            key={item.label}
            href={item.href}
            className={cn(
              "relative flex flex-col items-center gap-0.5 px-3 py-1.5",
              isActive(item.href) && "border-t-2 border-primary text-primary",
              !isActive(item.href) && item.isCenter && "text-primary",
              !isActive(item.href) && !item.isCenter && "text-text-primary",
            )}
          >
            <item.icon className="h-5 w-5" />
            <span className="text-[10px] leading-tight">{t(item.label)}</span>
            {item.isCart && mounted && <CartBadge count={cartCount} />}
          </Link>
        ))}
      </div>
    </nav>
  );
}
