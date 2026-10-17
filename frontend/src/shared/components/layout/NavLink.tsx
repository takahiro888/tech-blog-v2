"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

type NavLinkProps = {
  href: string;
  children: ReactNode;
  activePrefixes?: string[];
  onClick?: () => void;
};

export function NavLink({ href, children, activePrefixes = [], onClick }: NavLinkProps) {
  const pathname = usePathname();
  const active =
    pathname === href || activePrefixes.some((prefix) => pathname.startsWith(prefix));

  return (
    <Link
      href={href}
      onClick={onClick}
      aria-current={active ? "page" : undefined}
      className={
        active
          ? "border-b-2 border-blue-700 pb-1 font-bold text-blue-700"
          : "border-b-2 border-transparent pb-1 hover:text-blue-700"
      }
    >
      {children}
    </Link>
  );
}
