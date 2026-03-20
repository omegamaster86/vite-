import Image from "next/image";
import type { SurveyActionButtonsProps } from "@/types";

export function SurveyActionButtons({
	surveyId,
	buttons,
}: SurveyActionButtonsProps) {
	return (
		<div className="flex items-center gap-3 ml-auto">
			{buttons?.map((config) => {
				return (
					<button
						key={config.actionKey}
						type="button"
						onClick={() => config.onClick?.(surveyId)}
						className="flex items-center justify-center gap-1 w-[112px] h-8 bg-white border border-[#255ABA] rounded-[50px] text-[12px] font-bold text-[#3D70CC] cursor-pointer"
					>
						<Image
							src={config.iconSrc}
							alt={config.alt}
							width={20}
							height={20}
						/>
						{config.label}
					</button>
				);
			})}
		</div>
	);
}
