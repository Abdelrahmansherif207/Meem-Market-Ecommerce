import { cleanSettingsUrl } from "./normalize";

export type PromotionVideo =
  | { kind: "file"; src: string }
  | { kind: "youtube"; videoId: string; embedSrc: string };

const YOUTUBE_ID = /^[A-Za-z0-9_-]{11}$/;
const VIDEO_FILE = /\.(mp4|webm|ogv|ogg|mov)$/i;

function parseYouTubeId(url: URL): string | null {
  const host = url.hostname.replace(/^www\./, "").toLowerCase();

  if (host === "youtu.be") {
    const id = url.pathname.split("/").filter(Boolean)[0] ?? "";
    return YOUTUBE_ID.test(id) ? id : null;
  }

  if (
    host === "youtube.com" ||
    host === "m.youtube.com" ||
    host === "youtube-nocookie.com"
  ) {
    if (url.pathname === "/watch") {
      const id = url.searchParams.get("v") ?? "";
      return YOUTUBE_ID.test(id) ? id : null;
    }
    const segments = url.pathname.split("/").filter(Boolean);
    const marker = segments[0];
    if (marker === "shorts" || marker === "embed" || marker === "live") {
      const id = segments[1] ?? "";
      return YOUTUBE_ID.test(id) ? id : null;
    }
  }

  return null;
}

export interface YouTubeEmbedOptions {
  autoplay?: boolean;
  loop?: boolean;
  muted?: boolean;
}

export function buildYouTubeEmbedUrl(
  videoId: string,
  { autoplay = true, loop = true, muted = true }: YouTubeEmbedOptions = {},
): string {
  const params = new URLSearchParams({
    controls: "0",
    playsinline: "1",
    modestbranding: "1",
    rel: "0",
  });

  if (autoplay) params.set("autoplay", "1");
  if (muted) params.set("mute", "1");
  if (loop) {
    params.set("loop", "1");
    // YouTube only honours `loop` when the video is listed in `playlist`.
    params.set("playlist", videoId);
  }

  return `https://www.youtube-nocookie.com/embed/${videoId}?${params.toString()}`;
}

/**
 * Resolve `promotion_video_url` into something the hero can render.
 * Placeholder or unsupported URLs return `null` so the local campaign
 * video stays in place. YouTube videos render as a background iframe using
 * the default playback options; direct video files reuse the existing hero
 * `<video>` player.
 */
export function resolvePromotionVideo(value?: string | null): PromotionVideo | null {
  const url = cleanSettingsUrl(value);
  if (!url) return null;

  try {
    const parsed = new URL(url);
    const youtubeId = parseYouTubeId(parsed);
    if (youtubeId) {
      return {
        kind: "youtube",
        videoId: youtubeId,
        embedSrc: buildYouTubeEmbedUrl(youtubeId),
      };
    }

    if (VIDEO_FILE.test(parsed.pathname)) {
      return { kind: "file", src: url };
    }
  } catch {
    return null;
  }

  return null;
}
