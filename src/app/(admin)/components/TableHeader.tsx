import type { TableHeaderProps } from "@/types";
import { cn } from "@/utils/class-name";

export function TableHeader({ label, width }: TableHeaderProps) {
  return (
    <div className={cn(width, "text-[13px] font-bold leading-[19.5px]")}>
      {label}
    </div>
  );
}
