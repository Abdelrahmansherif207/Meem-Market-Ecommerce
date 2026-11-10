"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/shared/utils/cn";
import { usePrefersReducedMotion } from "@/shared/hooks/usePrefersReducedMotion";

/** Matches the hero's `md` breakpoint: below it the 9:16 mobile cut is used. */
const MOBILE_MEDIA_QUERY = "(max-width: 767px)";
const VISIBILITY_THRESHOLD = 0.2;

interface CatchHeroVideoPlayerProps {
  desktopSrc: string;
  mobileSrc: string;
  poster: string;
  className?: string;
  /** Extra classes for the `<video>` itself (crop, object-position). */
  videoClassName?: string;
  /** Start playback automatically when visible (CMS `autoplay`). */
  autoplay?: boolean;
  /** Restart the video when it reaches the end (CMS `loop`). */
  loop?: boolean;
  /** Play without sound (CMS `muted`). */
  muted?: boolean;
}

/**
 * Campaign hero video. The art-directed source is chosen after mount so the
 * server HTML stays identical for both breakpoints. Playback behavior comes
 * from the CMS hero settings; it pauses off-screen or when the tab is hidden,
 * and never autoplays for reduced-motion users (they get the poster instead).
 */
export default function CatchHeroVideoPlayer({
  desktopSrc,
  mobileSrc,
  poster,
  className,
  videoClassName,
  autoplay = true,
  loop = true,
  muted = true,
}: CatchHeroVideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const isInViewRef = useRef(false);
  const [source, setSource] = useState<string | null>(null);
  const prefersReducedMotion = usePrefersReducedMotion();

  const shouldPlay = autoplay && !prefersReducedMotion;

  useEffect(() => {
    const query = window.matchMedia(MOBILE_MEDIA_QUERY);
    const syncSource = () => setSource(query.matches ? mobileSrc : desktopSrc);

    syncSource();
    query.addEventListener("change", syncSource);
    return () => query.removeEventListener("change", syncSource);
  }, [desktopSrc, mobileSrc]);

  // Keep playback in sync with the motion preference, viewport and tab state.
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !source) return;

    if (!shouldPlay || !isInViewRef.current || document.hidden) {
      video.pause();
      return;
    }

    void video.play().catch(() => {});
  }, [source, shouldPlay]);

  // Pause off-screen so the campaign video does not keep decoding while the
  // shopper browses the rest of the homepage.
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        isInViewRef.current = entry.isIntersecting;

        if (!entry.isIntersecting) {
          video.pause();
          return;
        }

        if (shouldPlay && !document.hidden) {
          void video.play().catch(() => {});
        }
      },
      { threshold: VISIBILITY_THRESHOLD },
    );

    observer.observe(video);
    return () => observer.disconnect();
  }, [shouldPlay]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      const video = videoRef.current;
      if (!video) return;

      if (document.hidden) {
        video.pause();
        return;
      }

      if (shouldPlay && isInViewRef.current) {
        void video.play().catch(() => {});
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () =>
      document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [shouldPlay]);

  return (
    <div className={cn("relative h-full w-full", className)}>
      <video
        ref={videoRef}
        src={source ?? undefined}
        poster={poster}
        muted={muted}
        loop={loop}
        playsInline
        preload="auto"
        tabIndex={-1}
        aria-hidden="true"
        className={cn("h-full w-full object-cover", videoClassName)}
      />
    </div>
  );
}
