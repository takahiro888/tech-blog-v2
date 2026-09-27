import Image from "next/image";
import Link from "next/link";
import type { Profile } from "@/external/microcms/types";

export function AuthorCard({ profile }: { profile: Profile }) {
  return (
    <section className="rounded-lg border border-base-300 p-6 text-center">
      <h2 className="mb-4 text-left text-sm font-bold">プロフィール</h2>
      {profile.avatar ? (
        <Image
          src={profile.avatar.url}
          width={64}
          height={64}
          alt=""
          className="mx-auto mb-3 size-16 rounded-full object-cover"
        />
      ) : (
        <div className="mx-auto mb-3 flex size-16 items-center justify-center rounded-full bg-blue-100 text-2xl font-bold text-blue-700">
          m_
        </div>
      )}
      <p className="font-bold">{profile.name}</p>
      <p className="mb-3 text-xs text-base-content/60">{profile.role}</p>
      <p className="mb-4 whitespace-pre-line text-xs leading-relaxed text-base-content/60">
        {profile.bio}
      </p>
      <Link href="/profile" className="btn btn-outline btn-sm">
        more
      </Link>
    </section>
  );
}
