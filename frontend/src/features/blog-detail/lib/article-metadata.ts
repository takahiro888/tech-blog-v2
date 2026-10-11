import type { Metadata } from "next";
import { Blog } from "@/external/microcms/types";

export function buildArticleMetadata(blog: Blog | null): Metadata {
  if (!blog) {
    return { title: "記事が見つかりませんでした" };
  }

  const articlePath = `/blogs/${blog.id}`;

  return {
    title: blog.title,
    description: blog.excerpt,
    openGraph: {
      type: "article",
      title: blog.title,
      description: blog.excerpt,
      url: articlePath,
      publishedTime: blog.publishedAt,
      images: blog.eyecatch
        ? [
            {
              url: blog.eyecatch.url,
              width: blog.eyecatch.width,
              height: blog.eyecatch.height,
            },
          ]
        : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: blog.title,
      description: blog.excerpt,
    },
  };
}
