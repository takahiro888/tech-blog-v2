import Link from "next/link";

type BreadcrumbItem = {
  label: string;
  href?: string;
};

export function Breadcrumb({ items }: { items: BreadcrumbItem[] }) {
  return (
    <nav
      aria-label="パンくずリスト"
      className="border-b border-base-300 bg-base-200/60"
    >
      <ol className="mx-auto flex max-w-6xl flex-wrap items-center gap-1 px-4 py-3 text-sm">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <li key={item.label} className="flex items-center gap-1">
              {index > 0 && <span className="text-base-content/40">&gt;</span>}
              {item.href && !isLast ? (
                <Link
                  href={item.href}
                  className="text-blue-700 hover:underline"
                >
                  {item.label}
                </Link>
              ) : (
                <span
                  className={isLast ? "text-base-content/60" : undefined}
                  aria-current={isLast ? "page" : undefined}
                >
                  {item.label}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
