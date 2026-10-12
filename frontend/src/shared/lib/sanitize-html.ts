import sanitizeHtml from "sanitize-html";

const HEADING_TAGS = ["h1", "h2", "h3", "h4", "h5"];

const RICH_TEXT_OPTIONS: sanitizeHtml.IOptions = {
  allowedTags: [
    ...HEADING_TAGS,
    "p",
    "br",
    "hr",
    "strong",
    "em",
    "u",
    "s",
    "code",
    "pre",
    "blockquote",
    "ul",
    "ol",
    "li",
    "a",
    "img",
    "figure",
    "figcaption",
    "table",
    "thead",
    "tbody",
    "tr",
    "th",
    "td",
    "span",
    "div",
  ],
  allowedAttributes: {
    a: ["href", "target", "rel"],
    img: ["src", "alt", "width", "height"],
    ...Object.fromEntries(HEADING_TAGS.map((tag) => [tag, ["id"]])), // 目次のアンカー用
    "*": ["class"], // コードブロックの言語指定など
  },
  allowedSchemes: ["http", "https", "mailto"], // javascript: を除去する
  transformTags: {
    // 新規タブで開くリンクには、開いた先から元ページを操作されないようrelを付ける
    a: (tagName, attribs) => ({
      tagName,
      attribs:
        attribs.target === "_blank"
          ? { ...attribs, rel: "noopener noreferrer" }
          : attribs,
    }),
  },
};

export function sanitizeRichText(html: string): string {
  return sanitizeHtml(html, RICH_TEXT_OPTIONS);
}
