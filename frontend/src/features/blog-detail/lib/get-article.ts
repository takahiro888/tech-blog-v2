import { getBlogDetail } from "@/external/microcms/blogs";
import { cache } from "react";

// generateMetadataとページ本体で同じ記事を2回取得しないよう、リクエスト内でメモ化する
export const getArticle = cache(getBlogDetail);
