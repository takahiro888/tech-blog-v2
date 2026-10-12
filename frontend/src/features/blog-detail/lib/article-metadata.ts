import type { Metadata } from "next";
import type { Blog } from "@/external/microcms/types";
import { SITE_NAME } from "@/shared/lib/constants";

export function buildArticleMetadata(blog: Blog): Metadata {
  const articlePath = `/blogs/${blog.id}`;

  return {
    title: blog.title,
    description: blog.excerpt,
    alternates: { canonical: articlePath },
    openGraph: {
      // openGraphはlayoutの値と浅くマージされ丸ごと置き換わるため、共通の項目もここに書く
      siteName: SITE_NAME,
      locale: "ja_JP",
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
