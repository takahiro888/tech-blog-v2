import type { Blog } from "@/external/microcms/types";
import { ArticleBody } from "@/features/blog-detail/components/ArticleBody";
import { ShareButtons } from "@/features/blog-detail/components/ShareButtons";
import { buildAbsoluteUrl } from "@/shared/lib/site-url";

type ArticleDetailProps = {
  blog: Blog;
};

export function ArticleDetail({ blog }: ArticleDetailProps) {
  const articleUrl = buildAbsoluteUrl(`/blogs/${blog.id}`);

  return (
    // PC: 左に48pxのシェア列＋記事 / スマホ: 記事の下にシェアボタン
    <div className="grid gap-8 lg:grid-cols-[48px_1fr]">
      <div className="order-last lg:order-first">
        <ShareButtons
          articleUrl={articleUrl}
          title={blog.title}
          className="lg:sticky lg:top-40"
        />
      </div>
      <ArticleBody blog={blog} />
    </div>
  );
}
