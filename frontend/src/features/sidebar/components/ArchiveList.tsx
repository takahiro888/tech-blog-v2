import Link from "next/link";
import { ArchiveCount } from "../lib/aggregate";

const label = (month: string) => `${month.slice(0, 4)}年${month.slice(5)}月`;

export function ArchiveList({ archives }: { archives: ArchiveCount[] }) {
  return (
    <section>
      <h2 className="mb-2 text-sm font-bold">アーカイブ</h2>
      <ul className="divide-y divide-base-300">
        {archives.map(({ month, count }) => (
          <li key={month}>
            <Link
              href={`/?month=${encodeURIComponent(month)}`}
              className="flex items-center justify-between py-2 text-sm hover:text-blue-700"
            >
              <span>{label(month)}</span>
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
