import { cn } from "@/shared/utils/cn";
import {
  buildYouTubeEmbedUrl,
  type PromotionVideo,
} from "@/features/settings";
import CatchHeroVideoPlayer from "./CatchHeroVideoPlayer";

interface CatchPromotionVideoProps {
  video: PromotionVideo;
  poster: string;
  title?: string;
  videoClassName?: string;
  /** Start playback automatically when visible (CMS `autoplay`). */
  autoplay?: boolean;
  /** Restart the video when it reaches the end (CMS `loop`). */
  loop?: boolean;
  /** Play without sound (CMS `muted`). */
  muted?: boolean;
}

/**
 * Settings-driven campaign video for the hero.
 *
 * Direct video files reuse the existing art-directed `<video>` player.
 * YouTube links render as a background iframe (no controls, pointer-events
 * disabled so the hero copy/CTA stay interactive) with playback options from
 * the CMS hero settings. Invalid or placeholder URLs are rejected upstream by
 * `resolvePromotionVideo`.
 */
export default function CatchPromotionVideo({
  video,
  poster,
  title,
  videoClassName,
  autoplay = true,
  loop = true,
  muted = true,
}: CatchPromotionVideoProps) {
  if (video.kind === "file") {
    return (
      <CatchHeroVideoPlayer
        desktopSrc={video.src}
        mobileSrc={video.src}
        poster={poster}
        videoClassName={videoClassName}
        autoplay={autoplay}
        loop={loop}
        muted={muted}
      />
    );
  }

  return (
    <iframe
      src={buildYouTubeEmbedUrl(video.videoId, { autoplay, loop, muted })}
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
