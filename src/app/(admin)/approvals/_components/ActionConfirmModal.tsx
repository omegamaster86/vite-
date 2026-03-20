"use client";

import Image from "next/image";
import type { ActionConfirmModalProps } from "@/types";
import { cn } from "@/utils/class-name";

export function ActionConfirmModal({
  actionModal,
  onClose,
  onConfirm,
  isProcessing,
  errorMessage,
}: ActionConfirmModalProps) {
  const actionText =
    actionModal.action === "approve"
      ? {
          title: "承認します",
          status: "承認",
          action: "承認する",
          processingAction: "承認中...",
          icon: "/icons/account_check_circle.svg",
          alt: "承認する",
        }
      : {
          title: "却下します",
          status: "却下",
          action: "却下する",
          processingAction: "却下中...",
          icon: "/icons/modal_close.svg",
          alt: "却下する",
        };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
      role="dialog"
      aria-modal="true"
      aria-busy={isProcessing}
      onClick={(event) => {
        if (!isProcessing && event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="w-full max-w-[400px]">
        <div className="flex items-center justify-center h-16 gap-2 bg-[#F7F7F7] rounded-t-[12px]">
          <span className="text-lg font-bold">{actionText.title}</span>
        </div>
        <div className="bg-white border-x border-b border-[#E3E3E3] px-6 py-6">
          <p className="text-base font-medium leading-[1.6]">
            {actionModal.targetName}
            さんのアカウントを
            {actionText.status}
            してよろしいですか？この操作は取り消せません。
          </p>
        </div>
        <div className="bg-white rounded-b-[12px] px-5 py-4">
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={onClose}
              className="text-base font-bold cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isProcessing}
            >
              キャンセル
            </button>
            <button
              type="button"
              onClick={onConfirm}
              disabled={isProcessing}
              className={cn(
                "flex items-center justify-center gap-[10px] w-[180px] h-12 rounded-[4px] text-base font-bold cursor-pointer disabled:cursor-not-allowed disabled:opacity-70",
                actionModal.action === "approve"
                  ? "bg-[#2FAF60] text-white"
                  : "bg-[#F24A17] text-white",
              )}
            >
              {isProcessing ? (
                <span
                  className="h-5 w-5 rounded-full border-2 border-white/70 border-t-white animate-spin"
                  aria-hidden="true"
                />
              ) : (
                <Image
                  src={actionText.icon}
                  alt={actionText.alt}
                  width={24}
                  height={24}
                />
              )}
              {isProcessing ? actionText.processingAction : actionText.action}
            </button>
          </div>
          {errorMessage ? (
            <p className="mt-3 text-sm text-[#F24A17]">{errorMessage}</p>
          ) : null}
        </div>
      </div>
    </div>
  );
}
