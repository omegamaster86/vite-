import type { LabelValueItemProps } from "@/types";
import { cn } from "@/utils/class-name";

export function LabelValueItem({
  label,
  value,
  valueTitle,
  containerClassName = "",
}: LabelValueItemProps) {
  return (
    <div className={cn("flex items-center gap-2", containerClassName)}>
      <div className="flex items-center justify-center gap-[10px] px-2 py-1 min-w-[56px] h-6 bg-[#F1FBFF] rounded-[2px]">
        <span className="text-[10px] font-bold whitespace-nowrap">{label}</span>
      </div>
      <span className="text-base font-bold min-w-0 truncate" title={valueTitle}>
        {value}
      </span>
    </div>
  );
}
