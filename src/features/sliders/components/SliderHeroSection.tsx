import { sliderService } from "../services/sliderService";
import SliderHeroClient from "./SliderHeroClient";
import type { Slider } from "../types";

interface SliderHeroSectionProps {
  locale: string;
}

export default async function SliderHeroSection({ locale }: SliderHeroSectionProps) {
  let sliders: Slider[] = [];
  try {
    sliders = await sliderService.getSliders(locale);
  } catch (error) {
    console.warn("[SliderHeroSection] Failed to fetch sliders:", error);
    return null;
  }

  if (!sliders.length) return null;

  const validSliders = sliders.filter((s) => s.image?.desktop && s.image?.mobile);
  if (!validSliders.length) return null;

  return <SliderHeroClient sliders={validSliders} />;
}
