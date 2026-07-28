"use client";

import { useCountdown } from "../hooks/useCountdown";

interface CountdownTimerProps {
  targetDate: string | Date;
  onExpired?: () => void;
  className?: string;
}

export default function CountdownTimer({ targetDate, className = "" }: CountdownTimerProps) {
  const { days, hours, minutes, seconds, isExpired } = useCountdown(targetDate);

  if (isExpired) {
    return <span className={`text-red-500 font-bold ${className}`}>Sale Ended</span>;
  }

  return (
    <div className={`flex items-center gap-1 font-mono ${className}`}>
      {days > 0 && <span className="bg-black/60 text-white px-1.5 py-0.5 rounded text-sm font-bold">{days}d</span>}
      {days > 0 && <span className="text-white/80">:</span>}
      <span className="bg-black/60 text-white px-1.5 py-0.5 rounded text-sm font-bold tabular-nums">
        {String(hours).padStart(2, "0")}
      </span>
      <span className="text-white/80">:</span>
      <span className="bg-black/60 text-white px-1.5 py-0.5 rounded text-sm font-bold tabular-nums">
        {String(minutes).padStart(2, "0")}
      </span>
      <span className="text-white/80">:</span>
      <span className="bg-black/60 text-white px-1.5 py-0.5 rounded text-sm font-bold tabular-nums">
        {String(seconds).padStart(2, "0")}
      </span>
    </div>
  );
}
