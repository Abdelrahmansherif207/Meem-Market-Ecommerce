import { getTranslations } from "next-intl/server";
import { categoryMenuService } from "@/features/categories/services/categoryMenuService";
import type { CategoryMenuItem } from "@/features/categories/types";
import MeemCategoryNavClient from "./MeemCategoryNavClient";

export default async function MeemCategoryNav({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations("meemHeader");

  let categories: CategoryMenuItem[] = [];
  try {
    categories = await categoryMenuService.getMenu(locale);
  } catch (e) {
    console.error("[MeemCategoryNav] Failed to fetch category menu", e);
  }

  return (
    <MeemCategoryNavClient
      allCategoriesLabel={t("categories")}
      categories={categories}
    />
  );
}
