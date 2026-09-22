import type { Blog } from "@/external/microcms/types";
import { AuthorCard } from "./AuthorCard";
import { CategoryList } from "./CategoryList";
import { ArchiveList } from "./ArchiveList";
import { MessageBox } from "./MessageBox";
import { aggregateArchives, aggregateCategories } from "../lib/aggregate";
import { SearchBox } from "./SearchBox";

export function Sidebar({
  articles,
  searchKeyword,
}: {
  articles: Blog[];
  searchKeyword?: string;
}) {
  return (
    <aside className="flex flex-col gap-8">
      <SearchBox defaultValue={searchKeyword} />
      <AuthorCard />
      <CategoryList categories={aggregateCategories(articles)} />
      <ArchiveList archives={aggregateArchives(articles)} />
      <MessageBox />
    </aside>
  );
}
