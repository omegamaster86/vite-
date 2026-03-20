"use server";

import { cookies } from "next/headers";
import { createLogger } from "@/services/logger";
import { getAuthenticatedSession } from "@/services/supabase/auth";
import type { SurveyEditDetail } from "@/types";
import { GetSurveyEditDetailResponseSchema } from "@/types/schemas";

const THUMBNAIL_BUCKET = "thumbnail_image_bucket";

function isAbsoluteUrl(value: string): boolean {
  try {
    new URL(value);
    return true;
  } catch {
    return false;
  }
}

function toPublicThumbnailUrl(
  value: string | null,
  supabaseUrl: string | null,
): string | null {
  if (!value) return null;
  if (isAbsoluteUrl(value)) return value;
  if (!supabaseUrl) return value;
  const normalized = value.startsWith("/") ? value.slice(1) : value;
  return `${supabaseUrl}/storage/v1/object/public/${THUMBNAIL_BUCKET}/${normalized}`;
}

/**
 * アンケート編集画面の初期値を取得（Edge Function経由）
 * - 認証検証は getUser() を使用（必須）
 * - access_token が必要なため getSession() で取得
 */
export async function getSurveyEditDetail(
  questionnaireId: number,
): Promise<SurveyEditDetail | null> {
  cookies();

  const logger = createLogger("getSurveyEditDetail");
  logger.start({ questionnaireId });

  try {
    const authResult = await getAuthenticatedSession();
    if (authResult.errorCode === "unauthorized") {
      logger.warn("unauthorized", {
        hasUser: Boolean(authResult.user),
        userError: authResult.userError,
      });
      logger.end({ success: false, errorMessage: "unauthorized" });
      return null;
    }

    if (authResult.errorCode === "session_not_found") {
      logger.warn("session_not_found", { userId: authResult.user?.id });
      logger.end({ success: false, errorMessage: "session_not_found" });
      return null;
    }
    const session = authResult.session;

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    if (!supabaseUrl) {
      logger.error(new Error("NEXT_PUBLIC_SUPABASE_URL is not set"));
      logger.end({ success: false, errorMessage: "config_error" });
      return null;
    }

    const response = await fetch(
      `${supabaseUrl}/functions/v1/get-survey-edit-detail-for-admin?questionnaireId=${encodeURIComponent(String(questionnaireId))}`,
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
      return null;
    }

    const json = (await response.json()) as unknown;
    const parsed = GetSurveyEditDetailResponseSchema.safeParse(json);
    if (!parsed.success) {
      logger.warn("invalid_response_shape", { error: parsed.error });
      logger.end({ success: false, errorMessage: "invalid_response_shape" });
      return null;
    }

    if ("error" in parsed.data) {
      logger.warn("edge_function_returned_error", { error: parsed.data.error });
      logger.end({
        success: false,
        errorMessage: "edge_function_returned_error",
      });
      return null;
    }

    const detail = parsed.data.data satisfies SurveyEditDetail | null;
    const normalizedDetail = detail
      ? {
          ...detail,
          thumbnailImageUrl: toPublicThumbnailUrl(
            detail.thumbnailImageUrl,
            supabaseUrl,
          ),
        }
      : null;

    logger.end({ success: true });
    return normalizedDetail;
  } catch (err) {
    logger.error(err);
    logger.end({ success: false, errorMessage: "unexpected_error" });
    return null;
  }
}