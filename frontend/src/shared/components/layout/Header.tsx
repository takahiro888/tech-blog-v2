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
    // スマホは2段で背が高くなるため、画面上部への固定はPCのみ
    <header className="z-50 border-t-4 border-t-slate-800 border-b border-b-base-300 bg-base-100 shadow-sm lg:sticky lg:top-0">
      <div className="flex flex-col gap-4 px-4 py-4 sm:px-8 lg:flex-row lg:items-center lg:justify-between lg:px-16 lg:py-6">
        <div>
          <Link href="/" className="flex items-center gap-3">
            <Image src="/logo.svg" alt="" width={40} height={40} priority />
            <span className="text-xl font-bold tracking-[0.2em]">KAIZEN</span>
            <span aria-hidden className="h-5 w-px bg-base-300" />
            <span className="text-xs text-base-content/60">技術ブログ</span>
          </Link>
          <p className="pt-1 text-xs text-base-content/60 sm:text-sm">
            {CATCH_COPY.subtitle}
          </p>
        </div>
        <nav aria-label="メインナビゲーション" className="overflow-x-auto">
          <ul className="flex gap-5 text-sm lg:gap-6">
            {NAV_ITEMS.map((item) => (
              <li key={item.href} className="whitespace-nowrap">
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
