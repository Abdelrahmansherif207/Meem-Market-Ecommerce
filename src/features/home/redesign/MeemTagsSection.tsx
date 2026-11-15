import { Link } from "@/i18n/navigation";
import { tagService } from "@/features/tags/services/tagService";
import type { SectionFrontSetting } from "../types";

interface MeemTagsSectionProps {
  title: string;
  locale: string;
  setting?: SectionFrontSetting;
  endpoint?: string;
}

/**
 * Screen-matched tags strip: dark pill row of hashtag links, following
 * the screen's black announcement-strip language.
 */
export default async function MeemTagsSection({
  title,
  locale,
  setting,
  endpoint,
}: MeemTagsSectionProps) {
  void locale;

  let tags;
  try {
    tags = endpoint
      ? await tagService.getTagsByEndpoint(endpoint, locale)
      : [];
  } catch (error) {
    console.error("[MeemTagsSection] Failed to load tags", error);
    return null;
  }

  if (!tags || tags.length === 0) return null;

  const showTitle = setting?.show_title !== false;
  const showHashtag = setting?.show_hashtag !== false;
  const tone = setting?.tone ?? "dark";

  const toneClasses =
    tone === "light"
      ? {
          section: "bg-meem-surface ring-1 ring-meem-border-soft",
          title: "text-meem-muted",
          pill: "border-meem-border-soft text-meem-charcoal hover:border-meem-charcoal hover:bg-meem-charcoal hover:text-white",
          hash: "text-meem-muted-soft",
        }
      : tone === "berry"
        ? {
            section: "bg-meem-deep",
            title: "text-white/70",
            pill: "border-white/25 text-white hover:border-white hover:bg-white hover:text-meem-deep",
            hash: "text-white/50",
          }
        : {
            section: "bg-black",
            title: "text-white/60",
            pill: "border-white/20 text-white hover:border-white hover:bg-white hover:text-black",
            hash: "text-white/50",
          };

  return (
    <section
      className={`w-full overflow-hidden rounded-2xl py-3 ${toneClasses.section}`}
    >
      {showTitle ? (
        <span
          className={`mx-4 text-xs font-bold uppercase tracking-wider ${toneClasses.title}`}
        >
          {title}
        </span>
      ) : null}
      <div className="flex items-center gap-2 overflow-x-auto px-4 no-scrollbar">
        {tags.map((tag) => (
          <Link
            key={tag.id}
            href={`/tags/${tag.slug}`}
            className={`shrink-0 rounded-full border px-3 py-1 text-xs font-semibold transition-colors ${toneClasses.pill}`}
          >
            {showHashtag ? (
              <span className={toneClasses.hash}># </span>
            ) : null}
            {tag.name}
          </Link>
        ))}
      </div>
    </section>
  );
}
