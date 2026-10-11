export type ShareService = "x" | "facebook" | "hatena";

export type ShareLink = {
  service: ShareService;
  label: string;
  href: string;
};

function buildUrlWithParams(
  baseUrl: string,
  params: Record<string, string>,
): string {
  const url = new URL(baseUrl);
  Object.entries(params).forEach(([key, value]) => {
    url.searchParams.set(key, value);
  });
  return url.toString();
}

export function buildShareLinks(
  articleUrl: string,
  title: string,
): ShareLink[] {
  return [
    {
      service: "x",
      label: "X（Twitter）でシェアする",
      href: buildUrlWithParams("https://x.com/intent/post", {
        text: `${title}\n${articleUrl}`,
      }),
    },
    {
      service: "facebook",
      label: "Facebookでシェアする",
      // Facebookはタイトルを受け取らず、記事ページのOGPから取得する
      href: buildUrlWithParams("https://www.facebook.com/sharer/sharer.php", {
        u: articleUrl,
      }),
    },
    {
      service: "hatena",
      label: "はてなブックマークに追加する",
      href: buildUrlWithParams("https://b.hatena.ne.jp/add", {
        mode: "confirm",
        url: articleUrl,
        title,
      }),
    },
  ];
}
