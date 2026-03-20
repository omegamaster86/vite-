"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { z } from "zod";
import { createLogger } from "@/services/logger";
import { getAuthenticatedSession } from "@/services/supabase/auth";
import type { AccountApprovalUser, ApprovalStatus } from "@/types";
import {
  GetAccountApprovalsResponseSchema,
  UpdateAccountApprovalStatusResponseSchema,
} from "@/types/schemas";

const UpdateAccountApprovalStatusParamsSchema = z.object({
  userId: z.string().min(1),
  status: z.enum(["approved", "rejected"]),
  adminMemo: z.string().optional(),
});

/**
 * アカウント承認一覧を取得（Edge Function経由）
 * - 認証検証は getUser() を使用（必須）
 * - access_token が必要なため getSession() で取得
 * - Edge Function は fetch(GET) で呼び出し
 * - レスポンスは Zod で検証（trust boundary）
 */
export async function getAccountApprovals(params?: {
  page?: number;
  pageSize?: number;
  status?: ApprovalStatus;
}): Promise<{
  users: AccountApprovalUser[];
  total: number;
  page: number;
  pageSize: number;
  pendingCount: number;
}> {
  const buildEmptyResponse = (page = 1, pageSize = 10) => ({
    users: [],
    total: 0,
    page,
    pageSize,
    pendingCount: 0,
  });
  cookies();

  const logger = createLogger("getAccountApprovals");
  logger.start();

  try {
    const authResult = await getAuthenticatedSession();
    if (authResult.errorCode === "unauthorized") {
      logger.warn("unauthorized", {
        hasUser: Boolean(authResult.user),
        userError: authResult.userError,
      });
      logger.end({ success: false, errorMessage: "unauthorized" });
      return buildEmptyResponse();
    }

    if (authResult.errorCode === "session_not_found") {
      logger.warn("session_not_found", { userId: authResult.user?.id });
      logger.end({ success: false, errorMessage: "session_not_found" });
      return buildEmptyResponse();
    }
    const session = authResult.session;

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    if (!supabaseUrl) {
      logger.error(new Error("NEXT_PUBLIC_SUPABASE_URL is not set"));
      logger.end({ success: false, errorMessage: "config_error" });
      return buildEmptyResponse();
    }

    const page = params?.page && params.page >= 1 ? params.page : 1;
    const pageSize =
      params?.pageSize && params.pageSize >= 1 ? params.pageSize : 10;
    const status = params?.status ?? "pending";
    const queryParams = new URLSearchParams({
      page: page.toString(),
      status,
    });

    const response = await fetch(
      `${supabaseUrl}/functions/v1/get-account-approvals-for-admin?${queryParams.toString()}`,
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
      return buildEmptyResponse(page, pageSize);
    }

    const json = (await response.json()) as unknown;
    const parsed = GetAccountApprovalsResponseSchema.safeParse(json);
    if (!parsed.success) {
      logger.warn("invalid_response_shape", { error: parsed.error });
      logger.end({ success: false, errorMessage: "invalid_response_shape" });
      return buildEmptyResponse(page, pageSize);
    }

    if ("error" in parsed.data) {
      logger.warn("edge_function_returned_error", { error: parsed.data.error });
      logger.end({
        success: false,
        errorMessage: "edge_function_returned_error",
      });
      return buildEmptyResponse(page, pageSize);
    }

    const users: AccountApprovalUser[] = parsed.data.data.map((row) => {
      return {
        id: String(row.id),
        displayName: row.displayName,
        universityName: row.universityName,
        grade: row.grade,
        faculty: row.faculty,
        department: row.department,
        studentNumber: row.studentNumber,
        studentCardImageUrl: row.studentCardImageUrl,
        appliedAt: row.appliedAt,
        adminMemo: row.adminMemo || "",
        approvalStatus: row.approvalStatus,
      };
    });
    const total = parsed.data.total;
    const responsePage = parsed.data.page;
    const responsePageSize = parsed.data.pageSize;
    const pendingCount = parsed.data.pendingCount;

    logger.end({ success: true });
    return {
      users,
      total,
      page: responsePage,
      pageSize: responsePageSize,
      pendingCount,
    };
  } catch (err) {
    logger.error(err);
    logger.end({ success: false, errorMessage: "unexpected_error" });
    return buildEmptyResponse();
  }
}

/**
 * アカウント承認ステータス更新（Edge Function経由）
 * - 認証検証は getUser() を使用（必須）
 * - access_token が必要なため getSession() で取得
 * - Edge Function は fetch(POST) で呼び出し
 * - レスポンスは Zod で検証（trust boundary）
 */
export async function updateAccountApprovalStatus(params: {
  userId: string;
  status: Exclude<ApprovalStatus, "pending">;
  adminMemo?: string;
}): Promise<{ success: boolean; error?: string }> {
  cookies();

  const logger = createLogger("updateAccountApprovalStatus");
  logger.start({ userId: params.userId, status: params.status });

  try {
    const parsedParams =
      UpdateAccountApprovalStatusParamsSchema.safeParse(params);
    if (!parsedParams.success) {
      logger.warn("invalid_params", { error: parsedParams.error });
      logger.end({ success: false, errorMessage: "invalid_params" });
      return { success: false, error: "invalid_params" };
    }

    const { userId, status } = parsedParams.data;
    const authResult = await getAuthenticatedSession();
    if (authResult.errorCode === "unauthorized") {
      logger.warn("unauthorized", {
        hasUser: Boolean(authResult.user),
        userError: authResult.userError,
      });
      logger.end({ success: false, errorMessage: "unauthorized" });
      return { success: false, error: "unauthorized" };
    }

    if (authResult.errorCode === "session_not_found") {
      logger.warn("session_not_found", { userId: authResult.user?.id });
      logger.end({ success: false, errorMessage: "session_not_found" });
      return { success: false, error: "session_not_found" };
    }
    const session = authResult.session;

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    if (!supabaseUrl) {
      logger.error(new Error("NEXT_PUBLIC_SUPABASE_URL is not set"));
      logger.end({ success: false, errorMessage: "config_error" });
      return { success: false, error: "config_error" };
    }

    const response = await fetch(
      `${supabaseUrl}/functions/v1/update-account-approval-status-for-admin`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify({
          userId: Number(userId),
          status,
          adminMemo: params.adminMemo ?? "",
        }),
      },
    );

    if (!response.ok) {
      const errorBody = await response.json().catch(() => null);
      logger.warn("edge_function_error", {
        status: response.status,
        statusText: response.statusText,
        errorBody,
      });
      logger.end({ success: false, errorMessage: "edge_function_error" });
      const errorMessage =
        typeof errorBody?.error === "string"
          ? errorBody.error
          : "edge_function_error";
      return { success: false, error: errorMessage };
    }

    const json = (await response.json()) as unknown;
    const parsed = UpdateAccountApprovalStatusResponseSchema.safeParse(json);
    if (!parsed.success) {
      logger.warn("invalid_response_shape", { error: parsed.error });
      logger.end({ success: false, errorMessage: "invalid_response_shape" });
      return { success: false, error: "invalid_response_shape" };
    }

    if ("error" in parsed.data) {
      logger.warn("edge_function_returned_error", { error: parsed.data.error });
      logger.end({
        success: false,
        errorMessage: "edge_function_returned_error",
      });
      return { success: false, error: parsed.data.error };
    }

    revalidatePath("/approvals");
    logger.end({ success: true });
    return { success: true };
  } catch (err) {
    logger.error(err);
    logger.end({ success: false, errorMessage: "unexpected_error" });
    return { success: false, error: "unexpected_error" };
  }
}
