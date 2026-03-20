import { Suspense } from "react";
import { AccountApproveContent } from "@/app/(admin)/approvals/_components/AccountApproveContent";
import { PageLoadingFallback } from "@/app/(admin)/components/PageLoadingFallback";
import type { AccountApprovePageProps } from "@/types";
import { getAccountApprovals } from "./_apis/approvals.server";

const statusOptions = ["pending", "approved", "rejected"] as const;

async function AccountApproveData({
  searchParams,
}: {
  searchParams: Promise<{
    page?: string;
    status?: string;
  }>;
}) {
  const params = await searchParams;
  const rawPage = params.page ? parseInt(params.page, 10) : 1;
  const currentPage = Number.isFinite(rawPage) && rawPage >= 1 ? rawPage : 1;
  const rawStatus = params.status;
  const currentStatus =
    rawStatus &&
    statusOptions.includes(rawStatus as (typeof statusOptions)[number])
      ? (rawStatus as (typeof statusOptions)[number])
      : "pending";
  const pageSize = 10;

  const result = await getAccountApprovals({
    page: currentPage,
    pageSize,
    status: currentStatus,
  });
  return (
    <>
      <AccountApproveContent
        key={`${currentStatus}-${result.page}`}
        users={result.users}
        currentStatus={currentStatus}
        currentPage={result.page}
        total={result.total}
        pageSize={result.pageSize}
        pendingCount={result.pendingCount}
      />
    </>
  );
}

export default async function AccountApprovePage({
  searchParams,
}: AccountApprovePageProps) {
  return (
    <>
      <h1 className="text-[28px] font-bold mb-6">アカウント承認</h1>
      <Suspense fallback={<PageLoadingFallback />}>
        <AccountApproveData searchParams={searchParams} />
      </Suspense>
    </>
  );
}
