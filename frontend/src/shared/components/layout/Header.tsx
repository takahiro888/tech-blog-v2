import Image from "next/image";
import Link from "next/link";
import { NavLink } from "@/shared/components/layout/NavLink";
import { MobileMenu } from "@/shared/components/layout/MobileMenu";
import { CATCH_COPY } from "@/shared/lib/constants";

const NAV_ITEMS = [
  { href: "/", label: "記事一覧", activePrefixes: ["/blogs/"] },
  { href: "/about", label: "このブログについて" },
  { href: "/profile", label: "プロフィール" },
];

export function Header() {
  return (
    // ヘッダーが1段に収まるので、スマホでも上部に固定してよい（lg:sticky lg:top-0 → sticky top-0）
    <header className="sticky top-0 z-50 border-t-4 border-t-slate-800 border-b border-b-base-300 bg-base-100 shadow-sm">
      <div className="flex items-center justify-between gap-4 px-4 py-3 sm:px-8 lg:px-16 lg:py-6">
        <div>
          <Link href="/" className="flex items-center gap-2 lg:gap-3">
            <Image
              src="/logo.svg"
              alt=""
              width={40}
              height={40}
              priority
              className="size-8 lg:size-10"
            />
            <span className="text-lg font-bold tracking-[0.2em] lg:text-xl">
              KAIZEN
            </span>
            <span aria-hidden className="h-4 w-px bg-base-300 lg:h-5" />
            <span className="text-[10px] text-base-content/60 lg:text-xs">
              技術ブログ
            </span>
          </Link>
          {/* スマホでは非表示 */}
          <p className="hidden pt-1 text-sm text-base-content/60 lg:block">
            {CATCH_COPY.subtitle}
          </p>
        </div>
        <nav aria-label="メインナビゲーション" className="hidden lg:block">
          <ul className="flex gap-6 text-sm">
            {NAV_ITEMS.map((item) => (
              <li key={item.href} className="whitespace-nowrap">
                <NavLink href={item.href} activePrefixes={item.activePrefixes}>
                  {item.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
        <MobileMenu navItems={NAV_ITEMS} />
      </div>
    </header>
  );
}
