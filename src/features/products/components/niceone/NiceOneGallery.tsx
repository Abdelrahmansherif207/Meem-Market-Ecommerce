"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { ChevronDown, ChevronLeft, ChevronRight, X } from "lucide-react";
import { cn } from "@/shared/utils/cn";

interface NiceOneGalleryProps {
  images: string[];
  thumbnail: string;
  productName: string;
}

const MAX_VISIBLE_THUMBS = 5;

/**
 * Nice One-style product gallery (Stitch PDP screens):
 * vertical thumbnail rail on the start side + large contained main image
 * with a gentle hover zoom and a full-screen lightbox on click.
 * Mirrors automatically for RTL (flex start side).
 */
export function NiceOneGallery({ images, thumbnail, productName }: NiceOneGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const railRef = useRef<HTMLDivElement>(null);
  const scrollDown = () => railRef.current?.scrollBy({ top: 192, behavior: "smooth" });
  const scrollUp = () => railRef.current?.scrollBy({ top: -192, behavior: "smooth" });

  const selectImage = (index: number) => {
    setSelectedIndex(index);
    setHasInteracted(true);
  };

  if (images.length === 0) {
    return (
      <div className="flex min-h-[320px] items-center justify-center rounded-xl bg-white lg:min-h-[460px]">
        <Image
          src={thumbnail || "/placeholder.svg"}
          alt={productName}
          width={400}
          height={400}
          className="object-contain"
        />
      </div>
    );
  }

  const safeIndex = Math.min(selectedIndex, images.length - 1);
  const currentSrc = images[safeIndex] || images[0];
  const railScrollable = images.length > MAX_VISIBLE_THUMBS;

  return (
    <>
      <div className="flex items-start gap-3 lg:gap-5">
        {/* Vertical thumbnail rail */}
        <div className="relative w-14 shrink-0 lg:w-16">
          <div
            ref={railRef}
            className="no-scrollbar flex max-h-[420px] flex-col gap-2.5 overflow-y-auto lg:max-h-[500px]"
          >
            {images.map((src, i) => (
              <button
                key={i}
                type="button"
                onClick={() => selectImage(i)}
                aria-label={`${productName} — image ${i + 1}`}
                aria-pressed={i === safeIndex}
                className={cn(
                  "flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-lg border-2 bg-white p-1 transition lg:size-16",
                  i === safeIndex
                    ? "border-ink shadow-elev-1"
                    : "border-line hover:border-neutral/50",
                )}
              >
                <Image
                  src={src}
                  alt={`${productName} thumbnail ${i + 1}`}
                  width={64}
                  height={64}
                  sizes="64px"
                  className="size-full object-contain"
                  loading="lazy"
                />
              </button>
            ))}
          </div>

          {railScrollable && (
            <>
              <button
                type="button"
                onClick={scrollUp}
                aria-label="Scroll thumbnails up"
                className="absolute -top-6 inset-x-0 flex justify-center py-0.5 text-text-muted"
              >
                <ChevronDown className="size-3 rotate-180" />
              </button>
              <div className="absolute bottom-0 inset-x-0 flex justify-center rounded-b-lg bg-white/90 py-0.5 text-text-muted">
                <button
                  type="button"
                  onClick={scrollDown}
                  aria-label="Scroll thumbnails down"
                  className="flex"
                >
                  <ChevronDown className="size-3" />
                </button>
              </div>
            </>
          )}
        </div>

        {/* Main image */}
        <button
          type="button"
          onClick={() => setLightboxOpen(true)}
          aria-label="Open product image in full screen"
          className="relative flex min-h-[320px] w-full flex-1 cursor-zoom-in items-center justify-center overflow-hidden lg:min-h-[460px]"
        >
          <div
            key={safeIndex}
            className={cn("absolute inset-4", hasInteracted && "pdp-img-in")}
          >
            <Image
              src={currentSrc}
              alt={`${productName} — ${safeIndex + 1}`}
              fill
              sizes="(max-width: 1024px) 82vw, 42vw"
              priority
              className="object-contain transition-transform duration-300 hover:scale-105"
            />
          </div>
        </button>
      </div>

      {lightboxOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm"
          onClick={() => setLightboxOpen(false)}
        >
          <button
            type="button"
            onClick={() => setLightboxOpen(false)}
            className="absolute right-4 top-4 z-10 rounded-full bg-white/20 p-2 text-white transition hover:bg-white/40"
          >
            <X className="size-6" />
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setSelectedIndex((i) => (i - 1 + images.length) % images.length);
            }}
            className="absolute left-4 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/20 p-2 text-white transition hover:bg-white/40"
          >
            <ChevronLeft className="size-8" />
          </button>

          <div
            className="relative size-full max-h-[90vh] max-w-[90vw]"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={images[safeIndex]}
              alt={`${productName} full`}
              fill
              sizes="90vw"
              className="object-contain p-4"
            />
          </div>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setSelectedIndex((i) => (i + 1) % images.length);
            }}
            className="absolute right-4 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/20 p-2 text-white transition hover:bg-white/40"
          >
            <ChevronRight className="size-8" />
          </button>
        </div>
      )}
    </>
  );
}
