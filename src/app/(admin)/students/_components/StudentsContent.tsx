/**
 * 学生一覧コンテンツコンポーネント
 * searchParamsを使用する部分を分離
 */

"use client";

import { Pagination } from "@/app/(admin)/components/Pagination";
import { TableCell } from "@/app/(admin)/components/TableCell";
import { TableHeader } from "@/app/(admin)/components/TableHeader";
import type { StudentsContentProps } from "@/types";

export function StudentsContent({
  currentPage,
  students,
  total,
  pageSize,
  lastMonthTotalAmount,
}: StudentsContentProps) {
  // Server Side Pagination（offset）: students はページ分のみ取得済み
  const paginatedStudents = students;

  return (
    <>
      <div className="overflow-x-auto">
        <div className="flex items-center font-bold gap-1 px-3 py-1 h-12 w-fit rounded-[5px] bg-white">
          <span className="text-[14px]">先月合計獲得金額：</span>
          <span className="text-[20px]">
            {lastMonthTotalAmount.toLocaleString()}円
          </span>
        </div>
        <div className="min-w-max bg-white">
          <div className="flex items-center gap-3 px-4 h-10 bg-[#F7F7F7]">
            <TableHeader label="ユーザーネーム" width="w-[150px]" />
            <TableHeader label="大学名" width="w-[90px]" />
            <TableHeader label="学年" width="w-[80px]" />
            <TableHeader label="学部名" width="w-[170px]" />
            <TableHeader label="学科名" width="w-[170px]" />
            <TableHeader label="先月アンケート回答数" width="w-[150px]" />
            <TableHeader label="先月獲得金額" width="w-[150px]" />
          </div>
          <div className="flex flex-col">
            {paginatedStudents.length === 0 ? (
              <span className="px-4 py-6 text-[13px] font-medium leading-[19.5px]">
                アンケートに回答した学生がいません
              </span>
            ) : (
              paginatedStudents.map((student) => (
                <div
                  key={student.id}
                  className="flex items-center gap-3 px-4 h-20 border-y border-[#E1E1E1]"
                >
                  <TableCell width="w-[150px]">{student.name}</TableCell>
                  <TableCell width="w-[90px]">
                    {student.universityName}
                  </TableCell>
                  <TableCell width="w-[80px]">{student.academicYear}</TableCell>
                  <TableCell width="w-[170px]">{student.facultyName}</TableCell>
                  <TableCell width="w-[170px]">
                    {student.departmentName}
                  </TableCell>
                  <TableCell width="w-[150px]">
                    {student.surveyResponseCount}
                  </TableCell>
                  <TableCell width="w-[150px]">
                    {student.estimatedMonthlyAmount.toLocaleString()}円
                  </TableCell>
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
