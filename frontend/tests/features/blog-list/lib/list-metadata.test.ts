import { describe, expect, it } from "vitest";
import {
  buildArticleListHeading,
  buildArticleListMetadata,
  buildFilterLabel,
} from "@/features/blog-list/lib/list-metadata";

describe("buildArticleListMetadata", () => {
  it("絞り込みなしならtitleを返さず、canonicalを/にする", () => {
    const metadata = buildArticleListMetadata({});
    expect(metadata.title).toBeUndefined();
    expect(metadata.alternates?.canonical).toBe("/");
  });

  it("カテゴリ絞り込みならカテゴリ名入りのtitleとcanonicalを返す", () => {
    const metadata = buildArticleListMetadata({ category: "React" });
    expect(metadata.title).toBe("「React」の記事一覧");
    expect(metadata.alternates?.canonical).toBe("/?category=React");
  });

  it("月の絞り込みなら年月入りのtitleを返す", () => {
    const metadata = buildArticleListMetadata({ yearMonth: "2026-09" });
    expect(metadata.title).toBe("2026年9月の記事一覧");
  });

  it("キーワード検索は検索エンジンに登録させない", () => {
    const metadata = buildArticleListMetadata({ keyword: "hooks", category: "React" });
    expect(metadata.title).toBe("「hooks」の検索結果");
    expect(metadata.robots).toEqual({ index: false, follow: true });
  });
});

describe("buildFilterLabel / buildArticleListHeading", () => {
  it("キーワード検索だけのときはどちらもnull", () => {
    expect(buildFilterLabel({ keyword: "hooks" })).toBeNull();
    expect(buildArticleListHeading({ keyword: "hooks" })).toBeNull();
  });
});
