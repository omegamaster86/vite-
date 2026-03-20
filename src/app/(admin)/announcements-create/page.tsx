/**
 * お知らせ新規作成・編集ページ
 */

import { Suspense } from "react";
import { getAnnouncementEditDetail } from "@/app/(admin)/announcements-create/_apis/announcement-edit.server";
import { AnnouncementCreateEditContent } from "@/app/(admin)/announcements-create/_components/AnnouncementCreateEditContent";
import { BackToButton } from "@/app/(admin)/components/BackToButton";
import { PageLoadingFallback } from "@/app/(admin)/components/PageLoadingFallback";
import { getUniversities } from "@/app/(admin)/new-survey/_apis/universities.server";
import type { AnnouncementCreateEditPageProps } from "@/types";

async function AnnouncementCreateEditData({
  announcementId,
}: {
  announcementId: number | null;
}) {
  const initialData = announcementId
    ? await getAnnouncementEditDetail(announcementId)
    : null;
  const universities = await getUniversities();

  return (
    <AnnouncementCreateEditContent
      initialData={initialData}
      universities={universities}
    />
  );
}

export default async function AnnouncementsCreatePage({
  searchParams,
}: AnnouncementCreateEditPageProps) {
  const params = await searchParams;
  const isEdit = typeof params.id === "string" && params.id.length > 0;
  const title = isEdit ? "お知らせ編集" : "お知らせ新規作成";
  const rawAnnouncementId = isEdit ? Number(params.id) : null;
  const announcementId =
    rawAnnouncementId &&
    Number.isInteger(rawAnnouncementId) &&
    rawAnnouncementId > 0
      ? rawAnnouncementId
      : null;

  return (
    <>
      <div className="mb-6 flex flex-col gap-2">
        <BackToButton href="/announcements" label="お知らせ一覧に戻る" />
        <h1 className="text-[28px] font-bold leading-[42px]">{title}</h1>
      </div>

      <Suspense fallback={<PageLoadingFallback />}>
        <AnnouncementCreateEditData announcementId={announcementId} />
      </Suspense>
    </>
  );
}
