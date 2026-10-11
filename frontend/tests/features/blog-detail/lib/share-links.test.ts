import { describe, expect, it } from "vitest";
import { buildShareLinks } from "../../../../src/features/blog-detail/lib/share-links";
const ARTICLE_URL = "https://tech-blog-v2-lemon.vercel.app/blogs/abc123";

// テストで扱いやすいよう、serviceをキーにしたオブジェクトに変換する
function getLinksByService(title: string) {
  const links = buildShareLinks(ARTICLE_URL, title);
  return Object.fromEntries(
    links.map((link) => [link.service, new URL(link.href)]),
  );
}

describe("buildShareLinks", () => {
  it("日本語や&・#を含むタイトルでもクエリが壊れない", () => {
    const title = "Next.js & React入門 #1 ?について";
    const { x, hatena } = getLinksByService(title);
    expect(x.searchParams.get("text")).toBe(title);
    expect(hatena.searchParams.get("title")).toBe(title);
  });
});
