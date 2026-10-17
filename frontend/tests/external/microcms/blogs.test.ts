import { describe, it, vi, expect } from "vitest";
import { getBlogDetail, getBlogList } from "@/external/microcms/blogs";
import { microcmsClient } from "@/external/microcms/client";

vi.mock("@/external/microcms/client", () => ({
  microcmsClient: {
    getAllContents: vi.fn().mockResolvedValue([]),
    getListDetail: vi.fn().mockResolvedValue({ id: "1" }),
  },
}));

const CACHE_OPTIONS = { next: { revalidate: 3600, tags: ["blogs"] } };

function createMicroCMSError(status: number) {
  return Object.assign(
    new Error(`fetch API responsestatus status: ${status}`),
    {
      status,
      url: "https://example.microcms.io/api/v1/blogs/abc123",
      originalError: undefined,
    },
  );
}

describe("getBlogList", () => {
  it("blogsエンドポイントを指定してSDKを呼ぶ", async () => {
    await getBlogList();
    expect(microcmsClient.getAllContents).toHaveBeenCalledWith({
      endpoint: "blogs",
      customRequestInit: CACHE_OPTIONS,
    });
  });
});

describe("getBlogDetail", () => {
  it("blogsエンドポイントとcontentIDを指定してSDKを呼ぶ", async () => {
    await getBlogDetail("abc123");
    expect(microcmsClient.getListDetail).toHaveBeenCalledWith({
      endpoint: "blogs",
      contentId: "abc123",
      customRequestInit: CACHE_OPTIONS,
    });
  });

  it("microCMSが404を返したらnullを返す", async () => {
    vi.mocked(microcmsClient.getListDetail).mockRejectedValueOnce(
      createMicroCMSError(404),
    );
    await expect(getBlogDetail("missing")).resolves.toBeNull();
  });

  it("404以外のエラーはそのまま投げる", async () => {
    vi.mocked(microcmsClient.getListDetail).mockRejectedValueOnce(
      createMicroCMSError(500),
    );
    await expect(getBlogDetail("abc123")).rejects.toThrow("500");
  });
});
