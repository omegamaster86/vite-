/**
 * アンケート一覧コンテンツコンポーネント
 * searchParamsを使用する部分を分離
 */

"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { Pagination } from "@/app/(admin)/components/Pagination";
import { TableCell } from "@/app/(admin)/components/TableCell";
import { TableHeader } from "@/app/(admin)/components/TableHeader";
import { SurveyActionButtons } from "@/app/(admin)/surveys/_components/SurveyActionButtons";
import type { SurveysContentProps } from "@/types";

export function SurveysContent({
  currentPage,
  surveys,
  total,
  pageSize,
}: SurveysContentProps) {
  const router = useRouter();
  // Server Side Pagination（offset）: surveys はページ分のみ取得済み
  const paginatedSurveys = surveys;
  const handleViewResults = (surveyId: number) => {
    router.push(`/survey-results?id=${String(surveyId)}`);
  };

  const handleEdit = (surveyId: number) => {
    router.push(`/new-survey?id=${String(surveyId)}`);
  };

  return (
    <>
      <div className="bg-white rounded-lg overflow-x-auto">
        <div className="min-w-max">
          <div className="flex items-center gap-3 px-4 h-10 bg-[#F7F7F7]">
            <TableHeader label="サムネイル" width="w-[120px]" />
            <TableHeader label="タイトル" width="w-[264px]" />
            <TableHeader label="所要時間" width="w-[76px]" />
            <TableHeader label="報酬金額" width="w-[76px]" />
            <TableHeader label="回答期限" width="w-[76px]" />
            <TableHeader label="回答数" width="w-[76px]" />
            <TableHeader label="ステータス" width="w-[76px]" />
            <div className="ml-auto w-[236px]" />
          </div>
          <div className="flex flex-col">
            {paginatedSurveys.length === 0 ? (
              <span className="px-4 py-6 text-[13px] font-medium leading-[19.5px]">
                アンケートがありません
              </span>
            ) : (
              paginatedSurveys.map((survey) => (
                <div
                  key={survey.id}
                  className="flex items-center gap-3 px-4 h-20 border-y border-[#E1E1E1]"
                >
                  <div className="w-[120px] h-[60px] overflow-hidden rounded-[4px] bg-[#F7F7F7]">
                    <Image
                      src={survey.thumbnailImageUrl ?? "/thumbnail.svg"}
                      alt={survey.title}
                      width={120}
                      height={60}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <TableCell width="w-[264px]">{survey.title}</TableCell>
                  <TableCell width="w-[76px]">
                    {survey.estimatedMinutes}分
                  </TableCell>
                  <TableCell width="w-[76px]">{survey.rewardYen}円</TableCell>
                  <TableCell width="w-[76px]">{survey.deadline}</TableCell>
                  <TableCell width="w-[76px]">{survey.responseCount}</TableCell>
                  <TableCell width="w-[76px]">{survey.status}</TableCell>
                  <SurveyActionButtons
                    surveyId={survey.id}
                    buttons={[
                      {
                        iconSrc: "/bar_chart.svg",
                        alt: "結果を見る",
                        label: "結果を見る",
                        actionKey: "viewResults",
                        onClick: handleViewResults,
                      },
                      {
                        iconSrc: "/edit.svg",
                        alt: "編集する",
                        label: "編集する",
                        actionKey: "edit",
                        onClick: handleEdit,
                      },
                    ]}
                  />
                </div>
              ))
            )}
          </div>
        </div>
      </div>
      <div className="mt-6">
        <Pagination
          total={total}
          currentPage={currentPage}
          pageSize={pageSize}
        />
      </div>
    </>
  );
}
