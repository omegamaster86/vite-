"use server";

import { redirect } from "next/navigation";
import { createLogger } from "@/services/logger";
import { getAuthenticatedSession } from "@/services/supabase/auth";
import type { SaveAnnouncementDraftState } from "@/types";
import {
  SaveAnnouncementDraftSchema,
  UpsertAnnouncementForAdminResponseSchema,
} from "@/types/schemas";
import { toUtcIsoFromJstLocal } from "@/utils/ToUtcIsoFromJstLocal";

const initialState: SaveAnnouncementDraftState = {
  success: false,
  messages: [],
};

export async function saveAnnouncementDraft(
  _prevState: SaveAnnouncementDraftState = initialState,
  formData: FormData,
): Promise<SaveAnnouncementDraftState> {
  const logger = createLogger("saveAnnouncementDraft");
  logger.start();

  try {
    const raw = {
      announcementId: formData.get("announcementId"),
      title: formData.get("title"),
      description: formData.get("description"),
      target: formData.get("target"),
      publishAt: formData.get("publishAt"),
      deadline: formData.get("deadline"),
    };

    const parsed = SaveAnnouncementDraftSchema.safeParse(raw);
    if (!parsed.success) {
      const fieldErrors = parsed.error.flatten().fieldErrors;
      const messages = Object.values(fieldErrors)
        .flatMap((errors) => errors ?? [])
        .filter((message, index, all) => all.indexOf(message) === index);
      const fallbackMessage = "入力内容が不正です";
      logger.warn("validation_error", { fieldErrors });
      logger.end({ success: false, errorMessage: "validation_error" });
      return {
        success: false,
        messages: messages.length > 0 ? messages : [fallbackMessage],
        error: "VALIDATION_ERROR",
        fieldErrors: {
          title: fieldErrors.title,
          description: fieldErrors.description,
          target: fieldErrors.target,
          publishAt: fieldErrors.publishAt,
          deadline: fieldErrors.deadline,
        },
      };
    }

    const authResult = await getAuthenticatedSession();
    if (authResult.errorCode === "unauthorized") {
      logger.warn("unauthorized", {
        hasUser: Boolean(authResult.user),
        userError: authResult.userError,
      });
      logger.end({ success: false, errorMessage: "unauthorized" });
      return {
        success: false,
        messages: ["認証に失敗しました"],
        error: "AUTH_ERROR",
      };
    }

    if (authResult.errorCode === "session_not_found") {
      logger.warn("session_not_found", { userId: authResult.user?.id });
      logger.end({ success: false, errorMessage: "session_not_found" });
      return {
        success: false,
        messages: ["セッションが見つかりません"],
        error: "SESSION_ERROR",
      };
    }
    const session = authResult.session;

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    if (!supabaseUrl) {
      logger.error(new Error("NEXT_PUBLIC_SUPABASE_URL is not set"));
      logger.end({ success: false, errorMessage: "config_error" });
      return {
        success: false,
        messages: ["設定エラーが発生しました"],
        error: "CONFIG_ERROR",
      };
    }

    const payload = {
      announcementId: parsed.data.announcementId ?? null,
      title: parsed.data.title,
      description: parsed.data.description,
      target: parsed.data.target ?? null,
      publishAt: toUtcIsoFromJstLocal(parsed.data.publishAt),
      deadline: toUtcIsoFromJstLocal(parsed.data.deadline),
    };

    const response = await fetch(
      `${supabaseUrl}/functions/v1/update-announcement-for-admin`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify(payload),
      },
    );

    if (!response.ok) {
      logger.warn("edge_function_error", {
        status: response.status,
        statusText: response.statusText,
      });
      logger.end({ success: false, errorMessage: "edge_function_error" });
      return {
        success: false,
        messages: ["保存に失敗しました"],
        error: "API_ERROR",
      };
    }

    const json = (await response.json()) as unknown;
    const parsedResponse =
      UpsertAnnouncementForAdminResponseSchema.safeParse(json);
    if (!parsedResponse.success) {
      logger.warn("invalid_response_shape", { error: parsedResponse.error });
      logger.end({ success: false, errorMessage: "invalid_response_shape" });
      return {
        success: false,
        messages: ["レスポンス形式が不正です"],
        error: "RESPONSE_ERROR",
      };
    }

    if (!parsedResponse.data.success) {
      logger.warn("edge_function_returned_error", {
        error: parsedResponse.data.error,
      });
      logger.end({
        success: false,
        errorMessage: "edge_function_returned_error",
      });
      return {
        success: false,
        messages: [parsedResponse.data.error ?? "保存に失敗しました"],
        error: "DB_ERROR",
      };
    }

    logger.end({ success: true });
    redirect("/announcements");
  } catch (err) {
    if (
      err &&
      typeof err === "object" &&
      "digest" in err &&
      typeof (err as { digest?: unknown }).digest === "string" &&
      (err as { digest: string }).digest.startsWith("NEXT_REDIRECT")
    ) {
      throw err;
    }
    const message =
      err instanceof Error ? err.message : "予期しないエラーが発生しました";
    logger.error(err);
    logger.end({ success: false, errorMessage: message });
    return {
      success: false,
      messages: [message],
      error: "UNEXPECTED_ERROR",
    };
  }
}
