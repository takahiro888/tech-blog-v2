import Link from "next/link";
import { CATCH_COPY } from "@/shared/lib/constants";
import { NavLink } from "./NavLink";

const NAV_ITEMS = [
  { href: "/", label: "記事一覧", activePrefixes: ["/blogs/"] },
  { href: "/about", label: "このブログについて" },
  { href: "/profile", label: "プロフィール" },
];

export function Header() {
  return (
    <header className="border-t-4 border-slate-800 bg-base-100 shadow-sm">
      <div className="mx-auto max-w-6xl px-4">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <span
              aria-hidden
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-700 text-xl font-bold text-white"
            >
              m.
            </span>
            <span className="text-xl font-bold tracking-[0.2em]">MARGIN</span>
            <span aria-hidden className="h-5 w-px bg-base-300" />
            <span className="text-xs text-base-content/60">技術ブログ</span>
          </Link>

          <nav aria-label="メインナビゲーション" className="h-full">
            <ul className="flex h-full gap-6 text-sm">
              {NAV_ITEMS.map((item) => (
                <li key={item.href}>
                  <NavLink href={item.href} activePrefixes={item.activePrefixes}>
                    {item.label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <p className="border-t border-base-300 py-3 text-sm text-base-content/60">
          {CATCH_COPY.subtitle}
        </p>
      </div>
    </header>
  );
}
