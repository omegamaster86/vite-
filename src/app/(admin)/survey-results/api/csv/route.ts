import { NextResponse } from "next/server";
import { createLogger } from "@/services/logger";
import { createClient } from "@/services/supabase/server";

export async function GET(request: Request) {
  const logger = createLogger("survey-results/api/csv");
  const url = new URL(request.url);
  const questionnaireIdParam = url.searchParams.get("questionnaireId");
  const questionnaireId = questionnaireIdParam
    ? Number.parseInt(questionnaireIdParam, 10)
    : NaN;

  logger.start({
    action: "request",
    method: "GET",
    path: url.pathname,
    questionnaireId: questionnaireIdParam ?? null,
  });

  if (!Number.isFinite(questionnaireId) || questionnaireId <= 0) {
    logger.warn("invalid_query", { questionnaireId: questionnaireIdParam });
    logger.end({ success: false, errorMessage: "Bad Request" });
    return NextResponse.json(
      { error: "questionnaireId is required" },
      { status: 400 },
    );
  }

  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      logger.warn("unauthorized", { hasUser: Boolean(user), userError });
      logger.end({ success: false, errorMessage: "Unauthorized" });
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      logger.warn("session_not_found", { userId: user.id });
      logger.end({ success: false, errorMessage: "Unauthorized" });
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    if (!supabaseUrl) {
      logger.error(new Error("NEXT_PUBLIC_SUPABASE_URL is not set"));
      logger.end({ success: false, errorMessage: "config_error" });
      return NextResponse.json(
        { error: "Server configuration error" },
        { status: 500 },
      );
    }

    const response = await fetch(
      `${supabaseUrl}/functions/v1/get-survey-detail-answers-csv-for-admin?questionnaireId=${questionnaireId}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      },
    );

    if (!response.ok) {
      logger.warn("edge_function_error", {
        status: response.status,
        statusText: response.statusText,
      });
      logger.end({ success: false, errorMessage: "edge_function_error" });
      return NextResponse.json(
        { error: "CSV download failed" },
        { status: response.status },
      );
    }

    const contentType =
      response.headers.get("Content-Type") ?? "text/csv; charset=utf-8";
    const contentDisposition =
      response.headers.get("Content-Disposition") ??
      `attachment; filename="survey-results-${questionnaireId}.csv"`;

    logger.info("response_success", { questionnaireId });
    logger.end({ success: true });

    return new NextResponse(response.body, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": contentDisposition,
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    logger.error(error, { action: "unhandled_exception" });
    logger.end({
      success: false,
      errorMessage: error instanceof Error ? error.message : String(error),
    });
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
