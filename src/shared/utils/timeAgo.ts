const UNITS: { limit: number; seconds: number; en: string; ar: string }[] = [
  { limit: 60, seconds: 1, en: "just now", ar: "الآن" },
  { limit: 3600, seconds: 60, en: "min", ar: "دقيقة" },
  { limit: 86400, seconds: 3600, en: "hr", ar: "ساعة" },
  { limit: 604800, seconds: 86400, en: "day", ar: "يوم" },
  { limit: Infinity, seconds: 604800, en: "week", ar: "أسبوع" },
];

export function timeAgo(dateString?: string, locale: string = "en"): string {
  if (!dateString) return "";
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return "";

  const seconds = Math.max(0, Math.floor((Date.now() - date.getTime()) / 1000));

  for (const unit of UNITS) {
    if (seconds < unit.limit) {
      if (unit.seconds === 1) return locale === "ar" ? unit.ar : unit.en;
      const count = Math.floor(seconds / unit.seconds);
      const label = locale === "ar" ? unit.ar : pluralize(unit.en, count);
      return locale === "ar"
        ? `منذ ${count} ${label}`
        : `${count} ${label} ago`;
    }
  }

  return "";
}

function pluralize(label: string, count: number): string {
  if (label === "min") return count === 1 ? "min" : "mins";
  if (label === "hr") return count === 1 ? "hour" : "hours";
  if (label === "day") return count === 1 ? "day" : "days";
  if (label === "week") return count === 1 ? "week" : "weeks";
  return label;
}