"use client";

import type { ApprovalStatus, ApprovalTabsProps } from "@/types";
import { cn } from "@/utils/class-name";

const tabOptions: Array<{ key: ApprovalStatus; label: string }> = [
  { key: "pending", label: "承認待ち" },
  { key: "approved", label: "承認済み" },
  { key: "rejected", label: "却下" },
];

export function ApprovalTabs({
  currentStatus,
  pendingCount,
  onTabChange,
}: ApprovalTabsProps) {
  return (
    <div className="flex items-end gap-4 px-10 border-b border-[#3D70CC]">
      {tabOptions.map((tab) => {
        const isActive = tab.key === currentStatus;
        return (
          <button
            key={tab.key}
            type="button"
            onClick={() => onTabChange(tab.key)}
            className={cn(
              "flex items-center justify-center gap-2 w-[180px] h-12 px-4 rounded-t-[12px] text-base font-medium bg-white border border-[#fbfafa] cursor-pointer",
              isActive
                ? "text-[#3D70CC] border-[#3D70CC] border-b-0 font-bold"
                : "text-black",
            )}
          >
            {tab.label}
            {tab.key === "pending" ? (
              <span className="flex items-center justify-center w-5 h-5 text-xs font-bold rounded-full bg-[#3D70CC] text-white">
                {pendingCount}
              </span>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}
