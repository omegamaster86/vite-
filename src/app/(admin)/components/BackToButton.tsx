"use client";

import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import type { BackToButtonProps } from "@/types";

export function BackToButton({ href, label }: BackToButtonProps) {
  return (
    <Link href={href} className="flex items-center gap-1 text-sm font-medium">
      <div className="flex items-center justify-center w-5 h-5 rounded-[2px]">
        <ChevronLeft className="w-5 h-5" />
      </div>
      <span>{label}</span>
    </Link>
  );
}
