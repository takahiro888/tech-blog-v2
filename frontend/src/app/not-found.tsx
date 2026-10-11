import Link from "next/link";
import { PageTitle } from "@/shared/components/PageTitle";

export default function NotFound() {
  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-20 text-center">
      <PageTitle>ページが見つかりませんでした</PageTitle>
      <p className="text-base-content/70">
        お探しのページは削除されたか、URLが間違っている可能性があります。
      </p>
      <Link href="/" className="btn btn-primary mt-8">
        HOMEへ戻る
      </Link>
    </div>
  );
}
