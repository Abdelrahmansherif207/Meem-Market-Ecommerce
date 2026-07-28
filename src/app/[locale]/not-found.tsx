"use client";

import { useTranslations } from "next-intl";
import { FileQuestion, Home, ShoppingBag } from "lucide-react";
import Link from "next/link";

export default function LocaleNotFound() {
  const t = useTranslations("notFound");

  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <FileQuestion className="mb-3 size-10 text-text-secondary" />
      <h1 className="text-xl font-bold text-text-primary">{t("title")}</h1>
      <p className="mt-2 max-w-md text-sm text-text-secondary">
        {t("description")}
      </p>
      <div className="mt-6 flex items-center gap-3">
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:opacity-90"
        >
          <Home className="size-4" />
          {t("goHome")}
        </Link>
        <Link
          href="/products"
          className="inline-flex items-center gap-2 rounded-xl border border-border px-6 py-2.5 text-sm font-semibold text-text-primary transition-colors hover:bg-surface"
        >
          <ShoppingBag className="size-4" />
          {t("browseProducts")}
        </Link>
      </div>
    </div>
  );
}
