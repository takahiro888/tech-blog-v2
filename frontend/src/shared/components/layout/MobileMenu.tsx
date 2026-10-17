"use client";

import { useRef } from "react";
import { SearchBox } from "@/features/sidebar/components/SearchBox";
import { NavLink } from "./NavLink";

type NavItem = { href: string; label: string; activePrefixes?: string[] };

export function MobileMenu({ navItems }: { navItems: NavItem[] }) {
  const searchRef = useRef<HTMLDialogElement>(null);
  const menuRef = useRef<HTMLDialogElement>(null);

  return (
    <div className="flex items-center gap-1 lg:hidden">
      <button
        type="button"
        aria-label="検索を開く"
        className="btn btn-ghost btn-square"
        onClick={() => searchRef.current?.showModal()}
      >
        {/* 虫眼鏡svg */}
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          className="size-6"
        >
          <circle cx="11" cy="11" r="7" />
          <path d="m20 20-3.5-3.5" />
        </svg>
      </button>
      <button
        type="button"
        aria-label="メニューを開く"
        className="btn btn-ghost btn-square"
        onClick={() => menuRef.current?.showModal()}
      >
        {/* 三本線svg */}
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          className="size-6"
        >
          <path d="M4 6h16M8 12h12M12 18h8" />
        </svg>
      </button>

      <dialog
        ref={searchRef}
        className="modal modal-bottom"
        aria-label="記事検索"
      >
        <div className="modal-box">
          <SearchBox />
          <form method="dialog" className="mt-4 flex justify-center">
            <button className="btn btn-ghost btn-square" aria-label="閉じる">
              {/* ×svg */}
              {/* × */}
              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
                className="size-6"
              >
                <path d="M6 6l12 12M18 6 6 18" />
              </svg>
            </button>
          </form>
        </div>
        {/* 背景をタップしたら閉じる */}
        <form method="dialog" className="modal-backdrop">
          <button>閉じる</button>
        </form>
      </dialog>

      <dialog ref={menuRef} className="modal modal-end" aria-label="メニュー">
        <div className="modal-box flex flex-col">
          <p className="bg-base-200 py-3 text-center tracking-[0.3em]">MENU</p>
          <nav aria-label="モバイルナビゲーション">
            <ul className="flex flex-col items-center gap-8 py-10">
              {navItems.map((item) => (
                <li key={item.href}>
                  <NavLink
                    href={item.href}
                    activePrefixes={item.activePrefixes}
                    onClick={() => menuRef.current?.close()}
                  >
                    {item.label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>
          <form method="dialog" className="mt-auto flex justify-center">
            <button className="btn btn-ghost btn-square" aria-label="閉じる">
              {/* ×svg */}
              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
                className="size-6"
              >
                <path d="M6 6l12 12M18 6 6 18" />
              </svg>
            </button>
          </form>
        </div>
        <form method="dialog" className="modal-backdrop">
          <button>閉じる</button>
        </form>
      </dialog>
    </div>
  );
}
