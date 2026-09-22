import { AUTHOR } from "../../../shared/lib/constants";
import Link from "next/link";

export function AuthorCard() {
  return (
    <section className="rounded-lg border border-base-300 p-6 text-center">
      <h2 className="mb-4 text-left text-sm font-bold">プロフィール</h2>
      <div className="mx-auto mb-3 flex size-16 items-center justify-center rounded-full bg-blue-100 text-2xl font-bold text-blue-700">
        m_
      </div>
      <p className="font-bold">{AUTHOR.name}</p>
      <p className="mb-3 text-xs text-base-content/60">{AUTHOR.role}</p>
      <p className="mb-4 text-xs leading-relaxed text-base-content/60">
        {AUTHOR.bio}
      </p>
      <Link href="/profile" className="btn btn-outline btn-sm">
        more
      </Link>
    </section>
  );
}
