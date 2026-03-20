"use server";

import { cookies } from "next/headers";
import { createLogger } from "@/services/logger";
import { getAuthenticatedSession } from "@/services/supabase/auth";
import type { UniversityOption } from "@/types";
import { GetUniversitiesResponseSchema } from "@/types/schemas";

/**
 * 大学一覧を取得（Edge Function経由）
 * - 認証検証は getUser() を使用（必須）
 * - access_token が必要なため getSession() で取得
 * - レスポンスは Zod で検証（trust boundary）
 */
export async function getUniversities(): Promise<UniversityOption[]> {
  cookies();

  const logger = createLogger("getUniversities");
  logger.start();

  try {
    const authResult = await getAuthenticatedSession();
    if (authResult.errorCode === "unauthorized") {
      logger.warn("unauthorized", {
        hasUser: Boolean(authResult.user),
        userError: authResult.userError,
      });
      logger.end({ success: false, errorMessage: "unauthorized" });
      return [];
    }

    if (authResult.errorCode === "session_not_found") {
      logger.warn("session_not_found", { userId: authResult.user?.id });
      logger.end({ success: false, errorMessage: "session_not_found" });
      return [];
    }
    const session = authResult.session;

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    if (!supabaseUrl) {
      logger.error(new Error("NEXT_PUBLIC_SUPABASE_URL is not set"));
      logger.end({ success: false, errorMessage: "config_error" });
      return [];
    }

    const response = await fetch(
      `${supabaseUrl}/functions/v1/get-universities`,
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
      return [];
    }

    const json = (await response.json()) as unknown;
    const parsed = GetUniversitiesResponseSchema.safeParse(json);
    if (!parsed.success) {
      logger.warn("invalid_response_shape", { error: parsed.error });
      logger.end({ success: false, errorMessage: "invalid_response_shape" });
      return [];
    }

    if ("error" in parsed.data) {
      logger.warn("edge_function_returned_error", { error: parsed.data.error });
      logger.end({
        success: false,
        errorMessage: "edge_function_returned_error",
      });
      return [];
    }

    const universities: UniversityOption[] = parsed.data.data.map((row) => {
      return { id: String(row.id), name: row.name };
    });

    logger.end({ success: true });
    return universities;
  } catch (err) {
    logger.error(err);
    logger.end({ success: false, errorMessage: "unexpected_error" });
    return [];
  }
}
