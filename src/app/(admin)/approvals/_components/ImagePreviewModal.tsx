"use client";

import Image from "next/image";
import type { ImagePreviewModalProps } from "@/types";

export function ImagePreviewModal({
  activeImage,
  onClose,
}: ImagePreviewModalProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
      role="dialog"
      aria-modal="true"
      onClick={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="bg-white rounded-[6px] p-6 max-w-[640px] w-full">
        <div className="flex items-center justify-between mb-4">
          <span className="text-base font-bold">
            {activeImage.name}の学生証
          </span>
          <button
            type="button"
            onClick={onClose}
            className="text-sm font-bold text-[#7A7A7A] cursor-pointer"
          >
            閉じる
          </button>
        </div>
        <div className="w-full bg-[#F7F7F7] rounded-sm overflow-hidden flex items-center justify-center">
          <Image
            src={activeImage.src}
            alt={`${activeImage.name}の学生証`}
            width={600}
            height={400}
            className="object-contain"
          />
        </div>
      </div>
    </div>
  );
}
