import type { ReactNode } from "react";
import type { Blog } from "@/external/microcms/types";
import { getBlogList } from "@/external/microcms/blogs";
import { Sidebar } from "@/features/sidebar/components/Sidebar";

type SidebarLayoutProps = {
  children: ReactNode;
  searchKeyword?: string;
  articles?: Blog[]; //呼び出し側で既に記事一覧を取得済みの場合はここに渡す（二重取得を避ける）
};

export async function SidebarLayout({
  children,
  searchKeyword,
  articles,
}: SidebarLayoutProps) {
  const sidebarArticles = articles ?? (await getBlogList()).contents;

  return (
    <div className="mx-auto grid w-full max-w-6xl gap-16 px-4 py-10 lg:grid-cols-[1fr_270px]">
      <main>{children}</main>
      <Sidebar articles={sidebarArticles} searchKeyword={searchKeyword} />
    </div>
  );
}
