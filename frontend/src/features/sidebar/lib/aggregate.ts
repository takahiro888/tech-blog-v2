import type { Blog } from "@/external/microcms/types";
import { formatPublishedDate } from "@/shared/lib/published-at";

export type CategoryCount = { name: string; count: number };
export type ArchiveCount = {
  month: string;
  count: number;
};

type Article = Pick<Blog, "categories" | "publishedAt">;

export function aggregateCategories(
  articles: readonly Article[],
): CategoryCount[] {
  const counts = new Map<string, number>();
  for (const article of articles) {
    for (const category of article.categories ?? []) {
      counts.set(category, (counts.get(category) ?? 0) + 1);
    }
  }
  return [...counts]
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
}

export function aggregateArchives(
  articles: readonly Article[],
): ArchiveCount[] {
  const counts = new Map<string, number>();
  for (const { publishedAt } of articles) {
    const month = formatPublishedDate(publishedAt)
      .slice(0, 7)
      .replace(".", "-");
    counts.set(month, (counts.get(month) ?? 0) + 1);
  }
  return [...counts]
    .map(([month, count]) => ({ month, count }))
    .sort((a, b) => b.month.localeCompare(a.month));
}
