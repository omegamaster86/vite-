"use client";

import type { TableCellProps } from "@/types";

export function TableCell({ width, children, maxLines = 2 }: TableCellProps) {
  const isSingleLine = maxLines <= 1;
  const title =
    typeof children === "string" || typeof children === "number"
      ? String(children)
      : undefined;

  return (
    <div
      className={[
        width,
        "flex-none min-w-0 overflow-hidden text-[13px] font-medium leading-[19.5px]",
      ].join(" ")}
      style={
        isSingleLine
          ? undefined
          : {
              display: "-webkit-box",
              WebkitBoxOrient: "vertical",
              WebkitLineClamp: maxLines,
            }
      }
      title={title}
    >
      {children}
    </div>
  );
}
