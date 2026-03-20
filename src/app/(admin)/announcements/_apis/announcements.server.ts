"use server";

import { cookies } from "next/headers";
import { createLogger } from "@/services/logger";
import { getAuthenticatedSession } from "@/services/supabase/auth";
import type { AnnouncementItem } from "@/types";
import { GetAnnouncementsResponseSchema } from "@/types/schemas";

/**
 * お知らせ一覧を取得（Edge Function経由）
 * - 認証検証は getUser() を使用（必須）
 * - access_token が必要なため getSession() で取得
 * - Edge Function は fetch(GET) で呼び出し
 * - レスポンスは Zod で検証（trust boundary）
 */
export async function getAnnouncements(params?: {
  page?: number;
  pageSize?: number;
}): Promise<{
  announcements: AnnouncementItem[];
  total: number;
  page: number;
  pageSize: number;
}> {
  cookies();

  const logger = createLogger("getAnnouncements");
  logger.start();

  try {
    const authResult = await getAuthenticatedSession();
    if (authResult.errorCode === "unauthorized") {
      logger.warn("unauthorized", {
        hasUser: Boolean(authResult.user),
        userError: authResult.userError,
      });
      logger.end({ success: false, errorMessage: "unauthorized" });
      return { announcements: [], total: 0, page: 1, pageSize: 10 };
    }

    if (authResult.errorCode === "session_not_found") {
      logger.warn("session_not_found", { userId: authResult.user?.id });
      logger.end({ success: false, errorMessage: "session_not_found" });
      return { announcements: [], total: 0, page: 1, pageSize: 10 };
    }
    const session = authResult.session;

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    if (!supabaseUrl) {
      logger.error(new Error("NEXT_PUBLIC_SUPABASE_URL is not set"));
      logger.end({ success: false, errorMessage: "config_error" });
      return { announcements: [], total: 0, page: 1, pageSize: 10 };
    }

    const page = params?.page && params.page >= 1 ? params.page : 1;
    const pageSize =
      params?.pageSize && params.pageSize >= 1 ? params.pageSize : 10;

    const response = await fetch(
      `${supabaseUrl}/functions/v1/get-announcements-for-admin?page=${page.toString()}`,
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
      return { announcements: [], total: 0, page, pageSize };
    }

    const json = (await response.json()) as unknown;
    const parsed = GetAnnouncementsResponseSchema.safeParse(json);
    if (!parsed.success) {
      logger.warn("invalid_response_shape", { error: parsed.error });
      logger.end({ success: false, errorMessage: "invalid_response_shape" });
      return { announcements: [], total: 0, page, pageSize };
    }

    if ("error" in parsed.data) {
      logger.warn("edge_function_returned_error", { error: parsed.data.error });
      logger.end({
        success: false,
        errorMessage: "edge_function_returned_error",
      });
      return { announcements: [], total: 0, page, pageSize };
    }

    const announcements: AnnouncementItem[] = parsed.data.data.map((row) => {
      return {
        ...row,
        id: String(row.id),
      };
    });
    const total = parsed.data.total;
    const responsePage = parsed.data.page;
    const responsePageSize = parsed.data.pageSize;

    logger.end({ success: true });
    return {
      announcements,
      total,
      page: responsePage,
      pageSize: responsePageSize,
    };
  } catch (err) {
    logger.error(err);
    logger.end({ success: false, errorMessage: "unexpected_error" });
    return { announcements: [], total: 0, page: 1, pageSize: 10 };
  }
}
