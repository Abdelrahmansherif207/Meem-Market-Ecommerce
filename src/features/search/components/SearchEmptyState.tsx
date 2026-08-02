"use client";

import { useTranslations } from "next-intl";
import { ShoppingBag } from "lucide-react";
import { Link } from "@/i18n/navigation";
import EmptyState from "@/components/ui/EmptyState";

export default function SearchEmptyState() {
  const t = useTranslations("emptyState");

  return (
    <EmptyState
      variant="notFound"
      title={t("noSearchResults")}
      description={t("tryDifferentSearch")}
      actions={
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-white shadow-sm shadow-primary/40 transition-all hover:bg-primary-dark hover:shadow-md"
        >
          <ShoppingBag className="size-4" />
          {t("browseProducts")}
        </Link>
      }
    />
  );
}
