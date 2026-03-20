export function formatJstDateTime(value: string): string {
  // SupabaseがUTC文字列(末尾Z)ならそのまま Date でOK
  // もし "2026-01-30 05:32:00" のようにTZがないなら `+00:00` or `Z` を付与してUTC扱いにする
  const date = new Date(value.endsWith("Z") ? value : `${value}Z`);
  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat("ja-JP", {
    timeZone: "Asia/Tokyo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(date).replace(/\//g, "/");
}