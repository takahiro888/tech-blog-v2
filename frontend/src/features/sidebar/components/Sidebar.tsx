import type { Blog } from "@/external/microcms/types";
import { AuthorCard } from "./AuthorCard";
import { CategoryList } from "./CategoryList";
import { ArchiveList } from "./ArchiveList";
import { aggregateArchives, aggregateCategories } from "../lib/aggregate";

export function Sidebar({ articles }: { articles: Blog[] }) {
  return (
    <aside className="flex flex-col gap-8">
      <AuthorCard />
      <CategoryList categories={aggregateCategories(articles)} />
      <ArchiveList archives={aggregateArchives(articles)} />
    </aside>
  );
}
