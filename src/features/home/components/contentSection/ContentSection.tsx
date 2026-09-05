import { homePageService } from "../../services/homePageService";
import CategoryGridSlider from "../categoryGridSlider/CategoryGridSlider";
import type { ContentSectionProps, HomeCategory } from "../../types";

export default async function ContentSection({
  title,
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
    <CategoryGridSlider
      title={title}
      categories={categories}
      isCircle={isCircle}
      autoplay={setting?.autoplay}
      sliderSpeed={setting?.slider_speed}
    />
  );
}
