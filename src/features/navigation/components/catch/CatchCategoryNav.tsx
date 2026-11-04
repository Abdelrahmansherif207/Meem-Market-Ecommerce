import { getTranslations } from "next-intl/server";
import { categoryMenuService } from "@/features/categories/services/categoryMenuService";
import type { CategoryMenuItem } from "@/features/categories/types";
import CatchCategoryNavClient from "./CatchCategoryNavClient";

export default async function CatchCategoryNav({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations("catchHeader");

  let categories: CategoryMenuItem[] = [];
  try {
    categories = await categoryMenuService.getMenu(locale);
  } catch (e) {
    console.error("[CatchCategoryNav] Failed to fetch category menu", e);
  }

  return (
    <CatchCategoryNavClient
      allCategoriesLabel={t("categories")}
      categories={categories}
    />
  );
}
