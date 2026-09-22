import { describe, it, expect } from "vitest";
import {
  filterArticles,
  paginateArticles,
} from "@/features/blog-list/lib/filter-articles";

const article = (
  overrides: Partial<{
    title: string;
    categories: string[];
    publishedAt: string;
  }> = {},
) => ({
  id: "id",
  title: "タイトル",
  content: "",
  categories: [],
  publishedAt: "2026-09-01T00:00:00Z",
  ...overrides,
});

describe("filterArticles", () => {
  it("カテゴリで絞り込む", () => {
    const articles = [
      article({ categories: ["React"] }),
      article({ categories: ["TypeScript"] }),
    ];
    expect(filterArticles(articles, { category: "React" })).toHaveLength(1);
  });

  it("タイトルの部分一致（大文字小文字を区別しない）で絞り込む", () => {
    const articles = [
      article({ title: "Reactの基礎" }),
      article({ title: "CSSの基礎" }),
    ];
    expect(filterArticles(articles, { keyword: "react" })).toHaveLength(1);
  });

  it("年月で絞り込む", () => {
    const articles = [
      article({ publishedAt: "2026-09-14T00:00:00Z" }),
      article({ publishedAt: "2026-08-01T00:00:00Z" }),
    ];
    expect(filterArticles(articles, { yearMonth: "2026-09" })).toHaveLength(1);
  });

  it("条件を指定しない場合は全件返す", () => {
    expect(filterArticles([article(), article()], {})).toHaveLength(2);
  });
});

describe("paginateArticles", () => {
  const articles = Array.from({ length: 25 }, (_, i) => i);

  it("指定件数ごとに分割する", () => {
    const result = paginateArticles(articles, 1, 10);
    expect(result.items).toEqual(articles.slice(0, 10));
    expect(result.totalPages).toBe(3);
  });

  it("表示範囲(displayStart/displayEnd)を返す", () => {
    const result = paginateArticles(articles, 2, 10);
    expect(result.displayStart).toBe(11);
    expect(result.displayEnd).toBe(20);
  });

  it("ページ番号が範囲外なら最終ページに丸める", () => {
    expect(paginateArticles(articles, 99, 10).currentPage).toBe(3);
  });

  it("0件のときdisplayStartは0", () => {
    const result = paginateArticles([], 1, 10);
    expect(result.displayStart).toBe(0);
    expect(result.totalCount).toBe(0);
  });
});
