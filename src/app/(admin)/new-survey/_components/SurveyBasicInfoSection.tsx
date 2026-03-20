/**
 * アンケート作成/編集フォームの「基本情報」セクションを表示するコンポーネント。
 *
 * - タイトル/質問内容/所要時間/謝礼金額/回答期限/対象大学/上限人数/最低回答時間の入力欄を描画
 * - サムネイル画像の選択（クリック）・ドラッグ&ドロップ・プレビュー表示・取消を提供
 * - `pending` に応じて入力/操作を無効化し、アップロードエラーを表示
 *
 * 入力値の保持・アップロード処理そのものは親コンポーネント側が担い、本コンポーネントは UI とイベント受け渡しに責務を限定します。
 */
import Image from "next/image";
import type { SurveyBasicInfoSectionProps } from "@/types";
import { cn } from "@/utils/class-name";

export function SurveyBasicInfoSection({
  fileInputRef,
  thumbnailPreviewUrl,
  onPickThumbnail,
  onThumbnailInputChange,
  onDrop,
  onDragOver,
  onClearThumbnail,
  uploadError,
  pending,
  universities,
  defaultValues,
}: SurveyBasicInfoSectionProps) {
  return (
    <>
      <div className="flex items-center gap-2">
        <div className="w-4 h-2 bg-[#255ABA] rounded-[2px]" />
        <p className="text-[20px] font-bold text-[#255ABA]">基本情報</p>
      </div>

      <div className="bg-white rounded-[12px] p-8 border border-[#E1E1E1]">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <label htmlFor="survey-title" className="text-[14px] font-bold">
              アンケートタイトル
            </label>
            <input
              id="survey-title"
              name="title"
              placeholder="入力してください"
              className="h-12 px-3 rounded-[4px] border border-[#E1E1E1]"
              disabled={pending}
              defaultValue={defaultValues.title}
            />
          </div>

          <div className="flex flex-col gap-2">
            <label
              htmlFor="survey-description"
              className="text-[14px] font-bold"
            >
              質問内容
            </label>
            <textarea
              id="survey-description"
              name="description"
              placeholder="入力してください"
              className="min-h-[160px] p-3 rounded-[4px] border border-[#E1E1E1] resize-y"
              disabled={pending}
              defaultValue={defaultValues.description}
            />
          </div>

          <div className="flex flex-col gap-2 w-[400px]">
            <label htmlFor="survey-thumbnail" className="text-[14px] font-bold">
              サムネイル画像
            </label>

            <input
              ref={fileInputRef}
              id="survey-thumbnail"
              name="thumbnail"
              type="file"
              accept="image/png,image/jpeg"
              onChange={onThumbnailInputChange}
              className="hidden"
              disabled={pending}
            />

            <div
              role="button"
              tabIndex={pending ? -1 : 0}
              aria-disabled={pending}
              onClick={() => {
                if (pending) return;
                onPickThumbnail();
              }}
              onDrop={(e) => {
                if (pending) return;
                onDrop(e);
              }}
              onDragOver={(e) => {
                if (pending) return;
                onDragOver(e);
              }}
              className={cn(
                "w-full aspect-video rounded-[4px] border border-[#E1E1E1] bg-white cursor-pointer",
                thumbnailPreviewUrl
                  ? "relative"
                  : "flex items-center justify-center gap-3",
              )}
            >
              {thumbnailPreviewUrl ? (
                <>
                  <div className="absolute inset-0 overflow-hidden rounded-[4px] pointer-events-none">
                    <Image
                      src={thumbnailPreviewUrl}
                      alt="サムネイルプレビュー"
                      fill
                      className="object-contain"
                    />
                  </div>
                  <button
                    type="button"
                    aria-label="サムネイルを削除"
                    onClick={(e) => {
                      e.stopPropagation();
                      onClearThumbnail();
                    }}
                    className="absolute -top-5 -right-8 z-10 flex size-8 items-center justify-center rounded-[999px] bg-white text-[16px] font-bold leading-none text-[#3D70CC] cursor-pointer"
                    disabled={pending}
                  >
                    ×
                  </button>
                </>
              ) : (
                <div className="flex flex-col items-center gap-4">
                  <Image
                    src="/icons/upload.svg"
                    alt="upload"
                    width={48}
                    height={48}
                  />
                  <div className="flex flex-col">
                    <p className="text-[14px] font-bold">
                      クリックまたはドラッグ&ドロップ
                    </p>
                    <p className="text-[12px] text-[#777777]">
                      PNG, JPG (最大5MB)
                    </p>
                  </div>
                </div>
              )}
            </div>

            {uploadError ? (
              <p className="text-[12px] text-red-600">{uploadError}</p>
            ) : null}
          </div>

          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-2">
              <label htmlFor="survey-estimated-minutes" className="font-bold">
                所要時間
              </label>
              <div className="flex items-center gap-2">
                <input
                  id="survey-estimated-minutes"
                  name="estimatedMinutes"
                  inputMode="numeric"
                  placeholder="10"
                  className="w-[240px] h-12 px-3 rounded-[4px] border border-[#E1E1E1]"
                  disabled={pending}
                  defaultValue={defaultValues.estimatedMinutes}
                />
                <span className="text-[#ACACAC]">分</span>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="survey-reward-yen" className="font-bold">
                謝礼金額
              </label>
              <div className="flex items-center gap-2">
                <input
                  id="survey-reward-yen"
                  name="rewardYen"
                  inputMode="numeric"
                  placeholder="1,000"
                  className="w-[240px] h-12 px-3 rounded-[4px] border border-[#E1E1E1]"
                  disabled={pending}
                  defaultValue={defaultValues.rewardYen}
                />
                <span className="text-[#ACACAC]">円</span>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="survey-target-university" className="font-bold">
                対象大学
              </label>
              <div className="relative w-[240px]">
                <select
                  id="survey-target-university"
                  name="targetUniversity"
                  className="w-[240px] h-12 pr-10 pl-3 rounded-[4px] border border-[#E1E1E1] bg-white appearance-none"
                  disabled={pending}
                  defaultValue={defaultValues.targetUniversity || "東京大学"}
                >
                  <option value="">選択してください</option>
                  {universities.map((uni) => {
                    return (
                      <option key={uni.id} value={uni.name}>
                        {uni.name}
                      </option>
                    );
                  })}
                </select>
                <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2">
                  <Image
                    src="/icons/keyboard_arrow_down.svg"
                    alt="open"
                    width={24}
                    height={24}
                  />
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="survey-reward-limit" className="font-bold">
                報酬付与上限人数
              </label>
              <div className="flex items-center gap-2">
                <input
                  id="survey-reward-limit"
                  name="rewardLimit"
                  inputMode="numeric"
                  placeholder="100"
                  className="w-[240px] h-12 px-3 rounded-[4px] border border-[#E1E1E1]"
                  disabled={pending}
                  defaultValue={defaultValues.rewardLimit}
                />
                <span className="text-[#ACACAC]">人</span>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="survey-time-limit-minutes" className="font-bold">
                最低回答時間
              </label>
              <div className="flex items-center gap-2">
                <input
                  id="survey-time-limit-minutes"
                  name="timeLimitMinutes"
                  inputMode="numeric"
                  placeholder="1"
                  className="w-[240px] h-12 px-3 rounded-[4px] border border-[#E1E1E1]"
                  disabled={pending}
                  defaultValue={defaultValues.timeLimitMinutes}
                />
                <span className="text-[#ACACAC]">分</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
