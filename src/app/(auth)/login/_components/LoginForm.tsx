"use client";

import { Eye, EyeOff } from "lucide-react";
import Image from "next/image";
import { useActionState, useState } from "react";
import { login } from "@/app/(auth)/login/_actions/login";
import type {
  LoginActionState,
  LoginFormErrors,
} from "@/app/(auth)/login/types";
import { cn } from "@/utils/class-name";

export function LoginForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [hiddenFieldErrors, setHiddenFieldErrors] = useState<{
    email: boolean;
    password: boolean;
  }>({ email: false, password: false });

  const initialState: LoginActionState = { errors: {} };
  const [state, formAction, pending] = useActionState(login, initialState);

  const errors: LoginFormErrors = pending ? {} : { ...state.errors };
  if (hiddenFieldErrors.email) errors.email = undefined;
  if (hiddenFieldErrors.password) errors.password = undefined;

  return (
    <div className="flex flex-col items-center gap-10 w-[400px]">
      <Image src="/logo.svg" alt="カルぺ・ディエム" width={320} height={74} />

      <form
        action={formAction}
        onSubmitCapture={() => {
          setHiddenFieldErrors({ email: false, password: false });
        }}
        className="w-full"
      >
        <div className="flex flex-col gap-4 w-full">
          <div className="flex flex-col gap-1">
            <label
              htmlFor="email"
              className="text-[16px] leading-[1.6] text-[#222222] font-normal"
            >
              メールアドレス
            </label>
            <input
              id="email"
              name="email"
              type="text"
              placeholder="sample@sample.com"
              onChange={() => {
                if (errors.email) {
                  setHiddenFieldErrors((prev) => ({ ...prev, email: true }));
                }
              }}
              className={cn(
                "w-full h-[48px] px-3 border rounded-[4px] text-[16px] leading-[1.6] text-[#222222] placeholder:text-[#ACACAC] bg-white focus:outline-none",
                errors.email
                  ? "border-red-500 focus:border-red-500"
                  : "border-[#ACACAC]",
              )}
            />
            {errors.email && (
              <p className="text-sm text-red-500 mt-1">{errors.email}</p>
            )}
          </div>

          <div className="flex flex-col gap-1">
            <label
              htmlFor="password"
              className="text-[16px] leading-[1.6] text-[#222222] font-normal"
            >
              パスワード
            </label>
            <div className="relative">
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="password"
                onChange={() => {
                  if (errors.password) {
                    setHiddenFieldErrors((prev) => ({
                      ...prev,
                      password: true,
                    }));
                  }
                }}
                className={cn(
                  "w-full h-[48px] px-3 pr-12 border rounded-[4px] text-[16px] leading-[1.6] text-[#222222] placeholder:text-[#ACACAC] bg-white focus:outline-none",
                  errors.password
                    ? "border-red-500 focus:border-red-500"
                    : "border-[#ACACAC]",
                )}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 flex items-center justify-center text-[#ACACAC] hover:text-[#222222] cursor-pointer"
                aria-label={
                  showPassword ? "パスワードを隠す" : "パスワードを表示"
                }
              >
                {showPassword ? (
                  <Eye className="w-6 h-6" aria-hidden="true" />
                ) : (
                  <EyeOff className="w-6 h-6" aria-hidden="true" />
                )}
              </button>
            </div>
            {errors.password && (
              <p className="text-sm text-red-500 mt-1">{errors.password}</p>
            )}
          </div>

          {errors.general && (
            <p className="text-sm text-red-500 text-center">{errors.general}</p>
          )}

          <div className="flex justify-center mt-6">
            <button
              type="submit"
              disabled={pending}
              className="w-[240px] h-[56px] bg-[#3D70CC] text-white text-[18px] font-bold leading-[1.6] rounded-[4px] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {pending ? "ログイン中..." : "ログイン"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
