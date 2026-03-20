/**
 * お知らせ一覧ページ
 */

import { Suspense } from "react";
import { getAnnouncements } from "@/app/(admin)/announcements/_apis/announcements.server";
import { AnnouncementsContent } from "@/app/(admin)/announcements/_components/AnnouncementsContent";
import { CreateButton } from "@/app/(admin)/components/CreateButton";
import { PageLoadingFallback } from "@/app/(admin)/components/PageLoadingFallback";
import type { AnnouncementsPageProps } from "@/types";

async function AnnouncementsWithParams({
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
  const result = await getAnnouncements({ page: currentPage, pageSize });

  return (
    <AnnouncementsContent
      currentPage={currentPage}
      announcements={result.announcements}
      total={result.total}
      pageSize={pageSize}
    />
  );
}

export default async function AnnouncementsPage({
  searchParams,
}: AnnouncementsPageProps) {
  return (
    <>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-[28px] font-bold leading-[42px] text-[#222222]">
          お知らせ一覧
        </h1>
        <CreateButton href="/announcements-create" icon="/add.svg" label="新規作成" />
      </div>

      <Suspense fallback={<PageLoadingFallback />}>
        <AnnouncementsWithParams searchParams={searchParams} />
      </Suspense>
    </>
  );
}
