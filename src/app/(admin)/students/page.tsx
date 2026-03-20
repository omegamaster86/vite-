import { Suspense } from "react";
import { PageLoadingFallback } from "@/app/(admin)/components/PageLoadingFallback";
import { getMonthlyRewardTotal } from "@/app/(admin)/students/_apis/monthly-reward.server";
import { getStudents } from "@/app/(admin)/students/_apis/students.server";
import { StudentsContent } from "@/app/(admin)/students/_components/StudentsContent";
import type { StudentsPageProps } from "@/types";

async function StudentsData({
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

  const now = new Date();
  const lastMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const lastMonthYear = lastMonthDate.getFullYear();
  const lastMonth = lastMonthDate.getMonth() + 1;
  const [result, lastMonthTotalAmount] = await Promise.all([
    getStudents({
      page: currentPage,
      pageSize,
      year: lastMonthYear,
      month: lastMonth,
    }),
    getMonthlyRewardTotal({
      year: lastMonthYear,
      month: lastMonth,
    }),
  ]);

  return (
    <StudentsContent
      currentPage={currentPage}
      students={result.students}
      total={result.total}
      pageSize={pageSize}
      lastMonthTotalAmount={lastMonthTotalAmount}
    />
  );
}

export default async function StudentsPage({
  searchParams,
}: StudentsPageProps) {
  return (
    <>
      <h1 className="text-[28px] font-bold mb-6">学生一覧</h1>
      <Suspense fallback={<PageLoadingFallback />}>
        <StudentsData searchParams={searchParams} />
      </Suspense>
    </>
  );
}
