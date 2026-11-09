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

export function buildYouTubeEmbedUrl(videoId: string): string {
  const params = new URLSearchParams({
    autoplay: "1",
    mute: "1",
    controls: "0",
    loop: "1",
    playlist: videoId,
    playsinline: "1",
    modestbranding: "1",
    rel: "0",
  });
  return `https://www.youtube-nocookie.com/embed/${videoId}?${params.toString()}`;
}

/**
 * Resolve `promotion_video_url` into something the hero can render.
 * Placeholder or unsupported URLs return `null` so the local campaign
 * video stays in place. YouTube videos render as a muted looping iframe;
 * direct video files reuse the existing hero `<video>` player.
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
