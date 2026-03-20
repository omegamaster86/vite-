/**
 * お知らせ一覧コンテンツコンポーネント
 * searchParamsを使用する部分を分離
 */

"use client";

import Link from "next/link";
import { Pagination } from "@/app/(admin)/components/Pagination";
import { TableCell } from "@/app/(admin)/components/TableCell";
import { TableHeader } from "@/app/(admin)/components/TableHeader";
import type { AnnouncementsContentProps } from "@/types";

export function AnnouncementsContent({
  currentPage,
  announcements,
  total,
  pageSize,
}: AnnouncementsContentProps) {
  // Server Side Pagination（offset）: announcements はページ分のみ取得済み
  const paginatedAnnouncements = announcements;

  return (
    <>
      <div className="bg-white rounded-lg overflow-x-auto">
        <div className="min-w-max">
          <div className="flex items-center gap-3 px-4 h-10 bg-[#F7F7F7]">
            <TableHeader label="お知らせタイトル" width="w-[560px]" />
            <TableHeader label="対象" width="w-[130px]" />
            <TableHeader label="公開日" width="w-[130px]" />
            <TableHeader label="公開終了期日" width="w-[130px]" />
          </div>
          <div className="flex flex-col">
            {paginatedAnnouncements.length === 0 ? (
              <span className="px-4 py-6 text-[13px] font-medium leading-[19.5px]">
                お知らせがありません
              </span>
            ) : (
              paginatedAnnouncements.map((announcement) => (
                <Link
                  key={announcement.id}
                  className="flex items-center gap-3 px-4 h-20 border-y border-[#E1E1E1]"
                  href={`/announcements-create?id=${encodeURIComponent(
                    announcement.id,
                  )}`}
                >
                  <TableCell width="w-[560px]">{announcement.title}</TableCell>
                  <TableCell width="w-[130px]">{announcement.target}</TableCell>
                  <TableCell width="w-[130px]">
                    {announcement.publicationDate}
                  </TableCell>
                  <TableCell width="w-[130px]">
                    {announcement.publicationEndDate}
                  </TableCell>
                </Link>
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
