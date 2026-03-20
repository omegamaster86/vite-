import { AuthError } from "@supabase/supabase-js";
import { describe, expect, test } from "vitest";
import type { LoginFormErrors } from "../types";
import {
	getAuthErrorMessage,
	hasErrors,
	validateLoginForm,
} from "../validateForm";

describe("validateLoginForm", () => {
	describe("メールバリデーション", () => {
		describe("必須チェック", () => {
			test("空文字_必須エラーを返す", () => {
				const result = validateLoginForm({
					email: "",
					password: "validPass123",
				});
				expect(result.email).toBe("メールアドレスを入力してください");
			});

			test("空白のみ_必須エラーを返す", () => {
				const result = validateLoginForm({
					email: "   ",
					password: "validPass123",
				});
				expect(result.email).toBe("メールアドレスを入力してください");
			});
		});

		describe("形式チェック", () => {
			test.each([
				["invalid", "@なし"],
				["invalid@", "ドメインなし"],
				["@example.com", "ローカルパートなし"],
				["invalid@example", "TLDなし"],
				["invalid@.com", "ドメイン名なし"],
			])("%s_形式エラーを返す", (email) => {
				const result = validateLoginForm({ email, password: "validPass123" });
				expect(result.email).toBe("有効なメールアドレスを入力してください");
			});
		});

		describe("正常系", () => {
			test("標準形式_エラーなし", () => {
				const result = validateLoginForm({
					email: "test@example.com",
					password: "validPass123",
				});
				expect(result.email).toBeUndefined();
			});
		});
	});

	describe("パスワードバリデーション", () => {
		describe("必須チェック", () => {
			test("空文字_必須エラーを返す", () => {
				const result = validateLoginForm({
					email: "test@example.com",
					password: "",
				});
				expect(result.password).toBe("パスワードを入力してください");
			});
		});
	});

	describe("複合バリデーション", () => {
		test("両方空_メールエラーを返す", () => {
			const result = validateLoginForm({ email: "", password: "" });
			expect(result.email).toBe("メールアドレスを入力してください");
		});

		test("両方空_パスワードエラーを返す", () => {
			const result = validateLoginForm({ email: "", password: "" });
			expect(result.password).toBe("パスワードを入力してください");
		});

		test("両方有効_空オブジェクトを返す", () => {
			const result = validateLoginForm({
				email: "test@example.com",
				password: "validPass123",
			});
			expect(result).toEqual({});
		});
	});
});

describe("getAuthErrorMessage", () => {
	test("AuthError_status400_認証失敗メッセージを返す", () => {
		const error = new AuthError("Invalid credentials", 400);
		const result = getAuthErrorMessage(error);
		expect(result.general).toBe("メールアドレスまたはパスワードが正しくありません");
	});

	test("AuthError_status401_汎用エラーを返す", () => {
		const error = new AuthError("Unauthorized", 401);
		const result = getAuthErrorMessage(error);
		expect(result.general).toBe("ログインに失敗しました");
	});

	test("通常のError_汎用エラーを返す", () => {
		const error = new Error("Network error");
		const result = getAuthErrorMessage(error);
		expect(result.general).toBe("ログインに失敗しました");
	});
});

describe("hasErrors", () => {
	test("空オブジェクト_falseを返す", () => {
		const errors: LoginFormErrors = {};
		expect(hasErrors(errors)).toBe(false);
	});

	test("emailエラーのみ_trueを返す", () => {
		const errors: LoginFormErrors = { email: "エラー" };
		expect(hasErrors(errors)).toBe(true);
	});

	test("passwordエラーのみ_trueを返す", () => {
		const errors: LoginFormErrors = { password: "エラー" };
		expect(hasErrors(errors)).toBe(true);
	});

	test("generalエラーのみ_trueを返す", () => {
		const errors: LoginFormErrors = { general: "エラー" };
		expect(hasErrors(errors)).toBe(true);
	});

	test("複数エラー_trueを返す", () => {
		const errors: LoginFormErrors = { email: "エラー1", password: "エラー2" };
		expect(hasErrors(errors)).toBe(true);
	});
});
