import { describe, it, expect } from "vitest";
import { isNew, formatPublishedDate } from "../../../src/shared/lib/published-at";

describe("isNew", () => {
  const now = new Date("2026-09-21T00:00:00.000Z");

  it("公開日から7日ちょうどは新着", () => {
    const publishedAt = "2026-09-14T00:00:00.000Z";
    expect(isNew(publishedAt, now)).toBe(true);
  });

  it("公開日から7日を1ミリ秒でも超えたら新着でない", () => {
    const publishedAt = "2026-09-13T23:59:59.999Z";
    expect(isNew(publishedAt, now)).toBe(false);
  });

  it("公開直後は新着", () => {
    const publishedAt = "2026-09-21T00:00:00.000Z";
    expect(isNew(publishedAt, now)).toBe(true);
  });

  it("未来の公開日時は新着でない", () => {
    const publishedAt = "2026-09-22T00:00:00.000Z";
    expect(isNew(publishedAt, now)).toBe(false);
  });

  it("daysを指定できる", () => {
    expect(isNew("2026-09-18T00:00:00.000Z", now, 3)).toBe(true);
    expect(isNew("2026-09-17T00:00:00.000Z", now, 3)).toBe(false);
  });
}); 

describe("formatPublishedDate", () => {

  it("YYYY.MM.DD 形式で返す", () => {
    expect(formatPublishedDate("2026-09-14T03:00:00.000Z")).toBe("2026.09.14");
  });

  it("UTCの日付またぎはJSTの日付で返す", () => {
    expect(formatPublishedDate("2026-09-13T16:00:00.000Z")).toBe("2026.09.14");
    expect(formatPublishedDate("2026-09-13T14:59:00.000Z")).toBe("2026.09.13");
  });

  it("月・日は2桁ゼロ埋め", () => {
    expect(formatPublishedDate("2026-01-05T00:00:00.000Z")).toBe("2026.01.05");
  });

  it("年またぎもJSTで判定する", () => {
    expect(formatPublishedDate("2025-12-31T16:00:00.000Z")).toBe("2026.01.01");
  });
});