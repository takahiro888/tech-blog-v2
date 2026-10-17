// microCMSのエンドポイント名。キャッシュのタグとWebhookの判定にも使う。
export const MICROCMS_ENDPOINTS = [
  "blogs",
  "profile",
  "about",
  "privacy-policy",
  "disclaimer",
] as const;

export type MicrocmsEndpoint = (typeof MICROCMS_ENDPOINTS)[number];

const REVALIDATE_SECONDS = 60 * 60; // 1時間

// SDKのcustomRequestInitに渡すfetchのキャッシュ設定
export function buildCacheOptions(endpoint: MicrocmsEndpoint) {
  return {
    next: {
      revalidate: REVALIDATE_SECONDS,
      tags: [endpoint],
    },
  };
}
