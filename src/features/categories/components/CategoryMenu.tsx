import { categoryMenuService } from "../services/categoryMenuService";
import type { CategoryMenuItem } from "../types";
import CategoryMenuClient from "./CategoryMenuClient";

export default async function CategoryMenu({ locale }: { locale: string }) {
  let categories: CategoryMenuItem[] = [];

  try {
    categories = await categoryMenuService.getMenu(locale);
  } catch (error) {
    console.error("Failed to fetch category menu", error);
    return null;
  }

  return <CategoryMenuClient categories={categories} />;
}
