import { cn } from "@/shared/utils/cn";
import type { PromotionVideo } from "@/features/settings";
import CatchHeroVideoPlayer from "./CatchHeroVideoPlayer";

interface CatchPromotionVideoProps {
  video: PromotionVideo;
  poster: string;
  title?: string;
  videoClassName?: string;
}

/**
 * Settings-driven campaign video for the hero.
 *
 * Direct video files reuse the existing art-directed `<video>` player.
 * YouTube links render as a muted, looping background iframe (no controls,
 * pointer-events disabled so the hero copy/CTA stay interactive). Invalid
 * or placeholder URLs are rejected upstream by `resolvePromotionVideo`.
 */
export default function CatchPromotionVideo({
  video,
  poster,
  title,
  videoClassName,
}: CatchPromotionVideoProps) {
  if (video.kind === "file") {
    return (
      <CatchHeroVideoPlayer
        desktopSrc={video.src}
        mobileSrc={video.src}
        poster={poster}
        videoClassName={videoClassName}
      />
    );
  }

  return (
    <iframe
      src={video.embedSrc}
      title={title || "Promotion video"}
      allow="autoplay; encrypted-media; picture-in-picture"
      referrerPolicy="strict-origin-when-cross-origin"
      tabIndex={-1}
      aria-hidden="true"
      className={cn(
        "pointer-events-none absolute inset-0 h-full w-full border-0 object-cover",
        videoClassName,
      )}
    />
  );
}
