import type { Blog } from "@/external/microcms/types";
import { ArticleCard } from "./ArticleCard";

export function ArticleGrid({ articles }: { articles: Blog[] }) {
  return (
    <div className="flex flex-col divide-y divide-base-300">
      {articles.map((article) => (
        <ArticleCard key={article.id} article={article} />
      ))}
    </div>
  );
}
