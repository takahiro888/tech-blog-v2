import { getBlogDetail } from "@/external/microcms/blogs";
import { cache } from "react";

// generateMetadataとページ本体で同じ記事を2回取得しないよう、リクエスト内でメモ化する
// 記事が存在しない・取得に失敗した場合はnullを返す
export const getArticle = cache((id: string) =>
  getBlogDetail(id).catch(() => null),
);
