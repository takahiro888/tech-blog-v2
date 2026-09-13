"use client";

import { useState, useEffect } from "react";
import type { Article } from "@/lib/types";
import { ArticleCard } from "./ArticleCard";
const INITIAL_COUNT = 2;

export function ArticleGrid() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    fetch(
      "https://qiita.com/api/v2/items?query=user:takahiro_honda&per_page=20",
    )
      .then((res) => res.json())
      .then((data: Article[]) => setArticles(data));
  }, []);

  const visibleArticles = showAll ? articles : articles.slice(0, INITIAL_COUNT);
  return (
    <div className="flex flex-cols-1 gap-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {visibleArticles.map((article) => (
          <ArticleCard key={article.url} article={article} />
        ))}
      </div>
      {!showAll && articles.length > INITIAL_COUNT && (
        <button
          className="btn btn-outline self-center"
          onClick={() => setShowAll(true)}
        >
          もっと見る
        </button>
      )}
    </div>
  );
}
