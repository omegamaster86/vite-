import type { AuthError, Session, User } from "@supabase/supabase-js";
import { cache } from "react";
import { createClient } from "@/services/supabase/server";

type AuthenticatedSessionSuccess = {
  errorCode: null;
  user: User;
  session: Session;
  userError: null;
};

type AuthenticatedSessionFailure = {
  errorCode: "unauthorized" | "session_not_found";
  user: User | null;
  session: null;
  userError: AuthError | null;
};

export type AuthenticatedSessionResult =
  | AuthenticatedSessionSuccess
  | AuthenticatedSessionFailure;

const getCachedAuthenticatedSession = cache(
  async (): Promise<AuthenticatedSessionResult> => {
    const supabase = await createClient();

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return {
        errorCode: "unauthorized",
        user: null,
        session: null,
        userError: userError ?? null,
      };
    }

    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return {
        errorCode: "session_not_found",
        user,
        session: null,
        userError: null,
      };
    }

    return {
      errorCode: null,
      user,
      session,
      userError: null,
    };
  },
);

export async function getAuthenticatedSession(): Promise<AuthenticatedSessionResult> {
  return getCachedAuthenticatedSession();
}
