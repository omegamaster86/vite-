"use server";

import { redirect } from "next/navigation";
import { createLogger } from "@/services/logger";
import { createClient } from "@/services/supabase/server";
import type { SaveSurveyDraftState } from "@/types";
import {
  AllowedThumbnailExtensionsSchema,
  AllowedThumbnailMimeTypesSchema,
  SaveSurveyDraftSchema,
  UpsertSurveyForAdminResponseSchema,
} from "@/types/schemas";
import { toOptionalString } from "@/utils/ToOptionalString";
import { toUtcIsoFromJstLocal } from "@/utils/ToUtcIsoFromJstLocal";

const THUMBNAIL_BUCKET = "thumbnail_image_bucket";
const MAX_THUMBNAIL_BYTES = 5 * 1024 * 1024;

function isFile(value: unknown): value is File {
  return typeof File !== "undefined" && value instanceof File;
}

const initialState: SaveSurveyDraftState = {
  success: false,
  messages: [],
  thumbnailPath: null,
};

export async function saveSurveyDraft(
  _prevState: SaveSurveyDraftState = initialState,
  formData: FormData,
): Promise<SaveSurveyDraftState> {
  const logger = createLogger("saveSurveyDraft");
  logger.start();

  try {
    const questionsJsonRaw = formData.get("questionsJson");
    const questionsJson =
      typeof questionsJsonRaw === "string" ? questionsJsonRaw : "[]";

    let questionsParsed: unknown = [];
    try {
      questionsParsed = JSON.parse(questionsJson);
    } catch {
      logger.warn("invalid_questions_json");
      logger.end({ success: false, errorMessage: "invalid_questions_json" });
      return {
        success: false,
        messages: ["設問データの形式が不正です"],
        error: "VALIDATION_ERROR",
        fieldErrors: { questionsJson: ["設問データの形式が不正です"] },
      };
    }
    const raw = {
      questionnaireId: formData.get("questionnaireId"),
      title: formData.get("title"),
      description: formData.get("description") ?? undefined,
      estimatedMinutes: formData.get("estimatedMinutes"),
      rewardYen: formData.get("rewardYen"),
      publishAt: formData.get("publishAt"),
      deadline: formData.get("deadline"),
      targetUniversity: formData.get("targetUniversity"),
      rewardLimit: formData.get("rewardLimit"),
      timeLimitMinutes: formData.get("timeLimitMinutes"),
      questions: questionsParsed,
    };

    const parsed = SaveSurveyDraftSchema.safeParse(raw);
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
          estimatedMinutes: fieldErrors.estimatedMinutes,
          rewardYen: fieldErrors.rewardYen,
          publishAt: fieldErrors.publishAt,
          deadline: fieldErrors.deadline,
          targetUniversity: fieldErrors.targetUniversity,
          rewardLimit: fieldErrors.rewardLimit,
          timeLimitMinutes: fieldErrors.timeLimitMinutes,
          questionsJson: fieldErrors.questions,
        },
      };
    }

    const supabase = await createClient();

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      logger.warn("unauthorized", { hasUser: Boolean(user), userError });
      logger.end({ success: false, errorMessage: "unauthorized" });
      return {
        success: false,
        messages: ["認証に失敗しました"],
        error: "AUTH_ERROR",
      };
    }

    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      logger.warn("session_not_found", { userId: user.id });
      logger.end({ success: false, errorMessage: "session_not_found" });
      return {
        success: false,
        messages: ["セッションが見つかりません"],
        error: "SESSION_ERROR",
      };
    }

    const thumbnail = formData.get("thumbnail");
    const currentThumbnailUrl = toOptionalString(
      formData.get("currentThumbnailUrl"),
    );
    let thumbnailPath: string | null = null;
    const isNewSurvey = parsed.data.questionnaireId == null;

    if ((!isFile(thumbnail) || thumbnail.size === 0) && isNewSurvey) {
      logger.warn("thumbnail_required");
      logger.end({ success: false, errorMessage: "thumbnail_required" });
      return {
        success: false,
        messages: ["サムネイル画像は必須です"],
        error: "VALIDATION_ERROR",
        fieldErrors: {
          thumbnail: ["サムネイル画像は必須です"],
        },
      };
    }

    if (
      (!isFile(thumbnail) || thumbnail.size === 0) &&
      !currentThumbnailUrl &&
      !isNewSurvey
    ) {
      logger.warn("thumbnail_required");
      logger.end({ success: false, errorMessage: "thumbnail_required" });
      return {
        success: false,
        messages: ["サムネイル画像は必須です"],
        error: "VALIDATION_ERROR",
        fieldErrors: {
          thumbnail: ["サムネイル画像は必須です"],
        },
      };
    }

    if (isFile(thumbnail) && thumbnail.size > 0) {
      if (thumbnail.size > MAX_THUMBNAIL_BYTES) {
        logger.warn("thumbnail_too_large", { size: thumbnail.size });
        logger.end({ success: false, errorMessage: "thumbnail_too_large" });
        return {
          success: false,
          messages: ["サムネイル画像のサイズが大きすぎます（最大5MB）"],
          error: "VALIDATION_ERROR",
          fieldErrors: {
            thumbnail: ["サムネイル画像のサイズが大きすぎます（最大5MB）"],
          },
        };
      }

      const fileExt = (thumbnail.name.split(".").pop() || "").toLowerCase();
      if (
        !AllowedThumbnailExtensionsSchema.options.includes(
          fileExt as (typeof AllowedThumbnailExtensionsSchema.options)[number],
        )
      ) {
        logger.warn("thumbnail_invalid_extension", { fileExt });
        logger.end({
          success: false,
          errorMessage: "thumbnail_invalid_extension",
        });
        return {
          success: false,
          messages: [
            "サムネイル画像の形式が正しくありません（png/jpg/jpeg/webp）",
          ],
          error: "VALIDATION_ERROR",
          fieldErrors: {
            thumbnail: [
              "サムネイル画像の形式が正しくありません（png/jpg/jpeg/webp）",
            ],
          },
        };
      }

      if (
        thumbnail.type &&
        !AllowedThumbnailMimeTypesSchema.options.includes(
          thumbnail.type as (typeof AllowedThumbnailMimeTypesSchema.options)[number],
        )
      ) {
        logger.warn("thumbnail_invalid_mime_type", {
          mimeType: thumbnail.type,
        });
        logger.end({
          success: false,
          errorMessage: "thumbnail_invalid_mime_type",
        });
        return {
          success: false,
          messages: ["サムネイル画像の形式が正しくありません"],
          error: "VALIDATION_ERROR",
          fieldErrors: {
            thumbnail: ["サムネイル画像の形式が正しくありません"],
          },
        };
      }

      const fileName = `${
        globalThis.crypto?.randomUUID?.() ?? Math.random().toString(36).slice(2)
      }.${fileExt}`;
      const filePath = `thumbnails/${fileName}`;

      const arrayBuffer = await thumbnail.arrayBuffer();
      const { data, error } = await supabase.storage
        .from(THUMBNAIL_BUCKET)
        .upload(filePath, new Uint8Array(arrayBuffer), {
          upsert: true,
          contentType: thumbnail.type || undefined,
        });

      if (error) {
        logger.error(error, { action: "upload_thumbnail" });
        logger.end({ success: false, errorMessage: "upload_thumbnail_failed" });
        return {
          success: false,
          messages: ["サムネイルのアップロードに失敗しました"],
          error: "UPLOAD_ERROR",
        };
      }

      thumbnailPath = data.path;
    }

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
      questionnaireId: parsed.data.questionnaireId ?? null,
      title: parsed.data.title,
      description: parsed.data.description,
      estimatedMinutes: String(parsed.data.estimatedMinutes),
      rewardYen: parsed.data.rewardYen,
      publishAt: toUtcIsoFromJstLocal(parsed.data.publishAt),
      deadline: toUtcIsoFromJstLocal(parsed.data.deadline),
      targetAudience: parsed.data.targetUniversity,
      rewardLimit: parsed.data.rewardLimit,
      timeLimitMinutes: parsed.data.timeLimitMinutes,
      thumbnailImageUrl: thumbnailPath ?? currentThumbnailUrl,
      questions: parsed.data.questions.map((q) => ({
        id: q.id,
        required: q.required,
        questionText: q.questionText,
        type: q.type,
        options: q.options ?? [],
        pageNumber: q.pageNumber ?? 1,
      })),
    };

    const response = await fetch(
      `${supabaseUrl}/functions/v1/update-survey-for-admin`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
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
    const parsedResponse = UpsertSurveyForAdminResponseSchema.safeParse(json);
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
    redirect("/surveys");
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
