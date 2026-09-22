"use client";

import { useState } from "react";
import Link from "next/link";
import type { Blog } from "@/external/microcms/types";
import { ArticleCard } from "./ArticleCard";

const INITIAL_COUNT = 4;

type ArticleGridProps = {
  articles: Blog[];
  initialCount?: number;
  moreHref?: string;
};

export function ArticleGrid({
  articles,
  initialCount = INITIAL_COUNT,
  moreHref,
}: ArticleGridProps) {
  const [showAll, setShowAll] = useState(false);

  const visibleArticles = showAll ? articles : articles.slice(0, initialCount);
  const hasMore = !showAll && articles.length > initialCount;

  return (
    <div className="flex flex-cols-1 gap-4">
      <div className="flex flex-col divide-y divide-base-300">
        {visibleArticles.map((article) => (
          <ArticleCard key={article.id} article={article} />
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
