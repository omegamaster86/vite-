/**
 * サイドバーの各ナビゲーション項目コンポーネント
 * 現在のパスに基づいてアクティブ状態を表示
 */
"use client";

import { clsx } from "clsx";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { SidebarItemProps } from "@/types";

export function SidebarItem({ href, iconKey, label }: SidebarItemProps) {
  const pathname = usePathname();
  const isActive = pathname.startsWith(href);
  const iconSrc = `/icons/${iconKey}${isActive ? "_active" : ""}.svg`;

  return (
    <Link
      href={href}
      className={clsx(
        "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors",
        isActive ? "bg-[#F1FBFF] text-[#3D70CC]" : "text-gray-700",
      )}
    >
      <span className="w-5 h-5 shrink-0">
        <Image
          src={iconSrc}
          alt={label}
          width={20}
          height={20}
          className="w-5 h-5"
        />
      </span>
      <span>{label}</span>
    </Link>
  );
}
