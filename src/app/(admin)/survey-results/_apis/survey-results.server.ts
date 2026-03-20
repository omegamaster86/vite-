"use server";

import { cookies } from "next/headers";
import { createLogger } from "@/services/logger";
import { getAuthenticatedSession } from "@/services/supabase/auth";
import type { SurveyDetails, SurveyResultItem } from "@/types";
import {
  GetSurveyDetailAnswersResponseSchema,
  GetSurveyResultsMetaResponseSchema,
} from "@/types/schemas";

function isNonEmptyString(value: string) {
  return value.trim().length > 0;
}

function isFiniteNumber(value: number) {
  return Number.isFinite(value) && value > 0;
}

function hasRequiredFallbackSurveyDetails(
  params: Omit<SurveyDetails, "questions">,
): boolean {
  return (
    isNonEmptyString(params.id) &&
    isNonEmptyString(params.title) &&
    isNonEmptyString(params.deadline) &&
    isNonEmptyString(params.thumbnailImageUrl) &&
    isFiniteNumber(params.estimatedMinutes) &&
    isFiniteNumber(params.rewardYen) &&
    isFiniteNumber(params.responseCount)
  );
}

function resolveFallbackSurveyDetails(
  fallback: Omit<SurveyDetails, "questions"> | undefined,
  logger: ReturnType<typeof createLogger>,
): SurveyDetails | null {
  if (!fallback) return null;
  if (!hasRequiredFallbackSurveyDetails(fallback)) {
    logger.warn("fallback_required_fields_missing", { fallback });
    return null;
  }
  return buildFallbackSurveyDetails(fallback);
}

function buildFallbackSurveyDetails(
  params: Omit<SurveyDetails, "questions">,
): SurveyDetails {
  return {
    id: params.id,
    title: params.title,
    estimatedMinutes: params.estimatedMinutes,
    minimumInputMinutes: params.minimumInputMinutes,
    rewardYen: params.rewardYen,
    deadline: params.deadline,
    responseCount: params.responseCount,
    thumbnailImageUrl: params.thumbnailImageUrl,
    questions: [],
  };
}

/**
 * アンケート回答結果のメタ情報を取得（Edge Function経由）
 * - 認証検証は getUser() を使用（必須）
 * - access_token が必要なため getSession() で取得
 * - レスポンスは Zod で検証（trust boundary）
 */
export async function getSurveyResultsMeta(params: {
  questionnaireId: number;
  fallback?: Omit<SurveyDetails, "questions">;
}): Promise<SurveyDetails | null> {
  cookies();

  const logger = createLogger("getSurveyResultsMeta");
  logger.start({ questionnaireId: params.questionnaireId });

  try {
    const authResult = await getAuthenticatedSession();
    if (authResult.errorCode === "unauthorized") {
      logger.warn("unauthorized", {
        hasUser: Boolean(authResult.user),
        userError: authResult.userError,
      });
      logger.end({ success: false, errorMessage: "unauthorized" });
      return resolveFallbackSurveyDetails(params.fallback, logger);
    }

    if (authResult.errorCode === "session_not_found") {
      logger.warn("session_not_found", { userId: authResult.user?.id });
      logger.end({ success: false, errorMessage: "session_not_found" });
      return resolveFallbackSurveyDetails(params.fallback, logger);
    }
    const session = authResult.session;

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    if (!supabaseUrl) {
      logger.error(new Error("NEXT_PUBLIC_SUPABASE_URL is not set"));
      logger.end({ success: false, errorMessage: "config_error" });
      return resolveFallbackSurveyDetails(params.fallback, logger);
    }

    const query = new URLSearchParams({
      questionnaireId: String(params.questionnaireId),
    });

    const response = await fetch(
      `${supabaseUrl}/functions/v1/get-survey-results-meta-for-admin?${query.toString()}`,
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
      return resolveFallbackSurveyDetails(params.fallback, logger);
    }

    const json = (await response.json()) as unknown;
    const parsed = GetSurveyResultsMetaResponseSchema.safeParse(json);
    if (!parsed.success) {
      logger.warn("invalid_response_shape", { error: parsed.error });
      logger.end({ success: false, errorMessage: "invalid_response_shape" });
      return resolveFallbackSurveyDetails(params.fallback, logger);
    }

    if ("error" in parsed.data) {
      logger.warn("edge_function_returned_error", { error: parsed.data.error });
      logger.end({
        success: false,
        errorMessage: "edge_function_returned_error",
      });
      return resolveFallbackSurveyDetails(params.fallback, logger);
    }

    if (!parsed.data.data) {
      logger.info("not_found", { questionnaireId: params.questionnaireId });
      logger.end({ success: true });
      return resolveFallbackSurveyDetails(params.fallback, logger);
    }

    const meta = parsed.data.data;
    const result: SurveyDetails = {
      id: String(meta.id),
      title: meta.title,
      estimatedMinutes: meta.estimatedMinutes,
      minimumInputMinutes: meta.minimumInputMinutes,
      rewardYen: meta.rewardYen,
      deadline: meta.deadline,
      responseCount: meta.responseCount,
      thumbnailImageUrl: meta.thumbnailImageUrl,
      questions:
        meta.questions?.map((q) => ({
          questionNumber: q.questionNumber,
        })) ?? [],
    };

    logger.end({ success: true });
    return result;
  } catch (err) {
    logger.error(err);
    logger.end({ success: false, errorMessage: "unexpected_error" });
    return resolveFallbackSurveyDetails(params.fallback, logger);
  }
}

/**
 * アンケート回答一覧を取得（Edge Function経由）
 * - 認証検証は getUser() を使用（必須）
 * - access_token が必要なため getSession() で取得
 * - レスポンスは Zod で検証（trust boundary）
 */
export async function getSurveyDetailAnswers(params: {
  questionnaireId: number;
  page?: number;
  pageSize?: number;
}): Promise<{
  surveyResults: SurveyResultItem[];
  total: number;
  page: number;
  pageSize: number;
}> {
  cookies();

  const logger = createLogger("getSurveyDetailAnswers");
  logger.start({ questionnaireId: params.questionnaireId });
  const page = params.page && params.page >= 1 ? params.page : 1;
  const pageSize =
    params.pageSize && params.pageSize >= 1 ? params.pageSize : 10;

  try {
    const authResult = await getAuthenticatedSession();
    if (authResult.errorCode === "unauthorized") {
      logger.warn("unauthorized", {
        hasUser: Boolean(authResult.user),
        userError: authResult.userError,
      });
      logger.end({ success: false, errorMessage: "unauthorized" });
      return { surveyResults: [], total: 0, page, pageSize };
    }

    if (authResult.errorCode === "session_not_found") {
      logger.warn("session_not_found", { userId: authResult.user?.id });
      logger.end({ success: false, errorMessage: "session_not_found" });
      return { surveyResults: [], total: 0, page, pageSize };
    }
    const session = authResult.session;

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    if (!supabaseUrl) {
      logger.error(new Error("NEXT_PUBLIC_SUPABASE_URL is not set"));
      logger.end({ success: false, errorMessage: "config_error" });
      return { surveyResults: [], total: 0, page, pageSize };
    }

    const query = new URLSearchParams({
      questionnaireId: String(params.questionnaireId),
      page: String(page),
      pageSize: String(pageSize),
    });

    const response = await fetch(
      `${supabaseUrl}/functions/v1/get-survey-detail-answers-for-admin?${query.toString()}`,
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
      return { surveyResults: [], total: 0, page, pageSize };
    }

    const json = (await response.json()) as unknown;
    const parsed = GetSurveyDetailAnswersResponseSchema.safeParse(json);
    if (!parsed.success) {
      logger.warn("invalid_response_shape", { error: parsed.error });
      logger.end({ success: false, errorMessage: "invalid_response_shape" });
      return { surveyResults: [], total: 0, page, pageSize };
    }

    if ("error" in parsed.data) {
      logger.warn("edge_function_returned_error", { error: parsed.data.error });
      logger.end({
        success: false,
        errorMessage: "edge_function_returned_error",
      });
      return { surveyResults: [], total: 0, page, pageSize };
    }

    const results: SurveyResultItem[] = parsed.data.data.map((row) => {
      return {
        id: String(row.answerId),
        surveyId: String(params.questionnaireId),
        name: row.respondentName,
        university: row.universityName,
        academicYear: row.grade,
        faculty: row.faculty,
        department: row.department,
        answerDate: row.answeredAt,
        answerDuration: row.answerDuration,
        answers: row.answers,
      };
    });

    logger.end({ success: true });
    return {
      surveyResults: results,
      total: parsed.data.total,
      page: parsed.data.page,
      pageSize: parsed.data.pageSize,
    };
  } catch (err) {
    logger.error(err);
    logger.end({ success: false, errorMessage: "unexpected_error" });
    return { surveyResults: [], total: 0, page, pageSize };
  }
}
