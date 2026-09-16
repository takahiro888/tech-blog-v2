import { getBlogDetail } from "@/external/microcms/blogs";

export default async function BlogDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const blog = await getBlogDetail(id).catch(() => null);

  if (!blog) {
    return (
      <div className="flex flex-col flex-1 gap-6 p-8">
        <h1 className="text-2xl font-bold">ブログ記事詳細</h1>
        <p>ブログ記事が見つかりませんでした。</p>
      </div>
    );
  }

  return (
    <article className="prose mx-auto p-8">
      <h1>{blog.title}</h1>
      <p className="text-sm text-base-content/60">
        {blog.publishedAt.slice(0, 10)}
      </p>
      <div dangerouslySetInnerHTML={{ __html: blog.content }} />
    </article>
  );
}
