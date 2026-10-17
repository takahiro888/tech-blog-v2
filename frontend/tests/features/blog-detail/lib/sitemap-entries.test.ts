import { describe, expect, it } from "vitest";
import { buildSitemapEntries } from "@/features/blog-detail/lib/sitemap-entries";

const toAbsoluteUrl = (path: string) => `https://example.com${path}`;

describe("buildSitemapEntries", () => {
  it("記事はrevisedAtがあればそれをlastModifiedにする", () => {
    const entries = buildSitemapEntries(
      [
        {
          id: "a",
          publishedAt: "2026-09-01T00:00:00.000Z",
          revisedAt: "2026-09-10T00:00:00.000Z",
        },
      ],
      toAbsoluteUrl,
    );
    expect(entries).toContainEqual({
      url: "https://example.com/blogs/a",
      lastModified: "2026-09-10T00:00:00.000Z",
    });
  });

  it("revisedAtが無ければpublishedAtを使う", () => {
    const entries = buildSitemapEntries(
      [{ id: "b", publishedAt: "2026-09-05T00:00:00.000Z" }],
      toAbsoluteUrl,
    );
    expect(entries).toContainEqual({
      url: "https://example.com/blogs/b",
      lastModified: "2026-09-05T00:00:00.000Z",
    });
  });

  it("トップのlastModifiedは最も新しい記事の日時", () => {
    const entries = buildSitemapEntries(
      [
        { id: "a", publishedAt: "2026-09-01T00:00:00.000Z" },
        { id: "b", publishedAt: "2026-09-20T00:00:00.000Z" },
      ],
      toAbsoluteUrl,
    );
    expect(entries[0]).toEqual({
      url: "https://example.com/",
      lastModified: "2026-09-20T00:00:00.000Z",
    });
  });

  it("固定ページを含む", () => {
    const urls = buildSitemapEntries([], toAbsoluteUrl).map(
      (entry) => entry.url,
    );
    expect(urls).toEqual(
      expect.arrayContaining([
        "https://example.com/about",
        "https://example.com/profile",
        "https://example.com/privacy-policy",
        "https://example.com/disclaimer",
      ]),
    );
  });
});
