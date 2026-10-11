export function getSiteUrl(): string {
  const siteUrl = process.env.SITE_URL;
  if (!siteUrl) {
    throw new Error("環境変数 SITE_URL が設定されていません");
  }
  return siteUrl;
}

export function buildAbsoluteUrl(path: string): string {
  return new URL(path, getSiteUrl()).toString();
}
