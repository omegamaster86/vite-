/**
 * 管理画面共通レイアウト
 * サイドバーを含む全ての管理ページで使用
 */

import { Suspense } from "react";
import { Sidebar } from "@/app/(admin)/components/Sidebar";

async function AdminAuthedLayout({ children }: { children: React.ReactNode }) {

	return (
		<div className="flex h-screen">
			<Sidebar />
			<main className="flex-1 bg-[#F7F7F7] p-8 h-full overflow-y-auto">
				{children}
			</main>
		</div>
	);
}

export default function AdminGroupLayout({
	children,
}: {
	children: React.ReactNode;
}) {	
	return (
		<Suspense fallback={null}>
			<AdminAuthedLayout>{children}</AdminAuthedLayout>
		</Suspense>
	);
}