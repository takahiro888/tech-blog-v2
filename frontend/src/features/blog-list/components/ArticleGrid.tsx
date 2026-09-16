// features/blog-list/components/ArticleGrid.tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import type { Article } from "@/shared/lib/types";
import { ArticleCard } from "./ArticleCard";

const INITIAL_COUNT = 2;

type ArticleGridProps = {
  fetchUrl: string;
  initialCount?: number;
  moreHref?: string;
};

export function ArticleGrid({
  fetchUrl,
  initialCount = INITIAL_COUNT,
  moreHref,
}: ArticleGridProps) {
  const [articles, setArticles] = useState<Article[]>([]);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    fetch(fetchUrl)
      .then((res) => res.json())
      .then((data: Article[]) => setArticles(data));
  }, [fetchUrl]);

  const visibleArticles = showAll ? articles : articles.slice(0, initialCount);
  const hasMore = !showAll && articles.length > initialCount;

  return (
    <div className="flex flex-cols-1 gap-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {visibleArticles.map((article) => (
          <ArticleCard key={article.url} article={article} />
        ))}
      </div>
      {hasMore &&
        (moreHref ? (
          <Link href={moreHref} className="btn btn-outline self-center">
            もっと見る
          </Link>
        ) : (
          <button
            className="btn btn-outline self-center"
            onClick={() => setShowAll(true)}
          >
            もっと見る
          </button>
        ))}
    </div>
  );
}