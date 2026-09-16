import { ArticleGrid } from "@/features/blog-list";

export default function BlogsPage() {
  return (
    <div className="flex flex-col flex-1 gap-6 p-8">
      <h1 className="text-2xl font-bold">ブログ記事一覧</h1>
      <ArticleGrid fetchUrl="/api/blogs" initialCount={Infinity} />
    </div>
  );
}
