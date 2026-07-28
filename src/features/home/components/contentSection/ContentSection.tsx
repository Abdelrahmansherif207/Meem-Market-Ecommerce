import SectionTitle from "@/components/ui/SectionTitle";
import { homePageService } from "../../services/homePageService";
import ContentItem from "./ContentItem";
import type { ContentSectionProps, HomeCategory } from "../../types";

export default async function ContentSection({
  title,
  type,
  locale,
  setting,
  endpoint,
}: ContentSectionProps) {
  if (!endpoint) return null;

  let categories: HomeCategory[] = [];
  try {
    categories = await homePageService.fetchSectionData<HomeCategory[]>(endpoint, locale);
  } catch (error) {
    console.error("[ContentSection] Failed to fetch categories:", error);
    return null;
  }

  if (!categories || categories.length === 0) {
    return null;
  }

  const isCircle = setting?.shape === "circle";

  return (
    <div className="w-full">
      <SectionTitle title={title} />
      <div className="grid grid-cols-3 gap-x-4 gap-y-4 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:gap-x-6">
        {categories.map((category) => (
          <ContentItem key={category.id} item={category} isCircle={isCircle} />
        ))}
      </div>
    </div>
  );
}
