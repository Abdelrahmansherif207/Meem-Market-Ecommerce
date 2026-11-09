"use client";

import { useState, useEffect } from "react";

interface CountdownResult {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isExpired: boolean;
  totalSeconds: number;
  isReady: boolean;
  /** False when `targetDate` cannot be parsed; consumers should hide the timer. */
  hasValidTarget: boolean;
}

export function useCountdown(targetDate: string | Date): CountdownResult {
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    const tick = () => setNow(Date.now());
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  const parsedTarget = new Date(targetDate).getTime();
  const hasValidTarget = Number.isFinite(parsedTarget);
  const diff =
    now === null || !hasValidTarget ? 0 : Math.max(0, parsedTarget - now);
  const totalSeconds = Math.floor(diff / 1000);

  return {
    days: Math.floor(totalSeconds / 86400),
    hours: Math.floor((totalSeconds % 86400) / 3600),
    minutes: Math.floor((totalSeconds % 3600) / 60),
    seconds: totalSeconds % 60,
    isExpired: hasValidTarget && now !== null && diff <= 0,
    totalSeconds,
    isReady: now !== null && hasValidTarget,
    hasValidTarget,
  };
}
