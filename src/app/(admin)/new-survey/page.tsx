/**
 * アンケート新規作成・編集ページ
 */

import { Suspense } from "react";
import { BackToButton } from "@/app/(admin)/components/BackToButton";
import { PageLoadingFallback } from "@/app/(admin)/components/PageLoadingFallback";
import { getSurveyEditDetail } from "@/app/(admin)/new-survey/_apis/survey-edit.server";
import { getUniversities } from "@/app/(admin)/new-survey/_apis/universities.server";
import { NewSurveyContent } from "@/app/(admin)/new-survey/_components/NewSurveyContent";
import type { NewSurveyPageProps } from "@/types";

async function NewSurveyData({
  questionnaireId,
}: {
  questionnaireId: number | null;
}) {
  const initialData = questionnaireId
    ? await getSurveyEditDetail(questionnaireId)
    : null;
  const universities = await getUniversities();

  return (
    <NewSurveyContent initialData={initialData} universities={universities} />
  );
}

export default async function NewSurveyPage({
  searchParams,
}: NewSurveyPageProps) {
  const params = await searchParams;
  const isEdit = typeof params.id === "string" && params.id.length > 0;
  const title = isEdit ? "アンケート編集" : "アンケート新規作成";
  const rawQuestionnaireId = isEdit ? Number(params.id) : null;
  const questionnaireId =
    rawQuestionnaireId &&
    Number.isInteger(rawQuestionnaireId) &&
    rawQuestionnaireId > 0
      ? rawQuestionnaireId
      : null;

  return (
    <>
      <div className="mb-6 flex flex-col gap-2">
        <BackToButton href="/surveys" label="アンケート一覧に戻る" />
        <h1 className="text-[28px] font-bold leading-[42px]">{title}</h1>
      </div>

      <Suspense fallback={<PageLoadingFallback />}>
        <NewSurveyData questionnaireId={questionnaireId} />
      </Suspense>
    </>
  );
}
