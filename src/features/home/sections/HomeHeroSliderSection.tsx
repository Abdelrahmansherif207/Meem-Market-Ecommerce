import { sliderService } from "@/features/sliders/services/sliderService";
import type { Slider } from "@/features/sliders/types";

import HomeHeroSlider from "./clients/HomeHeroSlider";
import HeroEditorialCards from "@/features/home/components/static/HeroEditorialCards";
import { normalizeList } from "./mappers";
import { homePageService } from "../services/homePageService";
import type { SectionFrontSetting } from "../types";

interface HomeHeroSliderSectionProps {
  locale: string;
  endpoint?: string;
  setting?: SectionFrontSetting;
}

/**
 * Stitch hero split: main 8-column CMS slider visual flanked by the two
 * static 4-column editorial promo cards. Slider data contract is unchanged
 * (same endpoint/normalization as before); the side cards are design copy.
 */
export default async function HomeHeroSliderSection({
  locale,
  endpoint,
  setting,
}: HomeHeroSliderSectionProps) {
  let sliders: Slider[] = [];
  try {
    // Home is CMS-driven: section endpoints always bypass the Data Cache.
    // CMS list endpoints may wrap the payload (`{ data: [...] }`) — normalize.
    sliders = endpoint
      ? normalizeList<Slider>(
          await homePageService.fetchSectionData<unknown>(endpoint, locale),
        )
      : await sliderService.getSliders(locale);
  } catch (error) {
    console.warn("[HomeHeroSliderSection] Failed to fetch sliders:", error);
    return <EditorialOnly />;
  }

  const validSliders = sliders.filter(
    (s) => s.image?.desktop && s.image?.mobile,
  );

  if (!validSliders.length) return <EditorialOnly />;

  return (
    <section className="home-container">
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
        <div className="lg:col-span-8">
          <HomeHeroSlider
            slides={validSliders}
            autoplay={setting?.autoplay}
            sliderSpeed={setting?.slider_speed}
          />
        </div>
        <div className="flex flex-col gap-4 lg:col-span-4">
          <HeroEditorialCards />
        </div>
      </div>
    </section>
  );
}

/** Fallback: no slider creatives available — the static editorial pair only. */
function EditorialOnly() {
  return (
    <section className="home-container">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <HeroEditorialCards />
      </div>
    </section>
  );
}
