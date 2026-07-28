import { apiFetch } from "@/shared/lib/api";
import type { ApiResponse } from "@/shared/types";
import SectionTitle from "@/components/ui/SectionTitle";
import ContentItem from "../contentSection/ContentItem";

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
    <div className="w-full">
      <SectionTitle title="Featured Categories" />
      <div className="grid grid-cols-3 gap-x-4 gap-y-4 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:gap-x-6">
        {categories.map((category) => (
          <ContentItem
            key={category.id}
            item={{
              id: category.id,
              name: category.name,
              slug: category.slug,
              image: category.image,
            }}
            isCircle
          />
        ))}
      </div>
    </div>
  );
}
