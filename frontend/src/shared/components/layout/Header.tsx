import Link from "next/link";

const NAV_ITEMS = [
  { href: "/", label: "記事一覧" },
  { href: "/about", label: "このブログについて" },
  { href: "/profile", label: "プロフィール" },
] as const;

export function Header() {
  return (
    <header className="border-t-4 border-slate-800 bg-base-100 shadow-sm">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
        <Link href="/" className="text-lg font-bold">
          Tech Blog
        </Link>
        <nav aria-label="メインナビゲーション">
          <ul className="flex gap-4 text-sm">
            {NAV_ITEMS.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="hover:text-blue-700">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </header>
  );
}
