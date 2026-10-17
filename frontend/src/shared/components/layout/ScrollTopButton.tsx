"use client";

export function ScrollTopButton() {
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
      className="fixed right-6 bottom-6 z-40 flex size-12 items-center justify-center rounded-full border-2 border-slate-300 bg-white text-slate-400 shadow-md hover:border-slate-400 hover:text-slate-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700"
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
