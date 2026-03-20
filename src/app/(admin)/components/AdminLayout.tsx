/**
 * 管理画面共通レイアウトコンポーネント
 * サイドバーとメインコンテンツエリアを含む
 */
import type { ReactNode } from "react";
import { Sidebar } from "@/app/(admin)/components/Sidebar";

interface AdminLayoutProps {
	children: ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
	return (
		<div className="min-h-screen bg-gray-50 dark:bg-gray-900">
			<Sidebar />
			<main className="ml-64 min-h-screen">{children}</main>
		</div>
	);
}
