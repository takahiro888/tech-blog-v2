import type { Article } from "./types";
import { FALLBACK_THUMBNAIL } from "./constants";

export const sampleArticles: Article[] = [
  {
    title: "Reactの基本",
    date: "2024-06-01",
    url: "https://example.com/article-1",
    thumbnail: FALLBACK_THUMBNAIL,
  },
];
