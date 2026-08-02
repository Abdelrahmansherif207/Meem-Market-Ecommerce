"use client";

import { useTranslations } from "next-intl";
import { Home, ShoppingBag } from "lucide-react";
import Link from "next/link";
import EmptyState from "@/components/ui/EmptyState";

export default function LocaleNotFound() {
  const t = useTranslations("notFound");

  return (
    <div className="flex flex-1 flex-col justify-center py-12">
      <EmptyState
        variant="notFound"
        title={t("title")}
        description={t("description")}
        actions={
          <>
            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-white shadow-sm shadow-primary/40 transition-all hover:bg-primary-dark hover:shadow-md"
            >
              <Home className="size-4" />
              {t("goHome")}
            </Link>
            <Link
              href="/products"
              className="inline-flex items-center gap-2 rounded-xl border border-border bg-white px-6 py-3 text-sm font-semibold text-text-primary transition-colors hover:border-primary/30 hover:bg-primary/5"
            >
              <ShoppingBag className="size-4" />
              {t("browseProducts")}
            </Link>
          </>
        }
      />
    </div>
  );
}
