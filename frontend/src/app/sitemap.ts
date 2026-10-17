import { getBlogList } from "@/external/microcms/blogs";
import { buildSitemapEntries } from "@/features/blog-detail/lib/sitemap-entries";
import { MetadataRoute } from "next";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const articles = await getBlogList();
    return buildSitemapEntries(articles, (path) => `${process.env.SITE_URL}${path}`);
}