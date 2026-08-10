const UNITS: Array<{ unit: Intl.RelativeTimeFormatUnit; seconds: number }> = [
  { unit: "year", seconds: 31536000 },
  { unit: "month", seconds: 2592000 },
  { unit: "week", seconds: 604800 },
  { unit: "day", seconds: 86400 },
  { unit: "hour", seconds: 3600 },
  { unit: "minute", seconds: 60 },
  { unit: "second", seconds: 1 },
];

export function formatRelativeDate(isoDate: string, locale = "en"): string {
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) return "";

  const delta = (date.getTime() - Date.now()) / 1000;
  const formatter = new Intl.RelativeTimeFormat(locale, { numeric: "auto" });

  for (const { unit, seconds } of UNITS) {
    if (Math.abs(delta) >= seconds || unit === "second") {
      return formatter.format(Math.round(delta / seconds), unit);
    }
  }
  return "";
}