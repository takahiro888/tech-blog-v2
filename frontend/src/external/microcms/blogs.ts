import { microcmsClient } from "./client";
import type { Blog } from "./types";

export function getBlogList() {
  return microcmsClient.getList<Blog>({ endpoint: "blogs" });
}

export function getBlogDetail(contentId: string) {
  return microcmsClient.getListDetail<Blog>({ endpoint: "blogs", contentId });
}
