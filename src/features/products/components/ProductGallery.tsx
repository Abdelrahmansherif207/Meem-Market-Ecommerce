"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/shared/utils/cn";

interface ProductGalleryProps {
  images: string[];
  thumbnail: string;
  productName: string;
  compact?: boolean;
}

export function ProductGallery({ images, thumbnail, productName, compact }: ProductGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [zoomOrigin, setZoomOrigin] = useState("center center");
  const [isZoomed, setIsZoomed] = useState(false);
  const imageContainerRef = useRef<HTMLDivElement>(null);

  if (images.length === 0) {
    return (
      <div className="aspect-square rounded-2xl bg-surface flex items-center justify-center">
        <Image src={thumbnail} alt={productName} width={400} height={400} className="object-contain" />
      </div>
    );
  }

  const currentSrc = images[selectedIndex] || images[0];

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    if (!imageContainerRef.current) return;
    const rect = imageContainerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setZoomOrigin(`${x}% ${y}%`);
  }

  return (
    <>
      <div className={cn("space-y-4")}>
        <div
          ref={imageContainerRef}
          className={cn(
            "relative overflow-hidden rounded-2xl bg-white cursor-crosshair",
            "aspect-square",
          )}
          onMouseEnter={() => setIsZoomed(true)}
          onMouseLeave={() => { setIsZoomed(false); setZoomOrigin("center center"); }}
          onMouseMove={handleMouseMove}
          onClick={() => setLightboxOpen(true)}
        >
          <Image
            src={currentSrc}
            alt={`${productName} - ${selectedIndex + 1}`}
            fill
            sizes={compact ? "(max-width: 768px) 100vw, 33vw" : "(max-width: 768px) 100vw, 50vw"}
            className={cn(
              "object-cover transition-transform duration-200",
              isZoomed && "scale-150",
            )}
            style={{ transformOrigin: zoomOrigin }}
            priority
          />
        </div>

        {images.length > 1 && (
          <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
            {images.map((src, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setSelectedIndex(i)}
                className={cn(
                  "relative shrink-0 overflow-hidden rounded-lg border-2 transition",
                  compact ? "size-12" : "size-16",
                  i === selectedIndex
                    ? "border-primary"
                    : "border-border hover:border-primary/50",
                )}
              >
                <Image
                  src={src}
                  alt={`${productName} thumbnail ${i + 1}`}
                  fill
                  sizes={compact ? "48px" : "64px"}
                  className="object-cover"
                  loading="lazy"
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {lightboxOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm"
          onClick={() => setLightboxOpen(false)}
        >
          <button
            type="button"
            onClick={() => setLightboxOpen(false)}
            className="absolute right-4 top-4 z-10 rounded-full bg-white/20 p-2 text-white hover:bg-white/40 transition"
          >
            <X className="size-6" />
          </button>

          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); setSelectedIndex((i) => (i - 1 + images.length) % images.length); }}
            className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-white/20 p-2 text-white hover:bg-white/40 transition"
          >
            <ChevronLeft className="size-8" />
          </button>

          <div className="relative size-full max-h-[90vh] max-w-[90vw]" onClick={(e) => e.stopPropagation()}>
            <Image
              src={images[selectedIndex]}
              alt={`${productName} full`}
              fill
              sizes="90vw"
              className="object-contain p-4"
            />
          </div>

          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); setSelectedIndex((i) => (i + 1) % images.length); }}
            className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-white/20 p-2 text-white hover:bg-white/40 transition"
          >
            <ChevronRight className="size-8" />
          </button>
        </div>
      )}
    </>
  );
}
