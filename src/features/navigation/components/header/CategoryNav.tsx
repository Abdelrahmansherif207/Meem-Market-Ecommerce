import { getTranslations } from "next-intl/server";
import { categoryMenuService } from "@/features/categories/services/categoryMenuService";
import CategoryNavClient from "./CategoryNavClient";
import { NavSkeleton } from "./NavSkeleton";

export default async function CategoryNav({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations("header.categoryNav");

  let categories: import("@/features/categories/types").CategoryMenuItem[] = [];
  let error = false;
  try {
    categories = await categoryMenuService.getMenu(locale);
  } catch (e) {
    console.error("Failed to fetch category menu", e);
    error = true;
  }

  if (error) {
    return (
      <div className="flex h-11 items-center gap-3 rounded-md px-2">
        <span className="text-sm text-text-secondary">
          {t("allCategories")}
        </span>
      </div>
    );
  }

  if (!categories?.length) return null;

  return (
    <CategoryNavClient
      allCategoriesLabel={t("allCategories")}
      categories={categories}
    />
  );
}

export function CategoryNavSkeleton() {
  return <NavSkeleton />;
}
