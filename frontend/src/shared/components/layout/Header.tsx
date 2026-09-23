import Link from "next/link";
import { CATCH_COPY } from "@/shared/lib/constants";

const NAV_ITEMS = [
  { href: "/", label: "記事一覧" },
  { href: "/about", label: "このブログについて" },
  { href: "/profile", label: "プロフィール" },
] as const;

export function Header() {
  return (
    <header className="border-t-4 border-slate-800 bg-base-100 shadow-sm">
      <div className="mx-auto max-w-5xl px-4">
        <div className="flex items-center justify-between py-3">
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
        <p className="border-t border-base-300 py-4 text-sm text-base-content/60">
          {CATCH_COPY.subtitle}
        </p>
      </div>
    </header>
  );
}
