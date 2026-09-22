# データ取得方針

参考記事の「Server-firstなデータフェッチ」を、本プロジェクトの規模に合わせて採用する。TanStack Query + HydrationBoundaryという構成は、クライアント側の複雑な状態管理（ミューテーション、楽観的更新等）を伴うアプリ向けの手段であり、読み取り専用のブログには過剰と判断して採用しない。代わりに、Next.js 16のServer Components中心の設計に寄せる。

> 記事一覧ページ（`/blogs`）は廃止し、トップページ（`/`）が記事一覧を兼ねることになった（[docs/global_design/01_requirements.md](../../docs/global_design/01_requirements.md)）。以下の方針は`app/page.tsx`にそのまま適用する。

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

`ArticleGrid`はデータ取得をやめ、propsで受け取ったデータを表示するだけの責務に絞る。旧案の「もっと見る」ボタンはページネーション（件数表示・表示件数セレクト・ページ番号）に置き換わった（[docs/global_design/04_ui_design.md](../../docs/global_design/04_ui_design.md)の「5.2.1 ページネーション」参照）。クライアント側は「現在のカテゴリ・検索語・月・ページ・表示件数」という状態だけを持ち、絞り込み＋ページ分割はpropsで渡された全件配列に対して純粋関数（[docs/global_design/05_domain_design.md](../../docs/global_design/05_domain_design.md)の`filterArticles`・`paginate`）を適用して計算する。

```tsx
// features/blog-list/components/ArticleGrid.tsx（イメージ）
"use client";

import { useState } from "react";
import type { Blog } from "@/external/microcms/types";
import { ArticleCard } from "./ArticleCard";
import { Pagination } from "./Pagination";
import { PageSizeSelect } from "./PageSizeSelect";
import { filterArticles } from "../lib/filter";
import { paginate, getPageRange } from "../lib/paginate";

const PAGE_SIZE_OPTIONS = [10, 20, 30] as const;

export function ArticleGrid({ articles }: { articles: Blog[] }) {
  const [category, setCategory] = useState<string>();
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState<number>(PAGE_SIZE_OPTIONS[0]);

  const filtered = filterArticles(articles, { category, q });
  const visible = paginate(filtered, { page, pageSize });
  const { start, end } = getPageRange(page, pageSize, filtered.length);

  // カテゴリ・検索・表示件数を変えたら1ページ目に戻す
  const resetToFirstPage = () => setPage(1);

  return (
    <div>
      <div className="flex items-center justify-between">
        <p>
          {filtered.length}件中 {start}〜{end}件を表示
        </p>
        <PageSizeSelect
          value={pageSize}
          options={PAGE_SIZE_OPTIONS}
          onChange={(size) => {
            setPageSize(size);
            resetToFirstPage();
          }}
        />
      </div>
      {visible.map((article) => (
        <ArticleCard key={article.id} article={article} />
      ))}
      <Pagination
        page={page}
        totalPages={Math.ceil(filtered.length / pageSize)}
        onChange={setPage}
      />
    </div>
  );
}
```

- 上記はイメージであり、実際にはカテゴリ・検索と同様に`page`/`pageSize`もURL（`searchParams`）へ同期させ、共有・ブラウザバックに対応させる（[docs/global_design/04_ui_design.md](../../docs/global_design/04_ui_design.md)の「5.5 URLパラメータ」参照）。同期方法は`useSearchParams` + `router.replace`（スクロール位置を保つため`scroll: false`推奨）などが候補になる
- ページ・ページサイズをURLに持たせるかクライアントの`useState`のみに留めるかは実装時の判断だが、**全件をトップページ1つで閲覧できるようになった分、URLでの共有価値が上がっている**ため、同期を推奨する

## カテゴリフィルタ・検索・ページネーションの扱い

モックのカテゴリタブ・検索ボックス・ページネーション（件数表示・表示件数セレクト・ページ番号）は、以下2案のどちらかで実装できる。トップページ（`/`）が記事一覧を兼ねるようになったため、いずれの案でも対象は`app/page.tsx`になる。

### 案A: クライアント側フィルタ・ページ分割（実装が簡単、データ量が少ないうちはこちらで十分）

- Server Componentで全件取得し、propsとして渡す
- タブ選択・検索文字列・ページ番号・表示件数はクライアント側の状態として持ち、渡された配列をJS側でフィルタ＋ページ分割する（`filterArticles` → `paginate`）
- 状態をURLの`searchParams`（`category` / `q` / `month` / `page` / `pageSize`）へ同期させることは、この案のままでも可能。「計算をどこでやるか」と「状態をURLに表すか」は別軸であり、案Aでも`useSearchParams` + `router.replace`でURL同期だけ行える

### 案B: URLの`searchParams`でサーバー側フィルタ・ページ取得（記事数が増えたら移行）

- `/?category=react&q=hooks&page=2&pageSize=10`のようにURLに条件を持たせる
- ページ（Server Component）が`searchParams`を受け取り、microCMSのフィルタクエリ（`filters`パラメータ）と`limit`/`offset`で、該当ページ分のみをmicroCMSから取得する
- 1回のAPI呼び出しで全件を取得できなくなった場合（100件超）や、取得コストを下げたい場合に移行する

現状の記事数（6件程度、モックでのページネーション確認用ダミーは30件）では案Aで十分。記事が増えてきたタイミングで案Bへの移行を検討する、という2段階の方針を推奨する。

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
