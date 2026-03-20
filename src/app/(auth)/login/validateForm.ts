import { AuthError } from "@supabase/supabase-js";
import type { LoginFormData, LoginFormErrors } from "./types";

export function validateLoginForm(data: LoginFormData): LoginFormErrors {
	const errors: LoginFormErrors = {};

	if (!data.email) {
		errors.email = "メールアドレスを入力してください";
	} else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
		errors.email = "有効なメールアドレスを入力してください";
	}

	if (!data.password) {
		errors.password = "パスワードを入力してください";
	}

	return errors;
}

export function getAuthErrorMessage(error: unknown): LoginFormErrors {
	if (error instanceof AuthError && error.status === 400) {
		return { general: "メールアドレスまたはパスワードが正しくありません" };
	}
	return { general: "ログインに失敗しました" };
}

export function hasErrors(errors: LoginFormErrors): boolean {
	return Object.keys(errors).length > 0;
}
