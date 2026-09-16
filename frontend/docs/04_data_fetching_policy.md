# データ取得方針

参考記事の「Server-firstなデータフェッチ」を、本プロジェクトの規模に合わせて採用する。TanStack Query + HydrationBoundaryという構成は、クライアント側の複雑な状態管理（ミューテーション、楽観的更新等）を伴うアプリ向けの手段であり、読み取り専用のブログには過剰と判断して採用しない。代わりに、Next.js 16のServer Components中心の設計に寄せる。

## 現状の課題

`components/ArticleGrid.tsx`は`"use client"`で、`useEffect`内で`fetch`している。

```tsx
"use client";

export function ArticleGrid({ fetchUrl, ... }: ArticleGridProps) {
  const [articles, setArticles] = useState<Article[]>([]);

  useEffect(() => {
    fetch(fetchUrl)
      .then((res) => res.json())
      .then((data: Article[]) => setArticles(data));
  }, [fetchUrl]);
  // ...
}
```

この実装には以下の課題がある。

- 初回表示時にクライアントでのfetchを待つ必要があり、SSRの恩恵（初期表示の速さ、SEO）を活かせていない
- `app/api/blogs/route.ts`という内部API Routeを経由しており、二重のネットワークホップが発生している（ブラウザ → 自サーバーのAPI Route → microCMS）
- Qiita記事一覧については`fetchUrl`にQiitaのURLを直接渡して取得していた（外部APIをクライアントから直接叩く形で、CORSやAPIキーの扱い的にも本来サーバー側で行うべき実装だった。今回はQiita連携自体がスコープ外化されたため、この問題は実装の削除とともに解消される）

## 目標: Server Componentでのデータ取得

一覧・検索・カテゴリフィルタを含まない「静的な表示」部分はServer Componentで完結させる。

```tsx
// app/page.tsx（イメージ）
import { getBlogList } from "@/external/microcms/blogs";
import { ArticleGrid } from "@/features/blog-list/components/ArticleGrid";

export default async function Home() {
  const { contents } = await getBlogList();

  return (
    <div>
      <ArticleGrid articles={contents} />
    </div>
  );
}
```

`ArticleGrid`はデータ取得をやめ、propsで受け取ったデータを表示するだけの責務に絞る。「もっと見る」のような表示件数の切り替えだけなら、クライアント側は表示件数の状態管理のみを持てばよい。

```tsx
// features/blog-list/components/ArticleGrid.tsx（イメージ）
"use client";

import { useState } from "react";
import type { Blog } from "@/external/microcms/types";
import { ArticleCard } from "./ArticleCard";

export function ArticleGrid({ articles }: { articles: Blog[] }) {
  const [showAll, setShowAll] = useState(false);
  const visible = showAll ? articles : articles.slice(0, 6);

  return (
    <div>
      {visible.map((article) => (
        <ArticleCard key={article.id} article={article} />
      ))}
      {!showAll && articles.length > 6 && (
        <button onClick={() => setShowAll(true)}>もっと見る</button>
      )}
    </div>
  );
}
```

## カテゴリフィルタ・検索の扱い

モックのカテゴリタブや検索ボックスは、以下2案のどちらかで実装できる。

### 案A: クライアント側フィルタ（実装が簡単、データ量が少ないうちはこちらで十分）

- Server Componentで全件取得し、propsとして渡す
- タブ選択・検索文字列の入力はクライアント側の状態として持ち、渡された配列をJS側でフィルタする

### 案B: URLの`searchParams`でサーバー側フィルタ（記事数が増えたら移行）

- `/blogs?category=react&q=hooks`のようにURLに条件を持たせる
- ページ（Server Component）が`searchParams`を受け取り、microCMSのフィルタクエリ（`filters`パラメータ）で絞り込んだ結果を取得する
- URLが状態を表現するため、共有・ブラウザバックにも強い

現状の記事数（6件程度）では案Aで十分。記事が増えてきたタイミングで案Bへの移行を検討する、という2段階の方針を推奨する。

## キャッシュ戦略（任意・発展）

Next.js 16では`cacheComponents: true`（`next.config.ts`）を有効にすると、`"use cache"`ディレクティブでデータ取得結果のキャッシュ期間を明示的に制御できる（現状の`next.config.ts`では未設定）。

```ts
// external/microcms/blogs.ts（イメージ、Cache Components有効時）
import { cacheLife, cacheTag } from "next/cache";

export async function getBlogList() {
  "use cache";
  cacheLife("hours");
  cacheTag("blogs");

  return microcmsClient.getList<Blog>({ endpoint: "blogs" });
}
```

microCMSの記事更新頻度はそれほど高くないと想定されるため、`cacheLife("hours")`程度の緩やかなキャッシュで十分機能する。`cacheComponents`を有効化するかどうかは、他のNext.js 16特有の挙動（Suspenseの扱い、ビルド時の検証が厳しくなる点）も理解した上で判断した方がよいため、**このドキュメントでは方針の提示に留め、有効化の判断はご自身で行ってください**。有効化しない場合でも、Server Component + `external`層への切り出しというここまでの方針はそのまま活かせる。
