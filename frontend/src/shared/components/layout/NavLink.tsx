"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

type NavLinkProps = {
  href: string;
  children: ReactNode;
  /** href との完全一致に加えて、アクティブ扱いにしたいパスの接頭辞（例: ["/blogs/"]） */
  activePrefixes?: string[];
};

export function NavLink({ href, children, activePrefixes = [] }: NavLinkProps) {
  const pathname = usePathname();
  const active =
    pathname === href ||
    activePrefixes.some((prefix) => pathname.startsWith(prefix));

  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={
        active
          ? "flex h-full items-center border-b-2 border-blue-700 px-1 font-bold text-blue-700"
          : "flex h-full items-center border-b-2 border-transparent px-1 hover:text-blue-700"
      }
    >
      {children}
    </Link>
  );
}
