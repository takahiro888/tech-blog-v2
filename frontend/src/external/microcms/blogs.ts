import { isMicroCMSRequestError } from "microcms-js-sdk";
import { microcmsClient } from "./client";
import type { Blog } from "./types";

export function getBlogList() {
  return microcmsClient.getAllContents<Blog>({ endpoint: "blogs" });
}

// 記事が存在しない時だけnullを返す
export async function getBlogDetail(contentId: string) {
  try {
    return await microcmsClient.getListDetail<Blog>({
      endpoint: "blogs",
      contentId,
    });
  } catch (error) {
    if (isMicroCMSRequestError(error) && error.status === 404) {
      return null;
    }
    throw error;
  }
}
