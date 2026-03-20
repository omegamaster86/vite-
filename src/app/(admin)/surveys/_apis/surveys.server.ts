"use server";

import { cookies } from "next/headers";
import { createLogger } from "@/services/logger";
import { getAuthenticatedSession } from "@/services/supabase/auth";
import type { SurveyItem } from "@/types";
import { GetSurveysResultsResponseSchema } from "@/types/schemas";

/**
 * アンケート結果一覧を取得（Edge Function経由）
 * - 認証検証は getUser() を使用（必須）
 * - access_token が必要なため getSession() で取得
 */
export async function getSurveysResults(params?: {
  /**
   * Edge Function → DB Function に渡す現在日時（ISO文字列想定）。
   * テストや再現性のため、外部から注入できるようにしている。
   */
  targetNow?: string;
  page?: number;
  pageSize?: number;
}): Promise<{
  surveys: SurveyItem[];
  total: number;
  page: number;
  pageSize: number;
}> {
  cookies();

  const logger = createLogger("getSurveysResults");
  logger.start();

  try {
    const authResult = await getAuthenticatedSession();
    if (authResult.errorCode === "unauthorized") {
      logger.warn("unauthorized", {
        hasUser: Boolean(authResult.user),
        userError: authResult.userError,
      });
      logger.end({ success: false, errorMessage: "unauthorized" });
      return { surveys: [], total: 0, page: 1, pageSize: 10 };
    }

    if (authResult.errorCode === "session_not_found") {
      logger.warn("session_not_found", { userId: authResult.user?.id });
      logger.end({ success: false, errorMessage: "session_not_found" });
      return { surveys: [], total: 0, page: 1, pageSize: 10 };
    }
    const session = authResult.session;

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    if (!supabaseUrl) {
      logger.error(new Error("NEXT_PUBLIC_SUPABASE_URL is not set"));
      logger.end({ success: false, errorMessage: "config_error" });
      return { surveys: [], total: 0, page: 1, pageSize: 10 };
    }

    const page = params?.page && params.page >= 1 ? params.page : 1;
    const pageSize =
      params?.pageSize && params.pageSize >= 1 ? params.pageSize : 10;

    const query = new URLSearchParams({
      targetNow: params?.targetNow ?? new Date().toISOString(),
      page: page.toString(),
      pageSize: pageSize.toString(),
    });

    const response = await fetch(
      `${supabaseUrl}/functions/v1/get-surveys-results-for-admin?${query.toString()}`,
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
      return { surveys: [], total: 0, page, pageSize };
    }

    const json = (await response.json()) as unknown;
    const parsed = GetSurveysResultsResponseSchema.safeParse(json);
    if (!parsed.success) {
      logger.warn("invalid_response_shape", {
        error: parsed.error,
      });
      logger.end({ success: false, errorMessage: "invalid_response_shape" });
      return { surveys: [], total: 0, page, pageSize };
    }

    if ("error" in parsed.data) {
      logger.warn("edge_function_returned_error", { error: parsed.data.error });
      logger.end({
        success: false,
        errorMessage: "edge_function_returned_error",
      });
      return { surveys: [], total: 0, page, pageSize };
    }

    const surveys = parsed.data.data satisfies SurveyItem[];
    const total = parsed.data.total;
    const responsePage = parsed.data.page;
    const responsePageSize = parsed.data.pageSize;

    logger.end({ success: true });
    return {
      surveys,
      total,
      page: responsePage,
      pageSize: responsePageSize,
    };
  } catch (err) {
    logger.error(err);
    logger.end({ success: false, errorMessage: "unexpected_error" });
    return { surveys: [], total: 0, page: 1, pageSize: 10 };
  }
}
