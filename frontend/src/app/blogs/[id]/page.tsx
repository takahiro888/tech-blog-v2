import type { Metadata } from "next";
import { ArticleDetail } from "@/features/blog-detail/components/ArticleDetail";
import { buildArticleMetadata } from "@/features/blog-detail/lib/article-metadata";
import { getArticle } from "@/features/blog-detail/lib/get-article";
import { Breadcrumb } from "@/shared/components/layout/Breadcrumb";
import { SidebarLayout } from "@/shared/components/layout/SidebarLayout";

type BlogDetailPageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({
  params,
}: BlogDetailPageProps): Promise<Metadata> {
  const { id } = await params;
  return buildArticleMetadata(await getArticle(id));
}

export default async function BlogDetailPage({ params }: BlogDetailPageProps) {
  const { id } = await params;
  const blog = await getArticle(id);

  if (!blog) {
    return (
      <SidebarLayout>
        <h1 className="text-2xl font-bold">ブログ記事詳細</h1>
        <p>ブログ記事が見つかりませんでした。</p>
      </SidebarLayout>
    );
  }

  return (
    <>
      <Breadcrumb
        items={[{ label: "HOME", href: "/" }, { label: blog.title }]}
      />
      <SidebarLayout>
        <ArticleDetail blog={blog} />
      </SidebarLayout>
    </>
  );
}
