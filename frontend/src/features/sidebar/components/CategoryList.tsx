import { CategoryCount } from "../lib/aggregate";
import Link from "next/link";

export function CategoryList({ categories }: { categories: CategoryCount[] }) {
  return (
    <section>
      <h2 className="mb-2 text-sm font-bold">カテゴリー</h2>
      <ul className="divide-y divide-base-300">
        {categories.map(({ name, count }) => (
          <li key={name}>
            <Link
              href={`/blogs?category=${encodeURIComponent(name)}`}
              className="flex items-center justify-between py-2 text-sm hover:text-blue-700"
            >
              <span>{name}</span>
              <span className="rounded bg-base-200 px-1.5 text-xs">
                {count}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
