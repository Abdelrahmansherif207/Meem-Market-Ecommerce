"use client";

import Image from "next/image";
import type { CSSProperties } from "react";

type PatternTile = {
  src: string;
  left: number;
  size: number;
  rotateStart: number;
  drift: number;
  duration: number;
  delay: number;
  spinDuration: number;
  scale: number;
  opacity: number;
};

const PATTERN_IMAGES = [
  "/images/auth/bags.png",
  "/images/auth/burger.png",
  "/images/auth/cheese.png",
  "/images/auth/cheps.png",
  "/images/auth/coursou.png",
  "/images/auth/icecream.png",
  "/images/auth/plant.png",
  "/images/auth/tomatoo.png",
  "/images/auth/vegtables.png",
];

function seededFloat(seed: number) {
  const value = Math.sin(seed * 12.9898) * 43758.5453;
  return value - Math.floor(value);
}

function fixed(value: number, digits = 4) {
  return Number(value.toFixed(digits));
}

const PATTERN_TILES: PatternTile[] = Array.from({ length: 46 }, (_, index) => {
  const imageIndex = index % PATTERN_IMAGES.length;
  const left = fixed(2 + seededFloat(index + 31) * 96);
  const size = fixed(24 + seededFloat(index + 61) * 30);
  const rotateStart = fixed(-28 + seededFloat(index + 91) * 56);
  const drift = fixed(-28 + seededFloat(index + 121) * 56);
  const duration = fixed(9 + seededFloat(index + 151) * 9);
  const delay = fixed(-(seededFloat(index + 181) * duration));
  const spinDuration = fixed(3 + seededFloat(index + 211) * 4);
  const scale = fixed(0.74 + seededFloat(index + 241) * 0.46);
  const opacity = fixed(0.35 + seededFloat(index + 271) * 0.45);

  return {
    src: PATTERN_IMAGES[imageIndex],
    left,
    size,
    rotateStart,
    drift,
    duration,
    delay,
    spinDuration,
    scale,
    opacity,
  };
});

export function PatternTiles() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute inset-0 bg-[linear-gradient(130deg,rgba(255,255,255,0.62),rgba(255,255,255,0.2))]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_15%,rgba(14,90,167,0.12),transparent_30%),radial-gradient(circle_at_78%_20%,rgba(207,158,54,0.14),transparent_33%),radial-gradient(circle_at_40%_84%,rgba(227,0,15,0.09),transparent_28%)]" />
      
      {/* Main tiles */}
      {PATTERN_TILES.map((tile, index) => (
        <div
          key={`${tile.src}-${index}`}
          className="auth-fall-item absolute"
          style={{
            left: `${tile.left.toFixed(4)}%`,
            width: `${tile.size.toFixed(4)}px`,
            height: `${tile.size.toFixed(4)}px`,
            opacity: tile.opacity.toFixed(4),
            animationDuration: `${tile.duration.toFixed(4)}s`,
            animationDelay: `${tile.delay.toFixed(4)}s`,
            "--drift-x": `${tile.drift.toFixed(4)}px`,
          } as CSSProperties}
        >
          <div
            className="auth-fall-spin relative h-full w-full"
            style={{
              animationDuration: `${tile.spinDuration.toFixed(4)}s`,
              transform: `rotate(${tile.rotateStart.toFixed(4)}deg) scale(${tile.scale.toFixed(4)})`,
            } as CSSProperties}
          >
            <Image
              src={tile.src}
              alt=""
              aria-hidden="true"
              fill
              sizes="(max-width: 640px) 24px, 30px"
              loading={index < 10 ? "eager" : "lazy"}
              className="object-contain drop-shadow-[0_6px_12px_rgba(0,0,0,0.14)]"
            />
          </div>
        </div>
      ))}
      
      {/* Blur tiles */}
      {PATTERN_TILES.slice(0, 18).map((tile, index) => (
        <div
          key={`blur-${tile.src}-${index}`}
          className="auth-fall-item absolute"
          style={{
            left: `${(tile.left + (index % 2 === 0 ? 6 : -6)).toFixed(4)}%`,
            width: `${(tile.size * 1.2).toFixed(4)}px`,
            height: `${(tile.size * 1.2).toFixed(4)}px`,
            opacity: Math.max(0.12, tile.opacity - 0.2).toFixed(4),
            animationDuration: `${(tile.duration * 1.2).toFixed(4)}s`,
            animationDelay: `${(tile.delay - 2).toFixed(4)}s`,
            "--drift-x": `${(tile.drift * 0.6).toFixed(4)}px`,
          } as CSSProperties}
        >
          <div
            className="auth-fall-spin relative h-full w-full blur-[1px]"
            style={{
              animationDuration: `${(tile.spinDuration * 1.2).toFixed(4)}s`,
              transform: `rotate(${tile.rotateStart.toFixed(4)}deg) scale(${(tile.scale * 0.9).toFixed(4)})`,
            } as CSSProperties}
          >
            <Image
              src={tile.src}
              alt=""
              aria-hidden="true"
              fill
              sizes="(max-width: 640px) 29px, 36px"
              loading="lazy"
              className="object-contain"
            />
          </div>
        </div>
      ))}
    </div>
  );
}
