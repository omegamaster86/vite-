import Image from "next/image";
import type { SurveyInfoCardProps } from "@/types";

export function SurveyBanner({ survey }: SurveyInfoCardProps) {
  return (
    <div className="flex items-center gap-[5.58px] bg-[#DCF2FF] rounded-[2px] w-auto">
      <div className="relative w-[192.5px] h-[88px] rounded-[2px]">
        <Image
          src={survey.thumbnailImageUrl}
          alt={survey.title}
          fill
          className="object-cover"
        />
      </div>
    </div>
  );
}
