/**
 * ページネーションコンポーネント
 * URLベースのページネーションを使用（searchParamsでページ番号を管理）
 */

"use client";

import clsx from "clsx";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useMemo } from "react";
import type { PaginationProps } from "@/types";

export function Pagination({ total, currentPage, pageSize }: PaginationProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const totalPages = Math.ceil(total / pageSize);
  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, total);

  const visiblePages = useMemo(() => {
    const pages: number[] = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      let start = Math.max(1, currentPage - 1);
      const initialEnd = Math.min(totalPages, start + maxVisible - 1);

      if (initialEnd - start < maxVisible - 1) {
        start = Math.max(1, initialEnd - maxVisible + 1);
      }
      const end = Math.min(totalPages, start + maxVisible - 1);

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
    }

    return pages;
  }, [currentPage, totalPages]);

  const createPageUrl = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    if (page === 1) {
      params.delete("page");
    } else {
      params.set("page", page.toString());
    }
    const queryString = params.toString();
    return `${pathname}${queryString ? `?${queryString}` : ""}`;
  };

  if (total === 0) {
    return null;
  }

  return (
    <div className="flex items-center justify-between w-full">
      <div className="text-sm leading-[1.2] text-[#222222]">
        全{total}件中 {startItem}-{endItem}件を表示
      </div>

      <div className="flex items-center gap-2">
        {currentPage === 1 ? (
          <button
            type="button"
            disabled
            className="flex items-center justify-center w-8 h-8 rounded-[2px] border bg-white border-[#E1E1E1] cursor-pointer disabled:cursor-not-allowed opacity-50"
            aria-label="前のページへ"
          >
            <ChevronLeft
              className="w-5 h-5 text-[#222222]"
              aria-hidden="true"
            />
          </button>
        ) : (
          <Link
            href={createPageUrl(currentPage - 1)}
            className="flex items-center justify-center w-8 h-8 rounded-[2px] border bg-white border-[#E1E1E1] hover:bg-gray-50"
            aria-label="前のページへ"
          >
            <ChevronLeft
              className="w-5 h-5 text-[#222222]"
              aria-hidden="true"
            />
          </Link>
        )}

        {visiblePages.map((page) => (
          <Link
            key={page}
            href={createPageUrl(page)}
            className={clsx(
              "flex items-center justify-center w-8 h-8 rounded-[2px] text-sm",
              page === currentPage
                ? "bg-[#3D70CC] text-white font-bold"
                : "bg-white border border-[#E1E1E1] text-[#222222] font-medium hover:bg-gray-50",
            )}
            aria-label={`${page}ページ目`}
            aria-current={page === currentPage ? "page" : undefined}
          >
            {page}
          </Link>
        ))}

        {currentPage === totalPages ? (
          <button
            type="button"
            disabled
            className="flex items-center justify-center w-8 h-8 rounded-[2px] border bg-white border-[#E1E1E1] cursor-pointer disabled:cursor-not-allowed opacity-50"
            aria-label="次のページへ"
          >
            <ChevronRight
              className="w-5 h-5 text-[#222222]"
              aria-hidden="true"
            />
          </button>
        ) : (
          <Link
            href={createPageUrl(currentPage + 1)}
            className="flex items-center justify-center w-8 h-8 rounded-[2px] border bg-white border-[#E1E1E1] hover:bg-gray-50"
            aria-label="次のページへ"
          >
            <ChevronRight
              className="w-5 h-5 text-[#222222]"
              aria-hidden="true"
            />
          </Link>
        )}
      </div>
    </div>
  );
}
