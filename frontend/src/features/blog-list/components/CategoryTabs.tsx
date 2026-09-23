import Link from "next/link";

export function CategoryTabs({
  categories,
  active,
}: {
  categories: string[];
  active?: string;
}) {
  const tabs = ["すべて", ...categories];
  return (
    <div className="flex flex-wrap gap-2">
      {tabs.map((tab) => {
        const isActive = tab === "すべて" ? !active : tab === active;
        const href =
          tab === "すべて" ? "/" : `/?category=${encodeURIComponent(tab)}`;
        return (
          <Link
            key={tab}
            href={href}
            className={
              isActive
                ? "rounded-full bg-blue-900 px-3 py-1 text-xs font-bold text-white"
                : "rounded-full border border-base-300 px-3 py-1 text-xs hover:bg-base-200"
            }
          >
            {tab}
          </Link>
        );
      })}
    </div>
  );
}
