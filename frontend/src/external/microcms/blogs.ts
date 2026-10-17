import { isMicroCMSRequestError } from "microcms-js-sdk";
import { microcmsClient } from "./client";
import { buildCacheOptions } from "./endpoints";
import type { Blog } from "./types";

export function getBlogList() {
  return microcmsClient.getAllContents<Blog>({ endpoint: "blogs", customRequestInit: buildCacheOptions("blogs") });
}

// 記事が存在しない時だけnullを返す
export async function getBlogDetail(contentId: string) {
  try {
    return await microcmsClient.getListDetail<Blog>({
      endpoint: "blogs",
      contentId,
      customRequestInit: buildCacheOptions("blogs"),
    });
  } catch (error) {
    if (isMicroCMSRequestError(error) && error.status === 404) {
      return null;
    }
    throw error;
  }
}
