/**
 * ログインフォームからのログイン処理を行う Server Action。
 * - 入力バリデーション
 * - Supabase Auth でのログイン
 * - Edge Function 経由での権限判定
 */
"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/services/supabase/server";
import type { LoginActionState } from "../types";
import {
  getAuthErrorMessage,
  hasErrors,
  validateLoginForm,
} from "../validateForm";

type GetUserAuthorityTypeResponse =
  | { success: true; data: { authorityType: string } }
  | { success: false; error?: string };

export async function login(
  _prevState: LoginActionState,
  formData: FormData,
): Promise<LoginActionState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  const validationErrors = validateLoginForm({ email, password });
  if (hasErrors(validationErrors)) {
    return { errors: validationErrors };
  }

  const supabase = await createClient();

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return { errors: getAuthErrorMessage(error) };
    }

    const authUserId = data.user?.id;
    const accessToken = data.session?.access_token;
    if (!authUserId || !accessToken) {
      await supabase.auth.signOut();
      return { errors: { general: "ログインに失敗しました" } };
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    if (!supabaseUrl) {
      await supabase.auth.signOut();
      return { errors: { general: "ログインに失敗しました" } };
    }

    const queryParams = new URLSearchParams({ authUserId });
    const functionPath = "/functions/v1/get-user-authority-type-for-admin";
    const functionUrl = `${supabaseUrl}${functionPath}?${queryParams.toString()}`;

    const response = await fetch(functionUrl, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      await supabase.auth.signOut();
      return {
        errors: { general: "ユーザー情報の取得に失敗しました" },
      };
    }

    const result = (await response.json()) as GetUserAuthorityTypeResponse;

    if (!result.success) {
      await supabase.auth.signOut();
      return {
        errors: { general: "ユーザー情報の取得に失敗しました" },
      };
    }

    if (result.data.authorityType !== "admin") {
      await supabase.auth.signOut();
      return { errors: { general: "管理者権限がありません" } };
    }
  } catch (error: unknown) {
    await supabase.auth.signOut();
    return { errors: getAuthErrorMessage(error) };
  }
  redirect("/surveys");
}
