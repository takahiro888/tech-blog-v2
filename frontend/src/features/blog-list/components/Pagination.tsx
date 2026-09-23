import Link from "next/link";

type PaginationProps = {
  currentPage: number;
  totalPages: number;
  buildHref: (page: number) => string;
};

function NavButton({
  href,
  disabled,
  children,
}: {
  href: string;
  disabled: boolean;
  children: React.ReactNode;
}) {
  if (disabled) {
    return (
      <span className="btn btn-sm btn-disabled" aria-disabled="true">
        {children}
      </span>
    );
  }
  return (
    <Link href={href} className="btn btn-sm btn-outline">
      {children}
    </Link>
  );
}

export function Pagination({
  currentPage,
  totalPages,
  buildHref,
}: PaginationProps) {
  if (totalPages <= 1) {
    return null;
  }
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);
  return (
    <nav
      className="flex items-center justify-center gap-2"
      aria-label="ページネーション"
    >
      <NavButton href={buildHref(currentPage - 1)} disabled={currentPage === 1}>
        前へ
      </NavButton>
      {pages.map((page) => (
        <Link
          key={page}
          href={buildHref(page)}
          aria-current={page === currentPage ? "page" : undefined}
          className={`btn btn-sm ${
            page === currentPage ? "bg-blue-900 text-white" : "btn-outline"
          }`}
        >
          {page}
        </Link>
      ))}
      <NavButton
        href={buildHref(currentPage + 1)}
        disabled={currentPage === totalPages}
      >
        次へ
      </NavButton>
    </nav>
  );
}
