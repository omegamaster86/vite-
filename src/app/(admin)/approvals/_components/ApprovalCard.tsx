"use client";

import Image from "next/image";
import type { ApprovalCardProps } from "@/types";
import { formatJstDateTime } from "@/utils/FormatJstDateTime";

const renderInfoRow = (label: string, value: string) => (
  <div className="flex items-center gap-2">
    <div className="min-w-[96px] flex items-center justify-center gap-[10px] px-2 py-1 bg-[#F1FBFF] rounded-sm">
      <span className="text-xs font-medium">{label}</span>
    </div>
    <span className="font-bold">{value}</span>
  </div>
);

export function ApprovalCard({
  entry,
  memo,
  onMemoChange,
  onOpenAction,
  onOpenImage,
}: ApprovalCardProps) {
  const isPending = entry.approvalStatus === "pending";

  return (
    <div className="flex flex-col bg-white border border-[#E1E1E1]">
      <div className="flex items-start gap-6 p-6">
        <button
          type="button"
          onClick={() => onOpenImage(entry)}
          className="flex items-center justify-center w-[510px] h-[360px] bg-[#F7F7F7] border border-[#F7F7F7] rounded-[8px] overflow-hidden cursor-pointer"
        >
          {entry.studentCardImageUrl ? (
            <Image
              src={entry.studentCardImageUrl}
              alt={`${entry.displayName}の学生証`}
              width={510}
              height={340}
              className="object-contain"
            />
          ) : (
            <div className="flex flex-col items-center gap-2 text-[#AAAAAA]">
              <span className="text-sm font-bold">学生証画像</span>
              <span className="text-[13px]">未アップロード</span>
            </div>
          )}
        </button>

        <div className="flex-1 flex flex-col gap-5">
          <span className="text-[13px] font-medium">
            申請日時: {formatJstDateTime(entry.appliedAt)}
          </span>
          <div className="flex flex-col gap-[7px]">
            {renderInfoRow("ユーザーネーム", entry.displayName)}
            {renderInfoRow("大学名", entry.universityName)}
            {renderInfoRow("学年", entry.grade)}
            {renderInfoRow("学部", entry.faculty)}
            {renderInfoRow("学科", entry.department)}
            {renderInfoRow("学生証番号", entry.studentNumber)}
          </div>
          <div className="flex flex-col gap-2">
            <span className="text-sm font-bold">管理者メモ（任意）</span>
            <textarea
              value={memo}
              onChange={(event) => onMemoChange(entry.id, event.target.value)}
              placeholder={isPending ? "承認・却下理由などを記入してください" : ""}
              className="w-full min-h-[80px] border border-[#E1E1E1] rounded-sm px-3 py-2 text-base placeholder:text-[#ACACAC] resize-none disabled:border-none"
              disabled={!isPending}
            />
          </div>
        </div>
      </div>

      {entry.approvalStatus === "pending" ? (
        <div className="flex items-center justify-center gap-16 border-t border-[#E1E1E1] p-6">
          <button
            type="button"
            onClick={() => onOpenAction(entry, "reject")}
            className="flex items-center justify-center gap-2 w-[240px] h-[56px] rounded-sm border border-[#F24A17] text-[#F24A17] text-lg font-bold cursor-pointer"
          >
            <Image
              src="/icons/close.svg"
              alt="却下する"
              width={24}
              height={24}
            />
            却下する
          </button>
          <button
            type="button"
            onClick={() => onOpenAction(entry, "approve")}
            className="flex items-center justify-center gap-2 w-[240px] h-[56px] rounded-sm bg-[#2FAF60] text-white text-lg font-bold cursor-pointer"
          >
            <Image
              src="/icons/account_check_circle.svg"
              alt="承認する"
              width={24}
              height={24}
            />
            承認する
          </button>
        </div>
      ) : null}
    </div>
  );
}
