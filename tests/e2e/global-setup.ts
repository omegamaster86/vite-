import { execSync } from "node:child_process";

/**
 * Playwright Global Setup
 * 全テスト実行前に一度だけ実行される
 *
 * Supabaseデータベースをリセットしてテスト環境を初期化する
 */
export default async function globalSetup() {
  console.log("\n🔧 [GLOBAL SETUP] Starting database reset...");

  // CI環境ではworkflowで既にdb resetを実行しているのでスキップ
  if (process.env.CI) {
    console.log("⏭️  [GLOBAL SETUP] Skipping database reset in CI environment");
    await new Promise((resolve) => setTimeout(resolve, 5000));
    return;
  }

  // ローカル環境ではDB resetを実行
  try {
    console.log("🔄 [GLOBAL SETUP] Resetting Supabase database...");
    execSync("supabase db reset", {
      stdio: "inherit",
      env: process.env,
      cwd: process.cwd(),
    });

    // 少し待機してデータベースが完全に初期化されるのを確認
    await new Promise((resolve) => setTimeout(resolve, 3000));
    console.log("✅ [GLOBAL SETUP] Database reset completed successfully\n");
  } catch (error) {
    console.error(
      "❌ [GLOBAL SETUP] Failed to reset Supabase database:",
      error,
    );
    throw error;
  }
}
