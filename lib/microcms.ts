import { createClient } from "microcms-js-sdk";
import type { Blog } from "./types";

export const client = createClient({
  serviceDomain: process.env.MICROCMS_SERVICE_DOMAIN || "",
  apiKey: process.env.MICROCMS_API_KEY || "",
});

export function getBlogList() {
  return client.getList<Blog>({ endpoint: "blogs" });
}

export function getBlogDetail(contentId: string) {
  return client.getListDetail<Blog>({ endpoint: "blogs", contentId });
}
