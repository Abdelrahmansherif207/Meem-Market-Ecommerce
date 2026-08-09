import { apiFetch } from "@/shared/lib/api";
import type { ApiResponse } from "@/shared/types";
import CategoryGridSlider from "../categoryGridSlider/CategoryGridSlider";

interface FeaturedCategory {
  id: number;
  name: string;
  slug: string;
  image: {
    desktop: string;
    mobile: string;
  };
  products_count: number;
}

export default async function FeaturedCategories({ locale }: { locale: string }) {
  let categories: FeaturedCategory[] = [];
  try {
    const response = await apiFetch<ApiResponse<FeaturedCategory[]>>(
      "/featured-categories",
      { headers: { lang: locale }, next: { revalidate: 120 } },
    );
    categories = response.data;
  } catch {
    return null;
  }

  if (!categories?.length) return null;

  return (
    <CategoryGridSlider title="Featured Categories" categories={categories} isCircle />
  );
}
