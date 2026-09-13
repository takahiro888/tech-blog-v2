import Image from "next/image";
import type { Article } from "../lib/types";
import { FALLBACK_THUMBNAIL } from "../lib/constants";
import Link from "next/link";

export function ArticleCard({ article }: { article: Article }) {
  return (
    <Link
      href={article.url}
      target="_blank"
      rel="noopener noreferrer"
      className="card bg-base-100 shadow-md transition-shadow hover:shadow-xl"
    >
      <figure>
        <Image
          src={article.thumbnail || FALLBACK_THUMBNAIL}
          alt={article.title}
          className="h-40 w-full object-cover"
          width={400}
          height={160}
        />
      </figure>
      <div className="card-body">
        <h2 className="card-title text-base">{article.title}</h2>
        <p className="text-sm text-base-content/60">{article.date}</p>
      </div>
    </Link>
  );
}
