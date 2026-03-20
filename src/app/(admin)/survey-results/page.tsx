/**
 * アンケート回答結果ページ
 */

import { Suspense } from "react";
import { BackToButton } from "@/app/(admin)/components/BackToButton";
import { PageLoadingFallback } from "@/app/(admin)/components/PageLoadingFallback";
import { SurveyBanner } from "@/app/(admin)/survey-results/_components/SurveyBanner";
import { SurveyResultsCsvButton } from "@/app/(admin)/survey-results/_components/SurveyResultsCsvButton";
import { SurveyInfoCard } from "@/app/(admin)/survey-results/_components/SurveyInfoCard";
import { SurveyResultsContent } from "@/app/(admin)/survey-results/_components/SurveyResultsContent";
import type { SurveyDetails, SurveyResultsPageProps } from "@/types";
import {
  getSurveyDetailAnswers,
  getSurveyResultsMeta,
} from "./_apis/survey-results.server";

async function SurveyResultsData({
  searchParams,
}: {
  searchParams: Promise<{
    page?: string;
    id?: string;
  }>;
}) {
  const params = await searchParams;
  const questionnaireId = Number(params.id);
  const hasValidId = Number.isFinite(questionnaireId) && questionnaireId > 0;

  const surveyDetails: SurveyDetails | null = hasValidId
    ? await getSurveyResultsMeta({ questionnaireId })
    : null;

  const rawPage = params.page ? parseInt(params.page, 10) : 1;
  const currentPage = Number.isFinite(rawPage) && rawPage >= 1 ? rawPage : 1;
  const pageSize = 10;
  const surveyResultsResponse = hasValidId
    ? await getSurveyDetailAnswers({
        questionnaireId,
        page: currentPage,
        pageSize,
      })
    : {
        surveyResults: [],
        total: 0,
        page: currentPage,
        pageSize,
      };

  return (
    <>
      <div className="mb-6 flex items-center gap-4 p-6 bg-white rounded-[2px] w-fit">
        {surveyDetails ? (
          <>
            <SurveyBanner survey={surveyDetails} />
            <SurveyInfoCard survey={surveyDetails} />
          </>
        ) : null}
      </div>

      <SurveyResultsContent
        currentPage={surveyResultsResponse.page}
        surveyResults={surveyResultsResponse.surveyResults}
        total={surveyResultsResponse.total}
        pageSize={surveyResultsResponse.pageSize}
        questions={surveyDetails?.questions ?? []}
        minimumInputMinutes={surveyDetails?.minimumInputMinutes ?? 0}
      />
    </>
  );
}

export default async function SurveysPage({
  searchParams,
}: SurveyResultsPageProps) {
  return (
    <>
      <div className="mb-6 flex items-start justify-between gap-2">
        <div className="flex flex-col gap-2">
          <BackToButton href="/surveys" label="アンケート一覧に戻る" />
          <h1 className="text-[28px] font-bold leading-[42px]">
            アンケート回答結果
          </h1>
        </div>
        <SurveyResultsCsvButton />
      </div>

      <Suspense fallback={<PageLoadingFallback />}>
        <SurveyResultsData searchParams={searchParams} />
      </Suspense>
    </>
  );
}