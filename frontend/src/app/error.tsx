"use client"; // エラー画面はNext.jsの決まりでClient Componentにする必要があるため

import { useEffect } from "react";
import Link from "next/link";
import { PageTitle } from "@/shared/components/PageTitle";

type ErrorPageProps = {
  error: Error & { digest?: string };
  retry: () => void;
};

export default function ErrorPage({ error, retry }: ErrorPageProps) {
  useEffect(() => {
    // 開発者ツールで追えるようにする
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-20 text-center">
      <PageTitle>エラーが発生しました</PageTitle>
      <p className="text-base-content/70">
        ページの読み込み中に問題が発生しました。時間をおいて、もう一度お試しください。
      </p>
      <div className="mt-8 flex justify-center gap-4">
        <button
          type="button"
          onClick={() => retry()}
          className="btn btn-primary"
        >
          もう一度読み込む
        </button>
        <Link href="/" className="btn btn-outline">
          HOMEへ戻る
        </Link>
      </div>
    </div>
  );
}
