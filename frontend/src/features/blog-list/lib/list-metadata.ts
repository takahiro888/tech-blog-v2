import { Metadata } from "next";
import {
  buildArticlesHref,
  DEFAULT_PAGE_SIZE,
  type ParsedArticlesQuery,
} from "./filter-articles";
import { formatYearMonthLabel } from "@/shared/lib/published-at";

type ArticleListFilter = Pick<
  ParsedArticlesQuery,
  "category" | "keyword" | "yearMonth"
>;

// パンくずに出す絞り込み名。
export function buildFilterLabel(query: ArticleListFilter): string | null {
  if (query.category) return query.category;
  if (query.yearMonth) return formatYearMonthLabel(query.yearMonth);
  return null;
}

// h1の見出し。絞り込みなしのときはh1を出さない。
export function buildArticleListHeading(
  query: ArticleListFilter,
): string | null {
  if (query.category) return `「${query.category}」の記事一覧`;
  if (query.yearMonth)
    return `${formatYearMonthLabel(query.yearMonth)}の記事一覧`;
  return null;
}

export function buildArticleListMetadata(query: ArticleListFilter): Metadata {
  if (query.keyword) {
    return {
      title: `「${query.keyword}」の検索結果`,
      robots: {
        index: false,
        follow: true,
      },
    };
  }

  const heading = buildArticleListHeading(query);
  const label = buildFilterLabel(query);
  if (!heading || !label) {
    return { alternates: { canonical: "/" } };
  }

  return {
    title: heading,
    description: query.category
      ? `「${label}」に関する記事の一覧です。`
      : `${label}に公開した記事の一覧です。`,
    alternates: {
      canonical: buildArticlesHref(
        {
          category: query.category,
          yearMonth: query.yearMonth,
          keyword: undefined,
          pageSize: DEFAULT_PAGE_SIZE,
        },
        1,
      ),
    },
  };
}
