/**
 * お知らせ作成/編集フォームの「通知内容」セクションを表示するコンポーネント。
 *
 * - タイトル/詳細メッセージの入力欄を描画
 * - `pending` に応じて入力/操作を無効化
 */
import type {
  AnnouncementBasicInfoDefaultValues,
} from "@/types";

type AnnouncementBasicInfoSectionProps = {
  pending: boolean;
  defaultValues: AnnouncementBasicInfoDefaultValues;
};

export function AnnouncementBasicInfoSection({
  pending,
  defaultValues,
}: AnnouncementBasicInfoSectionProps) {
  return (
    <>
      <div className="flex items-center gap-2">
        <div className="w-4 h-2 bg-[#255ABA] rounded-[2px]" />
        <p className="text-[20px] font-bold text-[#255ABA]">通知内容</p>
      </div>

      <div className="bg-white rounded-[12px] p-8 border border-[#E1E1E1]">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <label htmlFor="announcement-title" className="text-[14px] font-bold">
              タイトル
            </label>
            <input
              id="announcement-title"
              name="title"
              placeholder="入力してください"
              className="h-12 px-3 rounded-[4px] border border-[#E1E1E1]"
              disabled={pending}
              defaultValue={defaultValues.title}
            />
          </div>

          <div className="flex flex-col gap-2">
            <label
              htmlFor="announcement-description"
              className="text-[14px] font-bold"
            >
              詳細メッセージ
            </label>
            <textarea
              id="announcement-description"
              name="description"
              placeholder="入力してください"
              className="min-h-[160px] p-3 rounded-[4px] border border-[#E1E1E1] resize-y"
              disabled={pending}
              defaultValue={defaultValues.description}
            />
          </div>
        </div>
      </div>
    </>
  );
}
