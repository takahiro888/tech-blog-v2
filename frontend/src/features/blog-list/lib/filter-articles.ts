import { Blog } from "@/external/microcms/types";
import { formatPublishedDate } from "@/shared/lib/published-at";

export type ArticleFilter = {
  category?: string;
  keyword?: string;
  yearMonth?: string;
};

export type PaginationResult<T> = {
  items: T[];
  totalCount: number;
  currentPage: number;
  totalPages: number;
  displayStart: number; // 表示範囲の開始番号（1始まり）。0件のときは0
  displayEnd: number; // 表示範囲の終了番号
};

export type RawArticlesSearchParams = {
  category?: string;
  keyword?: string;
  month?: string;
  page?: string;
  pageSize?: string;
};

export type ParsedArticlesQuery = {
  category?: string;
  keyword?: string;
  yearMonth?: string;
  page: number;
  pageSize: number;
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

export function parseArticlesSearchParams(
  raw: RawArticlesSearchParams,
): ParsedArticlesQuery {
  const parsedPage = Number(raw.page);
  const page = Number.isInteger(parsedPage) && parsedPage > 0 ? parsedPage : 1;

  const parsedPageSize = Number(raw.pageSize);
  const pageSize = PAGE_SIZE_OPTIONS.includes(parsedPageSize)
    ? parsedPageSize
    : DEFAULT_PAGE_SIZE;

  return {
    category: raw.category,
    keyword: raw.keyword,
    yearMonth: raw.month,
    page,
    pageSize,
  };
}

export function buildArticlesHref(
  query: Pick<
    ParsedArticlesQuery,
    "category" | "keyword" | "yearMonth" | "pageSize"
  >,
  targetPage: number,
): string {
  const params = new URLSearchParams();
  if (query.category) params.set("category", query.category);
  if (query.keyword) params.set("keyword", query.keyword);
  if (query.yearMonth) params.set("month", query.yearMonth);
  if (query.pageSize !== DEFAULT_PAGE_SIZE) {
    params.set("pageSize", String(query.pageSize));
  }
  if (targetPage > 1) params.set("page", String(targetPage));
  const search = params.toString();
  return search ? `/?${search}` : "/";
}
