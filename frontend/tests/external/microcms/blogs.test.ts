import { describe, it, vi, expect } from "vitest";

vi.mock("@/external/microcms/client", () => ({
  microcmsClient: {
    getAllContents: vi.fn().mockResolvedValue([]),
    getListDetail: vi.fn().mockResolvedValue({ id: "1" }),
  },
}));

import { getBlogDetail, getBlogList } from "@/external/microcms/blogs";
import { microcmsClient } from "@/external/microcms/client";

describe("getBlogList", () => {
  it("blogsエンドポイントを指定してSDKを呼ぶ", async () => {
    await getBlogList();
    expect(microcmsClient.getAllContents).toHaveBeenCalledWith({ endpoint: "blogs" });
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
