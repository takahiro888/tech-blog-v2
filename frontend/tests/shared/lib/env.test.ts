import { getRequiredEnv } from "@/shared/lib/env";
import { afterEach, describe, expect, it, vi } from "vitest";


// server-onlyはテスト環境で読み込むとエラーになるため、空のモジュールに差し替える。
vi.mock("server-only", () => ({}));

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("getRequiredEnv", () => {
it("設定されていれば値を返す", () => {
  vi.stubEnv("TEST_REQUIRED_ENV", "value");
  expect(getRequiredEnv("TEST_REQUIRED_ENV")).toBe("value");
});
it("未設定なら変数名入りのエラーを投げる", () => {
  vi.stubEnv("TEST_REQUIRED_ENV", "");
  expect(() => getRequiredEnv("TEST_REQUIRED_ENV")).toThrow("環境変数 TEST_REQUIRED_ENV が設定されていません");
});
});