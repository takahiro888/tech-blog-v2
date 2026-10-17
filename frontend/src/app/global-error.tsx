"use client";

import { useEffect } from "react";
import { SITE_NAME } from "@/shared/lib/constants";

type GlobalErrorProps = {
  error: Error & { digest?: string };
  retry: () => void;
};

export default function GlobalErrorPage({ error, retry }: GlobalErrorProps) {
  useEffect(() => {
    // 開発者ツールで追えるようにする
    console.error(error);
  }, [error]);

  // layout.tsxの代わりに描画されるため、html・bodyを自分で持つ
  return (
    <html lang="ja">
      <body className="flex min-h-screen items-center justify-center bg-base-100 px-4">
        {/* metadataのexportが使えないため、Reactのtitle要素でタイトルを付ける */}
        <title>{`エラーが発生しました | ${SITE_NAME}`}</title>
        <div className="text-center">
          <h1 className="text-2xl font-bold">エラーが発生しました</h1>
          <p className="mt-4 text-base-content/70">
            時間をおいて、もう一度お試しください。
          </p>
          <button
            type="button"
            onClick={() => retry()}
            className="btn btn-primary mt-8"
          >
            もう一度読み込む
          </button>
        </div>
      </body>
    </html>
  );
}
