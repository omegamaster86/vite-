/**
 * アンケート作成/編集フォームの「公開設定」セクションを表示するコンポーネント。
 *
 * - 公開日/回答期限の入力欄を描画
 * - `pending` に応じて入力を無効化する
 */
import Image from "next/image";
import { useCallback, useMemo, useRef, useState } from "react";
import type { DateTimeFieldProps, PublishSettingsSectionProps } from "@/types";
import {
  formatDateTimeDisplayValue,
  openDateTimePicker,
  toDateTimeLocalValue,
} from "@/utils/dateTimeField";

function DateTimeField({
  id,
  name,
  label,
  pending,
  initialRawValue,
}: DateTimeFieldProps) {
  const hiddenInputRef = useRef<HTMLInputElement | null>(null);
  const [rawValue, setRawValue] = useState(() =>
    initialRawValue ? toDateTimeLocalValue(initialRawValue) : "",
  );

  const displayValue = useMemo(() => {
    return formatDateTimeDisplayValue(rawValue);
  }, [rawValue]);

  const openPicker = useCallback(() => {
    openDateTimePicker(hiddenInputRef.current, pending);
  }, [pending]);

  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className="font-bold">
        {label}
      </label>
      <div className="relative w-[240px]">
        {/* 表示用（プレースホルダーを固定したいので text で描画） */}
        <input
          type="text"
          className="w-[240px] h-12 px-3 pr-10 rounded-[4px] border border-[#E1E1E1]"
          placeholder="yyyy/mm/dd 00:00"
          value={displayValue}
          readOnly
          disabled={pending}
          tabIndex={-1}
          aria-hidden
          onClick={openPicker}
        />

        <Image
          src="/icons/calendar_clock.svg"
          alt=""
          width={15}
          height={15}
          className="absolute right-3 top-1/2 -translate-y-1/2"
        />

        {/* 送信用（ブラウザのカレンダーピッカーを使う） */}
        <input
          ref={hiddenInputRef}
          id={id}
          name={name}
          type="datetime-local"
          className="absolute inset-0 opacity-0 cursor-pointer"
          disabled={pending}
          value={rawValue}
          onChange={(e) => setRawValue(e.target.value)}
          onClick={openPicker}
        />
      </div>
    </div>
  );
}

export function PublishSettingsSection({
  pending,
  initialPublishAt,
  initialDeadline,
  publishAtLabel,
  deadlineLabel,
}: PublishSettingsSectionProps) {
  return (
    <>
      <div className="flex items-center gap-2">
        <div className="w-4 h-2 bg-[#255ABA] rounded-[2px]" />
        <p className="text-[20px] font-bold text-[#255ABA]">公開設定</p>
      </div>

      <div className="bg-white rounded-[12px] p-8 border border-[#E1E1E1]">
        <div className="flex flex-col gap-6">
          <DateTimeField
            id="survey-publish-at"
            name="publishAt"
            label={publishAtLabel}
            pending={pending}
            initialRawValue={initialPublishAt ?? undefined}
          />

          <DateTimeField
            id="survey-deadline"
            name="deadline"
            label={deadlineLabel}
            pending={pending}
            initialRawValue={initialDeadline ?? undefined}
          />
        </div>
      </div>
    </>
  );
}
