import { getBlogDetail } from "@/external/microcms/blogs";
import { Breadcrumb } from "@/shared/components/layout/Breadcrumb";
import { SidebarLayout } from "@/shared/components/layout/SidebarLayout";
import { RichText } from "@/shared/components/RichText";
import Image from "next/image";
import Link from "next/link";
import { formatPublishedDate } from "@/shared/lib/published-at";

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
        <article>
          {blog.eyecatch && (
            <Image
              src={blog.eyecatch.url}
              width={blog.eyecatch.width}
              height={blog.eyecatch.height}
              alt=""
              preload
              sizes="(min-width: 1024px) 640px, 100vw"
              className="mb-8 w-full rounded-md shadow"
            />
          )}

          <h1 className="text-3xl font-bold">{blog.title}</h1>

          {blog.categories && blog.categories.length > 0 && (
            <ul className="mt-4 flex flex-wrap gap-2">
              {blog.categories.map((c) => (
                <li key={c}>
                  <Link
                    href={`/?category=${encodeURIComponent(c)}`}
                    className="rounded border border-orange-600 px-2 py-0.5 text-sm text-orange-600 hover:bg-orange-50"
                  >
                    {c}
                  </Link>
                </li>
              ))}
            </ul>
          )}

          <time
            dateTime={blog.publishedAt}
            className="mt-2 block text-sm text-base-content/60"
          >
            {formatPublishedDate(blog.publishedAt)}
          </time>

          <RichText html={blog.content} className="mt-8" />
        </article>
      </SidebarLayout>
    </>
  );
}
