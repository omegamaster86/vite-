/**
 * アンケート新規作成、編集コンテンツコンポーネント
 * searchParamsを使用する部分を分離
 */

"use client";

import type { ChangeEvent, DragEvent } from "react";
import {
  useActionState,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { FormActions } from "@/app/(admin)/components/FormActions";
import { PublishSettingsSection } from "@/app/(admin)/components/PublishSettingsSection";
import { saveSurveyDraft } from "@/app/(admin)/new-survey/_actions/survey";
import { SurveyBasicInfoSection } from "@/app/(admin)/new-survey/_components/SurveyBasicInfoSection";
import { SurveyQuestionsSection } from "@/app/(admin)/new-survey/_components/SurveyQuestionsSection";
import type { NewSurveyContentProps, SaveSurveyDraftState } from "@/types";
import {
  getDefaultDeadline,
  getDefaultPublishAt,
} from "@/utils/publishSettingsDefaults";

function toOptionalString(v: unknown): string | undefined {
  if (v == null) return undefined;
  const s = String(v);
  return s.length > 0 ? s : undefined;
}

export function NewSurveyContent({
  initialData,
  universities,
}: NewSurveyContentProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const currentThumbnailRef = useRef<HTMLInputElement | null>(null);
  const selectedThumbnailRef = useRef<File | null>(null);
  const [thumbnailPreviewUrl, setThumbnailPreviewUrl] = useState<string | null>(
    initialData?.thumbnailImageUrl ?? null,
  );

  const initialState: SaveSurveyDraftState = useMemo(
    () => ({
      success: false,
      messages: [],
      thumbnailPath: null,
    }),
    [],
  );

  const [state, formAction, pending] = useActionState(
    saveSurveyDraft,
    initialState,
  );

  const handlePickThumbnail = () => {
    fileInputRef.current?.click();
  };

  const setFileWithPreview = useCallback((file: File | null) => {
    selectedThumbnailRef.current = file;
    setThumbnailPreviewUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return file ? URL.createObjectURL(file) : null;
    });
  }, []);

  const handleThumbnailInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    if (!file) return;
    setFileWithPreview(file);
  };

  const handleDrop = (e: DragEvent<HTMLElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0] ?? null;
    if (!file) return;
    if (fileInputRef.current) {
      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(file);
      fileInputRef.current.files = dataTransfer.files;
    }
    setFileWithPreview(file);
  };

  const handleDragOver = (e: DragEvent<HTMLElement>) => {
    e.preventDefault();
  };

  const handleClearThumbnail = useCallback(() => {
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    if (currentThumbnailRef.current) {
      currentThumbnailRef.current.value = "";
    }
    setFileWithPreview(null);
  }, [setFileWithPreview]);

  const handleSubmit = useCallback(() => {
    const selectedThumbnail = selectedThumbnailRef.current;
    const fileInput = fileInputRef.current;

    if (!selectedThumbnail || !fileInput) return;
    if (fileInput.files && fileInput.files.length > 0) return;

    const dataTransfer = new DataTransfer();
    dataTransfer.items.add(selectedThumbnail);
    fileInput.files = dataTransfer.files;
  }, []);

  // フォーム送信エラー時にfile inputの状態を同期
  useEffect(() => {
    if (state.error !== "VALIDATION_ERROR") return;

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    if (currentThumbnailRef.current) {
      currentThumbnailRef.current.value = "";
    }
    setFileWithPreview(null);
  }, [state, setFileWithPreview]);

  const initialPublishAt = useMemo(() => {
    return getDefaultPublishAt(initialData?.publishAt);
  }, [initialData?.publishAt]);

  const initialDeadline = useMemo(() => {
    return getDefaultDeadline(initialData?.deadline);
  }, [initialData?.deadline]);

  return (
    <form
      action={formAction}
      onSubmit={handleSubmit}
      className="flex flex-col gap-6"
    >
      <input
        type="hidden"
        name="questionnaireId"
        value={initialData?.id ? String(initialData.id) : ""}
      />
      <input
        ref={currentThumbnailRef}
        type="hidden"
        name="currentThumbnailUrl"
        defaultValue={initialData?.thumbnailImageUrl ?? ""}
      />
      <SurveyBasicInfoSection
        fileInputRef={fileInputRef}
        thumbnailPreviewUrl={thumbnailPreviewUrl}
        onPickThumbnail={handlePickThumbnail}
        onThumbnailInputChange={handleThumbnailInputChange}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onClearThumbnail={handleClearThumbnail}
        uploadError={state.fieldErrors?.thumbnail?.[0] ?? null}
        pending={pending}
        universities={universities}
        defaultValues={{
          title: initialData?.title ?? "",
          description: initialData?.description ?? "",
          estimatedMinutes:
            toOptionalString(initialData?.estimatedMinutes) ?? "",
          rewardYen: toOptionalString(initialData?.rewardYen) ?? "",
          targetUniversity: initialData?.targetAudience ?? "",
          rewardLimit: toOptionalString(initialData?.rewardLimit) ?? "",
          timeLimitMinutes:
            toOptionalString(initialData?.timeLimitMinutes) ?? "",
        }}
      />

      <SurveyQuestionsSection
        pending={pending}
        initialQuestions={initialData?.questions ?? null}
      />

      <PublishSettingsSection
        pending={pending}
        initialPublishAt={initialPublishAt}
        initialDeadline={initialDeadline}
        publishAtLabel="公開日"
        deadlineLabel="回答期限"
      />

      <FormActions pending={pending} state={state} />
    </form>
  );
}
