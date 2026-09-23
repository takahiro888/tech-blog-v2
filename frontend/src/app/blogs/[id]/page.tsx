import { getBlogDetail } from "@/external/microcms/blogs";
import { Breadcrumb } from "@/shared/components/layout/Breadcrumb";
import { SidebarLayout } from "@/shared/components/layout/SidebarLayout";

export default async function BlogDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const blog = await getBlogDetail(id).catch(() => null);

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
        <article className="prose">
          <h1>{blog.title}</h1>
          <p className="text-sm text-base-content/60">
            {blog.publishedAt.slice(0, 10)}
          </p>
          <div dangerouslySetInnerHTML={{ __html: blog.content }} />
        </article>
      </SidebarLayout>
    </>
  );
}
