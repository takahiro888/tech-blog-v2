const SECRET = "test-secret";
const BODY = JSON.stringify({ api: "blogs", type: "edit" });

import { createHmac } from "crypto";
import { describe, it, expect } from "vitest";
import {
  verifyWebhookSignature,
  resolveRevalidateTag,
} from "@/external/microcms/webhook";

function sign(body: string) {
  return createHmac("sha256", SECRET).update(body).digest("hex");
}

describe("verifyWebhookSignature", () => {
  it("正しい署名ならtrue", () => {
    expect(verifyWebhookSignature(BODY, sign(BODY), SECRET)).toBe(true);
  });
  it("署名がなければfalse", () => {
    expect(verifyWebhookSignature(BODY, null, SECRET)).toBe(false);
  });
  it("長さの違う署名でも例外にならずfalse", () => {
    expect(verifyWebhookSignature(BODY, "short", SECRET)).toBe(false);
  });
});

describe("resolveRevalidateTag", () => {
  it("許可したエンドポイント名ならそれを返す", () => {
    expect(resolveRevalidateTag({ api: "blogs" })).toBe("blogs");
  });
  it("許可リストになければnull", () => {
    expect(resolveRevalidateTag({ api: "unKnown" })).toBeNull();
  });
  it("オブジェクトでなければnull", () => {
    expect(resolveRevalidateTag(null)).toBeNull();
    expect(resolveRevalidateTag("blogs")).toBeNull();
  });
});
