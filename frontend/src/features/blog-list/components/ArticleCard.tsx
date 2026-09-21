import Link from "next/link";
import type { Blog } from "@/external/microcms/types";
import { getCardTheme } from "@/shared/lib/card-theme";
import { formatPublishedDate, isNew } from "@/shared/lib/published-at";
import { ArticleThumbnail } from "./ArticleThumbnail";

export function ArticleCard({ article }: { article: Blog }) {
  const categories = article.categories ?? [];
  const label = categories[0] ?? "Article";

  return (
    <Link
      href={`/blogs/${article.id}`}
      className="group flex flex-col gap-4 py-6 sm:flex-row"
    >
      <ArticleThumbnail label={label} theme={getCardTheme(categories)} />
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2 text-xs text-base-content/60">
          <time dateTime={article.publishedAt}>
            {formatPublishedDate(article.publishedAt)}
          </time>
          {isNew(article.publishedAt, new Date()) && (
            <span className="rounded bg-blue-50 px-1.5 py-0.5 font-bold text-blue-700">
              新着
            </span>
          )}
        </div>
        <h2 className="text-lg font-bold group-hover:text-blue-700">
          {article.title}
        </h2>
        {article.excerpt && (
          <p className="line-clamp-2 text-sm text-base-content/60">
            {article.excerpt}
          </p>
        )}
        <ul className="flex flex-wrap gap-2">
          {categories.map((c) => (
            <li key={c} className="rounded bg-base-200 px-2 py-0.5 text-xs">
              {c}
            </li>
          ))}
        </ul>
      </div>
    </Link>
  );
}
