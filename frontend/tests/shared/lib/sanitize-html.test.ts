import { describe, expect, it } from "vitest";
import { sanitizeRichText } from "@/shared/lib/sanitize-html";

describe("sanitizeRichText", () => {
  it("scriptタグを除去する", () => {
    expect(sanitizeRichText("<p>本文</p><script>alert(1)</script>")).toBe("<p>本文</p>");
  });

  it("onerrorなどのイベント属性を除去する", () => {
    const result = sanitizeRichText('<img src="https://example.com/a.png" onerror="alert(1)">');
    expect(result).toContain('src="https://example.com/a.png"');
    expect(result).not.toContain("onerror");
  });

  it("javascript:のリンク先を除去する", () => {
    expect(sanitizeRichText('<a href="javascript:alert(1)">リンク</a>')).toBe("<a>リンク</a>");
  });

  it("新規タブのリンクにrelを付ける", () => {
    const result = sanitizeRichText('<a href="https://example.com" target="_blank">外部</a>');
    expect(result).toContain('rel="noopener noreferrer"');
  });

  it("見出しのidとコードブロックのclassは残す", () => {
    const html = '<h2 id="intro">はじめに</h2><pre><code class="language-ts">const a = 1;</code></pre>';
    expect(sanitizeRichText(html)).toBe(html);
  });
});
