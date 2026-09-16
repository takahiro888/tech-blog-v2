import { FALLBACK_THUMBNAIL } from "@/lib/constants";
import { getBlogList } from "@/external/microcms/blogs";
import { Article } from "@/lib/types";

export async function GET() {
  const { contents } = await getBlogList();

  const articles: Article[] = contents.map((blog) => ({
    title: blog.title,
    date: blog.publishedAt.slice(0, 10),
    url: `/blogs/${blog.id}`,
    thumbnail: blog.eyecatch?.url ?? FALLBACK_THUMBNAIL,
  }));

  return Response.json(articles);
}
