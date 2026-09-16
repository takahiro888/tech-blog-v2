import { ArticleGrid } from "../components/ArticleGrid";

export default function Home() {
  return (
    <div className="flex flex-col flex-1 gap-6 p-8">
      <h1 className="text-2xl font-bold">ブログ記事</h1>
      <ArticleGrid fetchUrl="/api/blogs" moreHref="/blogs" />

      <h1 className="text-2xl font-bold">Qiita記事</h1>
      <ArticleGrid fetchUrl="https://qiita.com/api/v2/items?query=user:takahiro_honda&per_page=20" />
    </div>
  );
}
