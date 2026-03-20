/**
 * アンケート一覧ページ
 */

import { Suspense } from "react";
import { CreateButton } from "@/app/(admin)/components/CreateButton";
import { PageLoadingFallback } from "@/app/(admin)/components/PageLoadingFallback";
import { getSurveysResults } from "@/app/(admin)/surveys/_apis/surveys.server";
import { SurveysContent } from "@/app/(admin)/surveys/_components/SurveysContent";
import type { SurveysPageProps } from "@/types";

async function SurveysData({
  searchParams,
}: {
  searchParams: Promise<{
    page?: string;
  }>;
}) {
  const params = await searchParams;
  const rawPage = params.page ? parseInt(params.page, 10) : 1;
  const currentPage = Number.isFinite(rawPage) && rawPage >= 1 ? rawPage : 1;
  const pageSize = 10;

  const result = await getSurveysResults({ page: currentPage, pageSize });

  return (
    <SurveysContent
      currentPage={currentPage}
      surveys={result.surveys}
      total={result.total}
      pageSize={pageSize}
    />
  );
}

export default async function SurveysPage({ searchParams }: SurveysPageProps) {
  return (
    <>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-[28px] font-bold leading-[42px] text-[#222222]">
          アンケート一覧
        </h1>
        <CreateButton href="/new-survey" icon="/add.svg" label="新規作成" />
      </div>

      <Suspense fallback={<PageLoadingFallback />}>
        <SurveysData searchParams={searchParams} />
      </Suspense>
    </>
  );
}
