import { FALLBACK_THUMBNAIL } from "@/shared/lib/constants";
import type { Article } from "@/shared/lib/types";

const QIITA_ITEMS_URL = "https://qiita.com/api/v2/items";

type QiitaItem = {
  title: string;
  url: string;
  created_at: string;
};

export async function GET() {
  const res = await fetch(QIITA_ITEMS_URL, {
    headers: {
      Authorization: `Bearer ${process.env.NEXT_PUBLIC_QIITA_API_KEY}`,
    },
    cache: "no-store",
  });

  if (!res.ok) {
    return Response.json(
      { message: "Qiita記事の取得に失敗しました" },
      { status: res.status },
    );
  }

  const items: QiitaItem[] = await res.json();

  const articles: Article[] = items.map((item) => ({
    title: item.title,
    date: item.created_at.slice(0, 10),
    url: item.url,
    thumbnail: FALLBACK_THUMBNAIL, // Qiita API does not provide a thumbnail, so this is left empty
  }));

  return Response.json(articles);
}
