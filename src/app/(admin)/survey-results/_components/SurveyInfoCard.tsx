import { LabelValueItem } from "@/app/(admin)/components/LabelValueItem";
import type { SurveyInfoCardProps } from "@/types";

export function SurveyInfoCard({ survey }: SurveyInfoCardProps) {
  return (
    <div className="flex flex-col gap-2 w-full min-w-0">
      {/* タイトル */}
      <LabelValueItem
        label="タイトル"
        value={survey.title}
        valueTitle={survey.title}
        containerClassName="h-6 min-w-0 w-full"
      />

      {/* 所要時間と報酬金額 */}
      <div className="flex gap-1">
        <LabelValueItem
          label="所要時間"
          value={`${survey.estimatedMinutes}分`}
          containerClassName="w-40"
        />
        <LabelValueItem
          label="報酬金額"
          value={`${survey.rewardYen}円`}
          containerClassName="w-40"
        />
      </div>

      {/* 回答数と回答期限 */}
      <div className="flex gap-1">
        <LabelValueItem
          label="回答数"
          value={survey.responseCount}
          containerClassName="w-40"
        />
        <LabelValueItem
          label="回答期限"
          value={survey.deadline}
          // labelClassName="whitespace-nowrap"
          containerClassName="w-40"
        />
      </div>
    </div>
  );
}
