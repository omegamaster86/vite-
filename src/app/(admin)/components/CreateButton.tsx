"use client";

import Image from "next/image";
import Link from "next/link";
import type { CreateButtonProps } from "@/types";
import { cn } from "@/utils/class-name";

export function CreateButton({
  onClick,
  href,
  icon,
  label,
  disabled,
}: CreateButtonProps) {
  const baseClassName = cn(
    "flex items-center justify-center gap-1 w-[180px] h-10 bg-[#3D70CC] text-white rounded-[4px] text-sm font-bold hover:bg-[#2d5bb3] transition-colors",
    disabled && "opacity-50 cursor-not-allowed",
  );

  if (href) {
    return (
      <Link href={href} onClick={onClick} className={baseClassName}>
        <Image src={icon} alt={label} width={13} height={13} />
        {label}
      </Link>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(baseClassName, "cursor-pointer")}
      disabled={disabled}
    >
      <Image src={icon} alt={label} width={13} height={13} />
      {label}
    </button>
  );
}
