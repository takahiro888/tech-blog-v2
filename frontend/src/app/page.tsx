import { ArticleGrid } from "@/features/blog-list";
import { getBlogList } from "@/external/microcms/blogs";
import { Sidebar } from "@/features/sidebar/components/Sidebar";

export default async function Home() {
  const { contents } = await getBlogList();
  return (
    <div className="mx-auto grid w-full max-w-6xl gap-16 px-4 py-10 lg:grid-cols-[1fr_270px]">
      <main>
        <ArticleGrid articles={contents} moreHref="/blogs" />
      </main>
      <Sidebar articles={contents} />
    </div>
  );
}
