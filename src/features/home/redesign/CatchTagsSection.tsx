import { Link } from "@/i18n/navigation";
import { tagService } from "@/features/tags/services/tagService";
import type { SectionFrontSetting } from "../types";

interface CatchTagsSectionProps {
  title: string;
  locale: string;
  setting?: SectionFrontSetting;
  endpoint?: string;
}

/**
 * Screen-matched tags strip: dark pill row of hashtag links, following
 * the screen's black announcement-strip language.
 */
export default async function CatchTagsSection({
  title,
  locale,
  setting,
  endpoint,
}: CatchTagsSectionProps) {
  void locale;
  void setting;

  let tags;
  try {
    tags = endpoint
      ? await tagService.getTagsByEndpoint(endpoint, locale)
      : [];
  } catch (error) {
    console.error("[CatchTagsSection] Failed to load tags", error);
    return null;
  }

  if (!tags || tags.length === 0) return null;

  return (
    <section className="w-full overflow-hidden rounded-2xl bg-black py-3">
      {title ? (
        <span className="mx-4 text-xs font-bold uppercase tracking-wider text-white/60">
          {title}
        </span>
      ) : null}
      <div className="flex items-center gap-2 overflow-x-auto px-4 no-scrollbar">
        {tags.map((tag) => (
          <Link
            key={tag.id}
            href={`/tags/${tag.slug}`}
            className="shrink-0 rounded-full border border-white/20 px-3 py-1 text-xs font-semibold text-white transition-colors hover:border-white hover:bg-white hover:text-black"
          >
            <span className="text-white/50">#</span> {tag.name}
          </Link>
        ))}
      </div>
    </section>
  );
}
