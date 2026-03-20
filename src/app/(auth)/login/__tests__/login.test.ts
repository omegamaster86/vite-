import { AuthError } from "@supabase/supabase-js";
import { redirect } from "next/navigation";
import { beforeEach, describe, expect, test, vi } from "vitest";
import { createClient } from "@/temp/lib/supabase/server";
import type { LoginActionState } from "../types";

vi.mock("next/navigation", () => ({
	redirect: vi.fn(),
}));

vi.mock("@/lib/supabase/server", () => ({
	createClient: vi.fn(),
}));

import { login } from "../_actions/login";

type SupabaseAuthMock = {
	signInWithPassword: ReturnType<typeof vi.fn>;
	signOut: ReturnType<typeof vi.fn>;
};

function createFormData(params: { email: string; password: string }) {
	const formData = new FormData();
	formData.set("email", params.email);
	formData.set("password", params.password);
	return formData;
}

describe("login action", () => {
	const initialState: LoginActionState = { errors: {} };

	const redirectMock = vi.mocked(redirect);
	const createClientMock = vi.mocked(createClient);

	const fetchMock = vi.fn();
	vi.stubGlobal("fetch", fetchMock);

	let auth: SupabaseAuthMock;

	beforeEach(() => {
		redirectMock.mockReset();
		createClientMock.mockReset();
		fetchMock.mockReset();

		process.env.NEXT_PUBLIC_SUPABASE_URL = "https://example.supabase.co";

		auth = {
			signInWithPassword: vi.fn(),
			signOut: vi.fn().mockResolvedValue({}),
		};
		createClientMock.mockResolvedValue({ auth } as unknown as never);
	});

	test("入力バリデーションエラー_エラーを返し、Supabaseに接続しない", async () => {
		const formData = createFormData({ email: "", password: "validPass123" });

		const result = await login(initialState, formData);

		expect(result.errors.email).toBe("メールアドレスを入力してください");
		expect(createClientMock).not.toHaveBeenCalled();
		expect(redirectMock).not.toHaveBeenCalled();
	});

	test("signInWithPasswordがAuthError(400)を返す_認証失敗メッセージを返す", async () => {
		auth.signInWithPassword.mockResolvedValue({
			data: {},
			error: new AuthError("Invalid credentials", 400),
		});

		const formData = createFormData({
			email: "test@example.com",
			password: "validPass123",
		});
		const result = await login(initialState, formData);

		expect(result).toEqual({
			errors: { general: "メールアドレスまたはパスワードが正しくありません" },
		});
		expect(auth.signOut).not.toHaveBeenCalled();
		expect(fetchMock).not.toHaveBeenCalled();
		expect(redirectMock).not.toHaveBeenCalled();
	});

	test("signIn成功だがuserId/accessToken欠落_signOutして汎用エラーを返す", async () => {
		auth.signInWithPassword.mockResolvedValue({
			data: { user: null, session: null },
			error: null,
		});

		const formData = createFormData({
			email: "test@example.com",
			password: "validPass123",
		});
		const result = await login(initialState, formData);

		expect(auth.signOut).toHaveBeenCalledTimes(1);
		expect(result).toEqual({ errors: { general: "ログインに失敗しました" } });
		expect(fetchMock).not.toHaveBeenCalled();
		expect(redirectMock).not.toHaveBeenCalled();
	});

	test("NEXT_PUBLIC_SUPABASE_URL未設定_signOutして汎用エラーを返す", async () => {
		process.env.NEXT_PUBLIC_SUPABASE_URL = "";
		auth.signInWithPassword.mockResolvedValue({
			data: { user: { id: "user-1" }, session: { access_token: "token-1" } },
			error: null,
		});

		const formData = createFormData({
			email: "test@example.com",
			password: "validPass123",
		});
		const result = await login(initialState, formData);

		expect(auth.signOut).toHaveBeenCalledTimes(1);
		expect(result).toEqual({ errors: { general: "ログインに失敗しました" } });
		expect(fetchMock).not.toHaveBeenCalled();
		expect(redirectMock).not.toHaveBeenCalled();
	});

	test("Edge FunctionのHTTPがOKでない_signOutして取得失敗エラーを返す", async () => {
		auth.signInWithPassword.mockResolvedValue({
			data: { user: { id: "user-1" }, session: { access_token: "token-1" } },
			error: null,
		});
		fetchMock.mockResolvedValue({ ok: false });

		const formData = createFormData({
			email: "test@example.com",
			password: "validPass123",
		});
		const result = await login(initialState, formData);

		expect(fetchMock).toHaveBeenCalledTimes(1);
		expect(auth.signOut).toHaveBeenCalledTimes(1);
		expect(result).toEqual({
			errors: { general: "ユーザー情報の取得に失敗しました" },
		});
		expect(redirectMock).not.toHaveBeenCalled();
	});

	test("Edge Functionがsuccess:false_signOutして取得失敗エラーを返す", async () => {
		auth.signInWithPassword.mockResolvedValue({
			data: { user: { id: "user-1" }, session: { access_token: "token-1" } },
			error: null,
		});
		fetchMock.mockResolvedValue({
			ok: true,
			json: vi.fn().mockResolvedValue({ success: false }),
		});

		const formData = createFormData({
			email: "test@example.com",
			password: "validPass123",
		});
		const result = await login(initialState, formData);

		expect(auth.signOut).toHaveBeenCalledTimes(1);
		expect(result).toEqual({
			errors: { general: "ユーザー情報の取得に失敗しました" },
		});
		expect(redirectMock).not.toHaveBeenCalled();
	});

	test("authorityTypeがadmin以外_signOutして権限エラーを返す", async () => {
		auth.signInWithPassword.mockResolvedValue({
			data: { user: { id: "user-1" }, session: { access_token: "token-1" } },
			error: null,
		});
		fetchMock.mockResolvedValue({
			ok: true,
			json: vi.fn().mockResolvedValue({
				success: true,
				data: { authorityType: "user" },
			}),
		});

		const formData = createFormData({
			email: "test@example.com",
			password: "validPass123",
		});
		const result = await login(initialState, formData);

		expect(auth.signOut).toHaveBeenCalledTimes(1);
		expect(result).toEqual({ errors: { general: "管理者権限がありません" } });
		expect(redirectMock).not.toHaveBeenCalled();
	});

	test("例外が発生_signOutして汎用エラーを返す", async () => {
		auth.signInWithPassword.mockRejectedValue(new Error("boom"));

		const formData = createFormData({
			email: "test@example.com",
			password: "validPass123",
		});
		const result = await login(initialState, formData);

		expect(auth.signOut).toHaveBeenCalledTimes(1);
		expect(result).toEqual({ errors: { general: "ログインに失敗しました" } });
		expect(redirectMock).not.toHaveBeenCalled();
	});

	test("成功時_adminなら/surveysへredirectする（fetchのリクエスト内容も検証）", async () => {
		auth.signInWithPassword.mockResolvedValue({
			data: { user: { id: "user-1" }, session: { access_token: "token-1" } },
			error: null,
		});
		fetchMock.mockResolvedValue({
			ok: true,
			json: vi.fn().mockResolvedValue({
				success: true,
				data: { authorityType: "admin" },
			}),
		});

		redirectMock.mockImplementation(() => {
			throw new Error("NEXT_REDIRECT");
		});

		const formData = createFormData({
			email: "test@example.com",
			password: "validPass123",
		});

		await expect(login(initialState, formData)).rejects.toThrow(
			"NEXT_REDIRECT",
		);
		expect(fetchMock).toHaveBeenCalledWith(
			"https://example.supabase.co/functions/v1/get-user-authority-type?authUserId=user-1",
			{
				method: "GET",
				headers: { Authorization: "Bearer token-1" },
			},
		);
		expect(auth.signOut).not.toHaveBeenCalled();
		expect(redirectMock).toHaveBeenCalledWith("/surveys");
	});
});
