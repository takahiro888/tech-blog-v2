import { getBlogList } from "@/external/microcms/blogs";
import { ArticleGrid } from "@/features/blog-list";

export default async function BlogsPage() {
  const { contents } = await getBlogList();

  return (
    <div className="flex flex-col flex-1 gap-6 p-8">
      <h1 className="text-2xl font-bold">ブログ記事一覧</h1>
      <ArticleGrid articles={contents} initialCount={Infinity} />
    </div>
  );
}
