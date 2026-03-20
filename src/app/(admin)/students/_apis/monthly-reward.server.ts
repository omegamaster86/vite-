"use server";

import { cookies } from "next/headers";
import { createLogger } from "@/services/logger";
import { getAuthenticatedSession } from "@/services/supabase/auth";
import type { MonthlyRewardParams } from "@/types";
import { GetMonthlyRewardTotalResponseSchema } from "@/types/schemas";

/**
 * 先月合計獲得金額を取得（Edge Function経由）
 * - 認証検証は getUser() を使用（必須）
 * - access_token が必要なため getSession() で取得
 * - Edge Function は fetch(GET) で呼び出し
 * - レスポンスは Zod で検証（trust boundary）
 */
export async function getMonthlyRewardTotal(
  params: MonthlyRewardParams,
): Promise<number> {
  cookies();

  const logger = createLogger("getMonthlyRewardTotal");
  logger.start({ year: params.year, month: params.month });

  try {
    const authResult = await getAuthenticatedSession();
    if (authResult.errorCode === "unauthorized") {
      logger.warn("unauthorized", {
        hasUser: Boolean(authResult.user),
        userError: authResult.userError,
      });
      logger.end({ success: false, errorMessage: "unauthorized" });
      return 0;
    }

    if (authResult.errorCode === "session_not_found") {
      logger.warn("session_not_found", { userId: authResult.user?.id });
      logger.end({ success: false, errorMessage: "session_not_found" });
      return 0;
    }
    const session = authResult.session;

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    if (!supabaseUrl) {
      logger.error(new Error("NEXT_PUBLIC_SUPABASE_URL is not set"));
      logger.end({ success: false, errorMessage: "config_error" });
      return 0;
    }

    const response = await fetch(
      `${supabaseUrl}/functions/v1/get-monthly-reward-total-for-admin?year=${params.year.toString()}&month=${params.month.toString()}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${session?.access_token}`,
        },
      },
    );

    if (!response.ok) {
      logger.warn("edge_function_error", {
        status: response.status,
        statusText: response.statusText,
      });
      logger.end({ success: false, errorMessage: "edge_function_error" });
      return 0;
    }

    const json = (await response.json()) as unknown;
    const parsed = GetMonthlyRewardTotalResponseSchema.safeParse(json);
    if (!parsed.success) {
      logger.warn("invalid_response_shape", { error: parsed.error });
      logger.end({ success: false, errorMessage: "invalid_response_shape" });
      return 0;
    }

    if ("error" in parsed.data) {
      logger.warn("edge_function_returned_error", { error: parsed.data.error });
      logger.end({
        success: false,
        errorMessage: "edge_function_returned_error",
      });
      return 0;
    }

    const totalAmount = parsed.data.data.totalAmount ?? 0;
    logger.end({ success: true });
    return totalAmount;
  } catch (err) {
    logger.error(err);
    logger.end({ success: false, errorMessage: "unexpected_error" });
    return 0;
  }
}
