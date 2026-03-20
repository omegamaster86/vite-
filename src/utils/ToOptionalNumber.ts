export function toOptionalNumber(value: unknown) {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  const normalized = trimmed.replaceAll(",", "");
  const n = Number(normalized);
  return Number.isFinite(n) ? n : undefined;
}