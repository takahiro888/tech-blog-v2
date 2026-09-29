import Image from "next/image";
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
    <header className="border-t-4 border-t-slate-800 border-b border-b-base-300 bg-base-100 shadow-sm">
      <div className="flex items-center justify-between px-16 py-6">
        <div>
          <Link href="/" className="flex items-center gap-3">
            <Image src="/logo.svg" alt="" width={40} height={40} priority />
            <span className="text-xl font-bold tracking-[0.2em]">KAIZEN</span>
            <span aria-hidden className="h-5 w-px bg-base-300" />
            <span className="text-xs text-base-content/60">技術ブログ</span>
          </Link>
          <p className="pt-3 text-sm text-base-content/60">
            {CATCH_COPY.subtitle}
          </p>
        </div>
        <nav aria-label="メインナビゲーション">
          <ul className="flex gap-6 text-sm">
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
    </header>
  );
}
