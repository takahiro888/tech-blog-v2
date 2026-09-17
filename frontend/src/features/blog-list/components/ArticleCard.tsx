import Image from "next/image";
import Link from "next/link";
import type { Blog } from "@/external/microcms/types";
import { FALLBACK_THUMBNAIL } from "@/shared/lib/constants";

export function ArticleCard({ article }: { article: Blog }) {
  return (
    <Link
      href={`/blogs/${article.id}`}
      className="card bg-base-100 shadow-md transition-shadow hover:shadow-xl"
    >
      <figure>
        <Image
          src={article.eyecatch?.url || FALLBACK_THUMBNAIL}
          alt={article.title}
          className="h-40 w-full object-cover"
          width={400}
          height={160}
        />
      </figure>
      <div className="card-body">
        <h2 className="card-title text-base">{article.title}</h2>
        <p className="text-sm text-base-content/60">
          {article.publishedAt.slice(0, 10)}
        </p>
      </div>
    </Link>
  );
}
