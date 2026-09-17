import { ArticleGrid } from "@/features/blog-list";
import { getBlogList } from "@/external/microcms/blogs";

export default async function Home() {

  const { contents } = await getBlogList();
  return (
    <div className="flex flex-col flex-1 gap-6 p-8">
      <h1 className="text-2xl font-bold">ブログ記事</h1>
      <ArticleGrid articles={contents} moreHref="/blogs" />
    </div>
  );
}
