/**
 * アンケート回答結果コンテンツコンポーネント
 * searchParamsを使用する部分を分離
 */

"use client";

import { Pagination } from "@/app/(admin)/components/Pagination";
import { TableCell } from "@/app/(admin)/components/TableCell";
import { TableHeader } from "@/app/(admin)/components/TableHeader";
import type { SurveyResultsContentProps } from "@/types";
import { formatAnswerDate } from "@/utils/FormatAnswerDate";

export function SurveyResultsContent({
  currentPage,
  surveyResults,
  total,
  pageSize,
  questions,
  minimumInputMinutes,
}: SurveyResultsContentProps) {
  // Server Side Pagination（offset）: surveyResults はページ分のみ取得済み
  const paginatedSurveyResults = surveyResults;
  const formatMinimumInputStatus = (answerDuration: number) => {
    return answerDuration >= minimumInputMinutes ? "⚪︎" : "×";
  };

  return (
    <>
      <div className="bg-white rounded-lg overflow-x-auto">
        <div className="min-w-max">
          <div className="flex items-center gap-3 px-4 h-10 bg-[#F7F7F7]">
            <TableHeader label="回答者名" width="w-[150px]" />
            <TableHeader label="大学名" width="w-[120px]" />
            <TableHeader label="学年" width="w-[120px]" />
            <TableHeader label="学部" width="w-[120px]" />
            <TableHeader label="学科" width="w-[120px]" />
            <TableHeader label="回答日時" width="w-[120px]" />
            <TableHeader label="最低入力時間" width="w-[100px]" />
            {questions.map((q) => (
              <TableHeader
                key={q.questionNumber}
                label={q.questionNumber}
                width="w-[120px]"
              />
            ))}
          </div>
          <div className="flex flex-col">
            {paginatedSurveyResults.length === 0 ? (
              <div className="flex items-center px-4 h-20 border-b border-[#E1E1E1]">
                <p>回答結果がまだありません</p>
              </div>
            ) : (
              paginatedSurveyResults.map((surveyResult) => (
                <div
                  key={surveyResult.id}
                  className="flex items-center gap-3 px-4 h-20 border-y border-[#E1E1E1]"
                >
                  <TableCell width="w-[150px]">{surveyResult.name}</TableCell>
                  <TableCell width="w-[120px]">
                    {surveyResult.university}
                  </TableCell>
                  <TableCell width="w-[120px]">
                    {surveyResult.academicYear}
                  </TableCell>
                  <TableCell width="w-[120px]">
                    {surveyResult.faculty}
                  </TableCell>
                  <TableCell width="w-[120px]">
                    {surveyResult.department}
                  </TableCell>
                  <TableCell width="w-[120px]">
                    {formatAnswerDate(surveyResult.answerDate)}
                  </TableCell>
                  <TableCell width="w-[100px]">
                    {formatMinimumInputStatus(surveyResult.answerDuration)}
                  </TableCell>
                  {questions.map((q) => (
                    <TableCell key={q.questionNumber} width="w-[120px]">
                      {surveyResult.answers[q.questionNumber] ?? ""}
                    </TableCell>
                  ))}
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
