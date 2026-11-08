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

  const showTitle = setting?.show_title !== false;
  const showHashtag = setting?.show_hashtag !== false;
  const tone = setting?.tone ?? "dark";

  const toneClasses =
    tone === "light"
      ? {
          section: "bg-catch-surface ring-1 ring-catch-border-soft",
          title: "text-catch-muted",
          pill: "border-catch-border-soft text-catch-charcoal hover:border-catch-charcoal hover:bg-catch-charcoal hover:text-white",
          hash: "text-catch-muted-soft",
        }
      : tone === "berry"
        ? {
            section: "bg-catch-berry",
            title: "text-white/70",
            pill: "border-white/25 text-white hover:border-white hover:bg-white hover:text-catch-berry",
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
