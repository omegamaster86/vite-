export function toUtcIsoFromJstLocal(value: string | null | undefined): string | null {
  if (!value) return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  const date = new Date(`${trimmed}:00+09:00`);
  if (Number.isNaN(date.getTime())) return null;
  return date.toISOString();
}