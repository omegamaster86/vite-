/**
 * 管理画面共通サイドバーコンポーネント
 * ロゴとナビゲーションメニューを表示
 */
import Image from "next/image";
import { LogoutButton } from "./LogoutButton";
import { SidebarItem } from "./SidebarItem";

const navItems = [
  {
    href: "/surveys",
    iconKey: "format_list_bulleted",
    label: "アンケート一覧",
  },
  {
    href: "/students",
    iconKey: "person",
    label: "学生一覧",
  },
  {
    href: "/approvals",
    iconKey: "check_circle",
    label: "アカウント承認",
  },
  {
    href: "/announcements",
    iconKey: "notification_settings",
    label: "お知らせ",
  },
];

export function Sidebar() {
  return (
    <aside className="h-screen w-64 bg-white border-r border-gray-200 flex flex-col">
      <div className="flex h-16 items-center justify-center px-4 mb-4">
        <Image
          src="/logo.svg"
          alt="カルぺ・ディエム"
          width={160}
          height={38}
          priority
        />
      </div>
      <p className="text-sm font-bold text-center">アンケート管理システム</p>

      <nav className="flex flex-col gap-1 p-4 mt-16 flex-1">
        {navItems.map((item) => (
          <SidebarItem
            key={item.href}
            href={item.href}
            iconKey={item.iconKey}
            label={item.label}
          />
        ))}
      </nav>

      <div className="p-4 mt-auto">
        <LogoutButton />
      </div>
    </aside>
  );
}