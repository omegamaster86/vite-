"use client";

import { LogOut } from "lucide-react";
import { useFormStatus } from "react-dom";
import { logout } from "../_actions/logout";

function LogoutSubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full rounded-lg p-2 inline-flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending ? (
        <span
          className="h-4 w-4 rounded-full border-2 border-current border-t-transparent animate-spin"
          aria-hidden="true"
        />
      ) : (
        <LogOut size={18} aria-hidden="true" />
      )}
      {pending ? "ログアウト中..." : "Logout"}
    </button>
  );
}

export function LogoutButton() {
  return (
    <form action={logout} className="w-full">
      <LogoutSubmitButton />
    </form>
  );
}
