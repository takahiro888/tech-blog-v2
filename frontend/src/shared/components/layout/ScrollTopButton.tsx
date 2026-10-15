"use client";

import { useSyncExternalStore } from "react";

const SHOW_THRESHOLD_PX = 400;

function subscribeScroll(onChange: () => void) {
  window.addEventListener("scroll", onChange, { passive: true });
  return () => {
    window.removeEventListener("scroll", onChange);
  };
}

function getIsScrolled() {
  return window.scrollY > SHOW_THRESHOLD_PX;
}

// サーバーで描画するときはwindowが存在しないため、非表示として扱う
function getIsScrolledOnServer() {
  return false;
}

export function ScrollTopButton() {
  const isScrolled = useSyncExternalStore(
    subscribeScroll,
    getIsScrolled,
    getIsScrolledOnServer,
  );

  // 非表示にTabキーでフォーカスが当たらないよう、隠すのではなく描画しない
  if (!isScrolled) return null;

  const scrollToTop = () => {
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    window.scrollTo({
      top: 0,
      behavior: prefersReducedMotion ? "auto" : "smooth",
    });
  };

  return (
    <button
      type="button"
      onClick={scrollToTop}
      aria-label="ページの先頭へ戻る"
      className="fixed right-6 bottom-6 z-40 flex size-12 items-center justify-center rounded-full bg-slate-800 text-white shadow-lg hover:bg-slate-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700"
    >
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        className="size-5"
      >
        <path d="m18 15-6-6-6 6" />
      </svg>
    </button>
  );
}
