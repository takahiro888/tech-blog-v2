import { getBlogList } from "@/external/microcms/blogs";
import { aggregateCategories } from "@/features/sidebar/lib/aggregate";
import { SidebarLayout } from "@/shared/components/layout/SidebarLayout";
import { HERO } from "@/shared/lib/constants";
import { ArticleGrid } from "@/features/blog-list/components/ArticleGrid";
import { CategoryTabs } from "@/features/blog-list/components/CategoryTabs";
import { ResultSummary } from "@/features/blog-list/components/ResultSummary";
import { PageSizeSelect } from "@/features/blog-list/components/PageSizeSelect";
import { Pagination } from "@/features/blog-list/components/Pagination";
import {
  filterArticles,
  paginateArticles,
  parseArticlesSearchParams,
  buildArticlesHref,
  type RawArticlesSearchParams,
} from "@/features/blog-list/lib/filter-articles";

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<RawArticlesSearchParams>;
}) {
  const rawSearchParams = await searchParams;
  const { contents } = await getBlogList();

  const query = parseArticlesSearchParams(rawSearchParams);
  const filteredArticles = filterArticles(contents, query);
  const pagination = paginateArticles(filteredArticles, query.page, query.pageSize);

  return (
    <SidebarLayout articles={contents} searchKeyword={query.keyword}>
      {!query.hasActiveFilters && (
        <section className="mb-10 border-b border-base-300 pb-8">
          <h1 className="mb-3 text-3xl font-bold">{HERO.title}</h1>
          <p className="text-base-content/60">{HERO.subtitle}</p>
        </section>
      )}

      <h2 className="mb-4 text-xl font-bold">最新の記事</h2>
      <CategoryTabs
        categories={aggregateCategories(contents).map((c) => c.name)}
        active={query.category}
      />

      {pagination.totalCount > 0 ? (
        <>
          <div className="my-4 flex flex-wrap items-center justify-between gap-2">
            <ResultSummary
              totalCount={pagination.totalCount}
              displayStart={pagination.displayStart}
              displayEnd={pagination.displayEnd}
            />
            <PageSizeSelect value={query.pageSize} />
          </div>
          <ArticleGrid articles={pagination.items} />
          <div className="mt-8">
            <Pagination
              currentPage={pagination.currentPage}
              totalPages={pagination.totalPages}
              buildHref={(page) => buildArticlesHref(query, page)}
            />
          </div>
        </>
      ) : (
        <p className="py-10 text-center text-sm text-base-content/60">
          該当する記事がありません
        </p>
      )}
    </SidebarLayout>
  );
}
