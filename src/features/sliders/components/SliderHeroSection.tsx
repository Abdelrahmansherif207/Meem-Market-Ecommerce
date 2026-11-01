import { homePageService } from "@/features/home/services/homePageService";
import { sliderService } from "../services/sliderService";
import SliderHeroClient from "./SliderHeroClient";
import type { Slider } from "../types";
import type { SectionFrontSetting } from "@/features/home/types";

interface SliderHeroSectionProps {
  locale: string;
  title?: string;
  setting?: SectionFrontSetting;
  endpoint?: string;
}

export default async function SliderHeroSection({
  locale,
  setting,
  endpoint,
}: SliderHeroSectionProps) {
  let sliders: Slider[] = [];
  try {
    // Home is CMS-driven: section endpoints always bypass the Data Cache.
    sliders = endpoint
      ? await homePageService.fetchSectionData<Slider[]>(endpoint, locale)
      : await sliderService.getSliders(locale);
  } catch (error) {
    console.warn("[SliderHeroSection] Failed to fetch sliders:", error);
    return null;
  }

  if (!sliders.length) return null;

  const validSliders = sliders.filter((s) => s.image?.desktop && s.image?.mobile);
  if (!validSliders.length) return null;

  return (
    <SliderHeroClient
      sliders={validSliders}
      locale={locale}
      autoplay={setting?.autoplay}
      sliderSpeed={setting?.slider_speed}
    />
  );
}
