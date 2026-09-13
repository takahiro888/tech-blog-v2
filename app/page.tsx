import { ArticleGrid } from "../components/ArticleGrid";

export default function Home() {
  return (
    <div className="flex flex-col flex-1 gap-6 p-8">
      <h1 className="text-2xl font-bold">最近の記事</h1>
      <ArticleGrid />
    </div>
  );
}
