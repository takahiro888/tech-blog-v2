import Link from "next/link";
import { FOOTER_LINKS, COPYRIGHT } from "@/shared/lib/constants";

export function Footer() {
  return (
    <footer className="bg-slate-800 py-8 text-white">
      <nav aria-label="フッター">
        <ul className="flex flex-wrap justify-center gap-y-2 text-sm">
          {FOOTER_LINKS.map((link) => (
            <li
              key={link.href}
              className="not-first:before:mx-6 not-first:before:text-white/50 not-first:before:content-['|']"
            >
              <Link href={link.href} className="hover:underline">
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      <p className="mt-4 text-center text-xs text-white/70">{COPYRIGHT}</p>
    </footer>
  );
}
