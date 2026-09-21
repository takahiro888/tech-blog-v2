import { sortByPublishedAtDesc } from "@/shared/lib/sort-article";
import { describe, it, expect } from "vitest";

const a = (id: string, publishedAt: string) => ({ id, publishedAt });

describe("sortByPublishedAtDesc", () => {
  it("公開日の新しい順に並べる", () => {
    const result = sortByPublishedAtDesc([
      a("old", "2026-09-14T00:00:00.000Z"),
      a("new", "2026-09-16T00:00:00.000Z"),
      a("middle", "2026-09-15T00:00:00.000Z"),
    ]);

    expect(result.map((x) => x.id)).toEqual(["new", "middle", "old"]);
  });

  it("元の配列を変更しない", () => {
    const input = [
      a("1", "2026-08-30T00:00:00.000Z"),
      a("2", "2026-08-31T00:00:00.000Z"),
    ];
    sortByPublishedAtDesc(input);
    expect(input.map((x) => x.id)).toEqual(["1", "2"]);
  });

  it("空配列は空配列を返す", () => {
    expect(sortByPublishedAtDesc([])).toEqual([]);
  });
});
