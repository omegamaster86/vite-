/**
 * ログアウト処理を行う Server Action。
 * - Supabase Auth のサインアウト（Cookie削除）
 * - ログインページへリダイレクト
 */
"use server";

import { redirect } from "next/navigation";
import { createLogger } from "@/services/logger";
import { createClient } from "@/services/supabase/server";

export async function logout() {
  const logger = createLogger("logout");
  logger.start();

  const supabase = await createClient();
  let success = true;
  let errorMessage: string | undefined;

  try {
    const { error } = await supabase.auth.signOut();
    if (error) {
      success = false;
      errorMessage = "ログアウトに失敗しました";
      logger.error(error, { context: "supabase.auth.signOut" });
    }
  } catch (error: unknown) {
    success = false;
    errorMessage = "ログアウトに失敗しました";
    logger.error(error, { context: "logout" });
  } finally {
    logger.end({ success, ...(errorMessage ? { errorMessage } : {}) });
  }

  redirect("/login");
}
