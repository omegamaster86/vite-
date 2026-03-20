/**
 * お知らせ新規作成、編集コンテンツコンポーネント
 * searchParamsを使用する部分を分離
 */

"use client";

import { useActionState, useMemo, useRef } from "react";
import { saveAnnouncementDraft } from "@/app/(admin)/announcements-create/_apis/announcement-save.server";
import { AnnouncementBasicInfoSection } from "@/app/(admin)/announcements-create/_components/AnnouncementBasicInfoSection";
import { AnnouncementPublishSettingsSection } from "@/app/(admin)/announcements-create/_components/AnnouncementPublishSettingsSection";
import { FormActions } from "@/app/(admin)/components/FormActions";
import type {
  AnnouncementCreateEditContentProps,
  SaveSurveyDraftState,
} from "@/types";
import {
  getDefaultDeadline,
  getDefaultPublishAt,
} from "@/utils/publishSettingsDefaults";

export function AnnouncementCreateEditContent({
  initialData,
  universities,
}: AnnouncementCreateEditContentProps) {
  const formRef = useRef<HTMLFormElement | null>(null);
  const initialState: SaveSurveyDraftState = useMemo(
    () => ({
      success: false,
      messages: [],
    }),
    [],
  );

  const [state, formAction, pending] = useActionState(
    saveAnnouncementDraft,
    initialState,
  );

  const initialPublishAt = useMemo(() => {
    return getDefaultPublishAt(initialData?.publishAt);
  }, [initialData?.publishAt]);

  const initialDeadline = useMemo(() => {
    return getDefaultDeadline(initialData?.deadline);
  }, [initialData?.deadline]);

  return (
    <form ref={formRef} action={formAction} className="flex flex-col gap-6">
      {initialData?.id ? (
        <input
          type="hidden"
          name="announcementId"
          value={String(initialData.id)}
        />
      ) : null}

      <AnnouncementBasicInfoSection
        pending={pending}
        defaultValues={{
          title: initialData?.title ?? "",
          description: initialData?.description ?? "",
        }}
      />

      <AnnouncementPublishSettingsSection
        pending={pending}
        initialPublishAt={initialPublishAt}
        initialDeadline={initialDeadline}
        publishAtLabel="公開日時"
        deadlineLabel="公開終了期日"
        universities={universities}
        targetUniversityDefaultValue={initialData?.targetAudience ?? ""}
      />

      <FormActions
        pending={pending}
        state={state}
        secondaryAction={
          <button
            type="button"
            disabled={pending}
            className="w-[160px] h-10 px-6 rounded-[2px] bg-white font-bold cursor-pointer disabled:opacity-50"
            onClick={() => formRef.current?.reset()}
          >
            キャンセル
          </button>
        }
      />
    </form>
  );
}
