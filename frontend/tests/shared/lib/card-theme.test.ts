import { getCardTheme } from "@/shared/lib/card-theme";
import { describe, it, expect } from "vitest";

describe("getCardTheme", () => {
  it("先頭のカテゴリに対応するテーマを返す", () => {
    expect(getCardTheme(["TypeScript"])).toBe("dark");
  });

  it("2番目以降のカテゴリは無視する", () => {
    expect(getCardTheme(["Git", "React"])).toBe("black");
  });

  it("カテゴリが空・未指定なら既定テーマを返す", () => {
    expect(getCardTheme([])).toBe("blue");
    expect(getCardTheme()).toBe("blue");
  });

  it("Object.prototypeのプロパティ名でも既定テーマを返す", () => {
    expect(getCardTheme(["constructor"])).toBe("blue");
  });
});
