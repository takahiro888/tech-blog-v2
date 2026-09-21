import { describe, it, vi, expect } from "vitest";

vi.mock("@/external/microcms/client", () => ({
  microcmsClient: {
    getList: vi.fn().mockResolvedValue({ contents: [], totalCount: 0 }),
    getListDetail: vi.fn().mockResolvedValue({ id: "1" }),
  },
}));

import { getBlogDetail, getBlogList } from "@/external/microcms/blogs";
import { microcmsClient } from "@/external/microcms/client";

describe("getBlogList", () => {
  it("blogsエンドポイントを指定してSDKを呼ぶ", async () => {
    await getBlogList();
    expect(microcmsClient.getList).toHaveBeenCalledWith({ endpoint: "blogs" });
  });
});

describe("getBlogDetail", () => {
  it("blogsエンドポイントとcontentIDを指定してSDKを呼ぶ", async () => {
    await getBlogDetail("abc123");
    expect(microcmsClient.getListDetail).toHaveBeenCalledWith({
      endpoint: "blogs",
      contentId: "abc123",
    });
  });
});
