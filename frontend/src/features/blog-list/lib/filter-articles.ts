import { Blog } from "@/external/microcms/types";
import { formatPublishedDate } from "@/shared/lib/published-at";

export type ArticleFilter = {
  category?: string;
  keyword?: string;
  yearMonth?: string;
};

export const PAGE_SIZE_OPTIONS = [10, 20, 30];
export const DEFAULT_PAGE_SIZE = 10;

function toYearMonth(publishedAt: string): string {
  return formatPublishedDate(publishedAt).slice(0, 7).replace(".", "-");
}

export function filterArticles(
  articles: readonly Blog[],
  filter: ArticleFilter,
): Blog[] {
  return articles.filter((article) => {
    if (
      filter.category &&
      !(article.categories ?? []).includes(filter.category)
    ) {
      return false;
    }
    if (
      filter.yearMonth &&
      toYearMonth(article.publishedAt) !== filter.yearMonth
    ) {
      return false;
    }
    if (
      filter.keyword &&
      !article.title.toLowerCase().includes(filter.keyword.toLowerCase())
    ) {
      return false;
    }
    return true;
  });
}

export type PaginationResult<T> = {
  items: T[];
  totalCount: number;
  currentPage: number;
  totalPages: number;
  displayStart: number; // 表示範囲の開始番号（1始まり）。0件のときは0
  displayEnd: number; // 表示範囲の終了番号
};

export function paginateArticles<T>(
  articles: readonly T[],
  page: number,
  pageSize: number,
): PaginationResult<T> {
  const totalCount = articles.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const currentPage = Math.min(Math.max(page, 1), totalPages);
  const offset = (currentPage - 1) * pageSize;
  const items = articles.slice(offset, offset + pageSize);
  return {
    items,
    totalCount,
    currentPage,
    totalPages,
    displayStart: totalCount === 0 ? 0 : offset + 1,
    displayEnd: offset + items.length,
  };
}
