import { formatDateTimeLocal } from "@/utils/formatDateTimeLocal";

/**
 * 公開日時の初期値を取得
 */
export function getDefaultPublishAt(publishAt?: string | null): string {
  if (publishAt) return publishAt;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return formatDateTimeLocal(today);
}

/**
 * 締切日時の初期値を取得
 */
export function getDefaultDeadline(deadline?: string | null): string {
  if (deadline) return deadline;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const oneMonthLater = new Date(today);
  oneMonthLater.setMonth(oneMonthLater.getMonth() + 1);
  return formatDateTimeLocal(oneMonthLater);
}
