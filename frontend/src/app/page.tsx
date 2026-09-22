import { ArticleGrid } from "@/features/blog-list";
import { getBlogList } from "@/external/microcms/blogs";
import { Sidebar } from "@/features/sidebar/components/Sidebar";
import { HERO } from "@/shared/lib/constants";

export default async function Home() {
  const { contents } = await getBlogList();
  return (
    <div className="mx-auto grid w-full max-w-6xl gap-16 px-4 py-10 lg:grid-cols-[1fr_270px]">
      <main>
        <section className="mb-10 border-b border-base-300 pb-8">
          <h1 className="mb-3 text-3xl font-bold">{HERO.title}</h1>
          <p className="text-base-content/60">{HERO.subtitle}</p>
        </section>
        <ArticleGrid articles={contents} moreHref="/blogs" />
      </main>
      <Sidebar articles={contents} />
    </div>
  );
}
