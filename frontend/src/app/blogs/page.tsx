import { getBlogList } from "@/external/microcms/blogs";
import { ArticleGrid } from "@/features/blog-list";
import { Sidebar } from "@/features/sidebar/components/Sidebar";

export default async function BlogsPage() {
  const { contents } = await getBlogList();

  return (
    <div className="mx-auto grid w-full max-w-6xl gap-16 px-4 py-10 lg:grid-cols-[1fr_270px]">
      <main>
        <h1 className="mb-6 text-2xl font-bold">記事一覧</h1>
        <ArticleGrid articles={contents} initialCount={Infinity} />
      </main>
      <Sidebar articles={contents} />
    </div>
  );
}
