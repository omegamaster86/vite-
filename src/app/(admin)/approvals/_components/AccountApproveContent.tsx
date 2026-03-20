/**
 * アカウント承認コンテンツコンポーネント
 * タブ切り替えと承認操作はクライアントで管理
 */

"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { Pagination } from "@/app/(admin)/components/Pagination";
import type {
  AccountApprovalUser,
  AccountApproveContentProps,
  ApprovalStatus,
} from "@/types";
import { updateAccountApprovalStatus } from "../_apis/approvals.server";
import { ActionConfirmModal } from "./ActionConfirmModal";
import { ApprovalCard } from "./ApprovalCard";
import { ApprovalTabs } from "./ApprovalTabs";
import { ImagePreviewModal } from "./ImagePreviewModal";

export function AccountApproveContent({
  users,
  currentStatus,
  currentPage,
  total,
  pageSize,
  pendingCount,
}: AccountApproveContentProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentTab = currentStatus;
  const [pendingCountState, setPendingCountState] =
    useState<number>(pendingCount);
  const [approvalStatusById, setApprovalStatusById] = useState<
    Record<string, ApprovalStatus>
  >({});
  const [memoById, setMemoById] = useState<Record<string, string>>(() => {
    return Object.fromEntries(
      users.map((user) => [user.id, user.adminMemo ?? ""]),
    );
  });
  const [actionModal, setActionModal] = useState<{
    targetId: string;
    targetName: string;
    action: "approve" | "reject";
  } | null>(null);
  const [isUpdatingApproval, setIsUpdatingApproval] = useState(false);
  const [actionErrorMessage, setActionErrorMessage] = useState<string | null>(
    null,
  );
  const [activeImage, setActiveImage] = useState<{
    src: string;
    name: string;
  } | null>(null);

  const entriesWithStatus = useMemo(() => {
    return users.map((entry) => {
      const overrideStatus = approvalStatusById[entry.id];
      if (!overrideStatus) {
        return entry;
      }
      return { ...entry, approvalStatus: overrideStatus };
    });
  }, [users, approvalStatusById]);

  const filteredEntries = useMemo(() => {
    return entriesWithStatus.filter(
      (entry) => entry.approvalStatus === currentStatus,
    );
  }, [entriesWithStatus, currentStatus]);

  const handleStatusUpdate = (
    targetId: string,
    status: Exclude<ApprovalStatus, "pending">,
  ) => {
    const currentEntryStatus =
      approvalStatusById[targetId] ??
      users.find((entry) => entry.id === targetId)?.approvalStatus;
    const shouldDecreasePending = currentEntryStatus === "pending";
    if (shouldDecreasePending) {
      setPendingCountState((count) => Math.max(0, count - 1));
    }
    setApprovalStatusById((prev) => ({ ...prev, [targetId]: status }));
  };

  const handleMemoChange = (targetId: string, value: string) => {
    setMemoById((prev) => ({ ...prev, [targetId]: value }));
  };

  const openActionModal = (
    entry: AccountApprovalUser,
    action: "approve" | "reject",
  ) => {
    setActionErrorMessage(null);
    setActionModal({
      targetId: entry.id,
      targetName: entry.displayName,
      action,
    });
  };

  const handleConfirmAction = async () => {
    if (!actionModal) {
      return;
    }

    const nextStatus =
      actionModal.action === "approve" ? "approved" : "rejected";
    setIsUpdatingApproval(true);
    setActionErrorMessage(null);

    try {
      const result = await updateAccountApprovalStatus({
        userId: actionModal.targetId,
        status: nextStatus,
        adminMemo: memoById[actionModal.targetId] ?? "",
      });

      if (!result.success) {
        console.error("Failed to update approval status", result.error);
        setActionErrorMessage(
          "更新に失敗しました。通信環境を確認して、再度お試しください。",
        );
        return;
      }

      handleStatusUpdate(actionModal.targetId, nextStatus);
      setActionModal(null);
    } finally {
      setIsUpdatingApproval(false);
    }
  };

  const openImageModal = (entry: AccountApprovalUser) => {
    setActiveImage({
      src: entry.studentCardImageUrl,
      name: entry.displayName,
    });
  };

  const handleTabChange = (status: ApprovalStatus) => {
    if (status === currentStatus) {
      return;
    }
    const params = new URLSearchParams(searchParams.toString());
    params.set("status", status);
    params.delete("page");
    const queryString = params.toString();
    router.push(queryString ? `?${queryString}` : "?status=pending");
  };

  return (
    <>
      <ApprovalTabs
        currentStatus={currentTab}
        pendingCount={pendingCountState}
        onTabChange={handleTabChange}
      />

      <div className="flex flex-col gap-4">
        {filteredEntries.length === 0 ? (
          <div className="px-6 py-10 text-sm font-medium text-[#7A7A7A] bg-white">
            該当する申請はありません
          </div>
        ) : (
          filteredEntries.map((entry) => (
            <ApprovalCard
              key={entry.id}
              entry={entry}
              memo={memoById[entry.id] ?? ""}
              onMemoChange={handleMemoChange}
              onOpenAction={openActionModal}
              onOpenImage={openImageModal}
            />
          ))
        )}
      </div>

      <div className="mt-6">
        <Pagination
          total={total}
          currentPage={currentPage}
          pageSize={pageSize}
        />
      </div>

      {actionModal ? (
        <ActionConfirmModal
          actionModal={actionModal}
          onClose={() => {
            if (isUpdatingApproval) {
              return;
            }
            setActionErrorMessage(null);
            setActionModal(null);
          }}
          onConfirm={handleConfirmAction}
          isProcessing={isUpdatingApproval}
          errorMessage={actionErrorMessage}
        />
      ) : null}

      {activeImage ? (
        <ImagePreviewModal
          activeImage={activeImage}
          onClose={() => setActiveImage(null)}
        />
      ) : null}
    </>
  );
}
