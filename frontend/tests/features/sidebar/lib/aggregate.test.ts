import { describe, it, expect } from "vitest";
import {
  aggregateCategories,
  aggregateArchives,
} from "@/features/sidebar/lib/aggregate";

const article = (categories: string[] | undefined, publishedAt: string) => ({
  categories,
  publishedAt,
});

describe("aggregateCategories", () => {
  it("カテゴリごとの件数を数える", () => {
    const result = aggregateCategories([
      article(["React", "TypeScript"], "2026-09-13T00:00:00Z"),
      article(["React"], "2026-09-01T00:00:00Z"),
    ]);
    expect(result).toEqual([
      { name: "React", count: 2 },
      { name: "TypeScript", count: 1 },
    ]);
  });

  it("件数の降順に並べる", () => {
    const result = aggregateCategories([
      article(["Git"], "2026-09-13T00:00:00Z"),
      article(["CSS"], "2026-09-12T00:00:00Z"),
      article(["CSS"], "2026-09-11T00:00:00Z"),
    ]);
    expect(result.map((c) => c.name)).toEqual(["CSS", "Git"]);
  });

  it("同数ならカテゴリ名順に並べる", () => {
    const result = aggregateCategories([
      article(["Testing"], "2026-09-13T00:00:00Z"),
      article(["CSS"], "2026-09-12T00:00:00Z"),
      article(["Git"], "2026-09-11T00:00:00Z"),
    ]);
    expect(result.map((c) => c.name)).toEqual(["CSS", "Git", "Testing"]);
  });

  it("カテゴリ未設定の記事は数えない", () => {
    const result = aggregateCategories([
      article(undefined, "2026-09-13T00:00:00Z"),
      article([], "2026-09-12T00:00:00Z"),
      article(["React"], "2026-09-11T00:00:00Z"),
    ]);
    expect(result).toEqual([{ name: "React", count: 1 }]);
  });

  it("記事が0件なら空配列を返す", () => {
    expect(aggregateCategories([])).toEqual([]);
  });

  it("Object.prototypeのプロパティ名でも正しく数える", () => {
    const result = aggregateCategories([
      article(["constructor"], "2026-09-13T00:00:00Z"),
    ]);
    expect(result).toEqual([{ name: "constructor", count: 1 }]);
  });
});

describe("aggregateArchives", () => {
  it("同じ月の記事をまとめてYYYY-MM形式で返す", () => {
    const result = aggregateArchives([
      article(undefined, "2026-09-13T00:00:00Z"),
      article(undefined, "2026-09-01T00:00:00Z"),
    ]);
    expect(result).toEqual([{ month: "2026-09", count: 2 }]);
  });

  it("新しい月を先頭に並べる", () => {
    const result = aggregateArchives([
      article(undefined, "2026-07-10T00:00:00Z"),
      article(undefined, "2026-09-10T00:00:00Z"),
      article(undefined, "2026-08-10T00:00:00Z"),
    ]);
    expect(result.map((a) => a.month)).toEqual([
      "2026-09",
      "2026-08",
      "2026-07",
    ]);
  });

  it("月の境界はJSTで判定する", () => {
    const result = aggregateArchives([
      article(undefined, "2026-08-31T14:59:59Z"), // JST 08/31 23:59:59
      article(undefined, "2026-08-31T15:00:00Z"), // JST 09/01 00:00:00
    ]);
    expect(result).toEqual([
      { month: "2026-09", count: 1 },
      { month: "2026-08", count: 1 },
    ]);
  });

  it("年をまたいでも新しい順に並べる", () => {
    const result = aggregateArchives([
      article(undefined, "2025-12-10T00:00:00Z"),
      article(undefined, "2026-01-10T00:00:00Z"),
    ]);
    expect(result.map((a) => a.month)).toEqual(["2026-01", "2025-12"]);
  });

  it("記事が0件なら空配列を返す", () => {
    expect(aggregateArchives([])).toEqual([]);
  });
});
