import type { MetadataRoute } from "next";
import type { Blog } from "@/external/microcms/types";

type SitemapArticle = Pick<Blog, "id" | "publishedAt"> & { revisedAt?: string };

const STATIC_PATHS = ["/about", "/profile", "/privacy-policy", "/disclaimer"];

// 絶対URLを作る関数は引数で受け取る（site-url.tsはserver-onlyでテストから読めないため）
export function buildSitemapEntries(
  articles: SitemapArticle[],
  toAbsoluteUrl: (path: string) => string,
): MetadataRoute.Sitemap {
  const articleEntries = articles.map((article) => ({
    url: toAbsoluteUrl(`/blogs/${article.id}`),
    // 公開し直した日時があればそれを、無ければ公開日時を使う
    lastModified: article.revisedAt ?? article.publishedAt,
  }));

  // ISO 8601形式の日時は文字列のまま並べ替えても時系列順になる
  const latestModified = articleEntries
    .map((entry) => entry.lastModified)
    .sort()
    .at(-1);

  return [
    { url: toAbsoluteUrl("/"), lastModified: latestModified },
    ...STATIC_PATHS.map((path) => ({ url: toAbsoluteUrl(path) })),
    ...articleEntries,
  ];
}
