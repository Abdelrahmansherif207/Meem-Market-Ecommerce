"use client";

import { useCountdown } from "../hooks/useCountdown";

interface CountdownTimerProps {
  targetDate: string | Date;
  onExpired?: () => void;
  className?: string;
}

export default function CountdownTimer({ targetDate, className = "" }: CountdownTimerProps) {
  const { days, hours, minutes, seconds, isExpired, isReady } = useCountdown(targetDate);

  if (isExpired) {
    return <span className={`text-error font-bold ${className}`}>Sale Ended</span>;
  }

  const pad = (n: number) => (isReady ? String(n).padStart(2, "0") : "--");

  return (
    <div className={`flex items-center gap-1 font-mono ${className}`}>
      {days > 0 && <span className="bg-black/60 text-white px-1.5 py-0.5 rounded text-sm font-bold">{days}d</span>}
      {days > 0 && <span className="text-white/80">:</span>}
      <span className="bg-black/60 text-white px-1.5 py-0.5 rounded text-sm font-bold tabular-nums">
        {pad(hours)}
      </span>
      <span className="text-white/80">:</span>
      <span className="bg-black/60 text-white px-1.5 py-0.5 rounded text-sm font-bold tabular-nums">
        {pad(minutes)}
      </span>
      <span className="text-white/80">:</span>
      <span className="bg-black/60 text-white px-1.5 py-0.5 rounded text-sm font-bold tabular-nums">
        {pad(seconds)}
      </span>
    </div>
  );
}
