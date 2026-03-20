/**
 * datetime-local の入力/表示用ユーティリティ
 */
export function toDateTimeLocalValue(value: string): string {
  // 例: "2026-01-12T10:30:00Z" -> "2026-01-12T19:30"（JST）
  const trimmed = value.trim();
  if (!trimmed) return "";
  // 既に datetime-local 形式ならそのまま
  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(trimmed)) return trimmed;
  const date = new Date(trimmed);
  if (Number.isNaN(date.getTime())) return "";
  const formatter = new Intl.DateTimeFormat("sv-SE", {
    timeZone: "Asia/Tokyo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  });
  const formatted = formatter.format(date);
  return formatted.replace(" ", "T");
}

export function formatDateTimeDisplayValue(rawValue: string): string {
  if (!rawValue) return "";
  const [datePart, timePart] = rawValue.split("T");
  if (!datePart || !timePart) return "";
  const [yyyy, mm, dd] = datePart.split("-");
  const [hh, min] = timePart.split(":");
  if (!yyyy || !mm || !dd || !hh || !min) return "";
  return `${yyyy}/${mm}/${dd} ${hh}:${min}`;
}

export function openDateTimePicker(
  input: HTMLInputElement | null,
  pending: boolean,
): void {
  if (!input) return;
  if (pending) return;
  if (typeof input.showPicker === "function") {
    input.showPicker();
    return;
  }
  input.focus();
}
