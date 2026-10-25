# データ取得方針

参考記事の「Server-firstなデータフェッチ」を、本プロジェクトの規模に合わせて採用する。TanStack Query + HydrationBoundaryという構成は、クライアント側の複雑な状態管理（ミューテーション、楽観的更新等）を伴うアプリ向けの手段であり、読み取り専用のブログには過剰と判断して採用しない。代わりに、Next.js 16のServer Components中心の設計に寄せる。

> 記事一覧ページ（`/blogs`）は廃止し、トップページ（`/`）が記事一覧を兼ねている（[docs/global_design/01_requirements.md](../../docs/global_design/01_requirements.md)）。以下の方針は`app/page.tsx`に適用している。

## 移行前の課題（解消済み）

移行前の`components/ArticleGrid.tsx`は`"use client"`で、`useEffect`内で`fetch`していた。

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

この実装には以下の課題があった。

- 初回表示時にクライアントでのfetchを待つ必要があり、SSRの恩恵（初期表示の速さ、SEO）を活かせていなかった
- `app/api/blogs/route.ts`という内部API Routeを経由しており、二重のネットワークホップが発生していた（ブラウザ → 自サーバーのAPI Route → microCMS）
- Qiita記事一覧については`fetchUrl`にQiitaのURLを直接渡して取得していた（外部APIをクライアントから直接叩く形で、本来サーバー側で行うべき実装だった。Qiita連携自体がスコープ外化されたため、実装の削除とともに解消した）

## 現在の方式: Server Componentで取得し、サーバーで絞り込む

データの取得も、絞り込み・ページ分割の計算も、すべてServer Componentの中で行う。クライアントには計算済みのHTMLだけが届く。

```tsx
// app/page.tsx（抜粋）
export default async function Home({ searchParams }: HomeProps) {
  const rawSearchParams = await searchParams;
  const contents = await getBlogList(); // 全件（キャッシュ付き）

  const query = parseArticlesSearchParams(rawSearchParams);
  const filteredArticles = filterArticles(contents, query);
  const pagination = paginateArticles(filteredArticles, query.page, query.pageSize);

  return (
    <SidebarLayout articles={contents} searchKeyword={query.keyword}>
      <ResultSummary {...} />
      <PageSizeSelect value={query.pageSize} />
      <ArticleGrid articles={pagination.items} />
      <Pagination
        currentPage={pagination.currentPage}
        totalPages={pagination.totalPages}
        buildHref={(page) => buildArticlesHref(query, page)}
      />
    </SidebarLayout>
  );
}
```

- 絞り込み・ページ分割の状態（`category` / `keyword` / `month` / `page` / `pageSize`）は、すべてURLの`searchParams`で持つ。共有・ブックマーク・ブラウザの戻る操作にそのまま対応できる（[docs/global_design/04_ui_design.md](../../docs/global_design/04_ui_design.md)の「5.5 URLパラメータ」参照）
- 状態の変更は、ほぼすべてページ遷移で表す。サイドバーのカテゴリー・アーカイブと`Pagination`は`next/link`のリンク、検索ボックスは`<form method="GET">`の送信。Client Componentは表示件数セレクト（`PageSizeSelect`。選択時に`router.push`）だけ
- `ArticleGrid`はデータ取得をやめ、propsで受け取った「そのページの記事」を並べるだけの責務に絞った。旧案の「もっと見る」ボタンはページネーションに置き換わった
- 計算は純粋関数（`features/blog-list/lib/filter-articles.ts`）にまとめ、テストしている（[docs/global_design/05_domain_design.md](../../docs/global_design/05_domain_design.md)参照）
- サイドバーの集計にも同じ全件配列を使う。トップページは取得済みの`contents`を`SidebarLayout`に渡し、二重に取得しない（他のページでは`SidebarLayout`が自分で取得する。キャッシュが効くので通信は増えない）

### 検討した案と採用理由

当初は次の2案で検討していた。

| 案 | 内容 | 判断 |
|---|---|---|
| 案A: クライアント側で絞り込み | 全件をpropsで渡し、カテゴリ・検索語・ページ番号をクライアントの状態（`useState`）として持ってJS側で絞り込む | **不採用**。URLとの同期（`useSearchParams`＋`router.replace`）が別途必要になり、絞り込みのたびにクライアントで再計算する分、Client Componentが大きくなる |
| 案A'（採用）: 全件取得＋サーバー側で絞り込み | 全件をServer Componentで取得し、`searchParams`に応じてサーバーで絞り込み・ページ分割する | **採用**。状態がURLだけで決まるので同期の処理が不要。全件取得はキャッシュされるので、絞り込みのたびにmicroCMSへ問い合わせることもない |
| 案B: microCMS側で絞り込み | `searchParams`をmicroCMSの`filters`・`limit`/`offset`に変換し、該当ページ分だけを取得する | **将来検討**。記事数が増えて全件取得の負担が大きくなったら移行する。サイドバーの集計用に全件（またはカテゴリ・月の件数）が別途必要になる点に注意 |

現状の記事数では案A'で十分。案Bへ移行する場合も、変更は`external/microcms/blogs.ts`の取得関数と`app/page.tsx`の組み立てに限られる。

## キャッシュ戦略

**決定: Cache Componentsは有効にせず、fetch単位のキャッシュ（`next.revalidate`・`next.tags`）とmicroCMSのWebhookによる再検証を使う。** 詳細な仕様は[global_design/07_api_design.md](../../docs/global_design/07_api_design.md)の「5. 再検証」、ページごとのレンダリング方式は[06_rendering_strategy.md](./06_rendering_strategy.md)。

| 案 | 内容 | 判断 |
|---|---|---|
| Cache Components（`cacheComponents: true` + `"use cache"` + `cacheLife` / `cacheTag`） | Next.js 16の新方式。関数やコンポーネント単位でキャッシュを宣言する | **不採用**。有効化すると、キャッシュされないデータ（`searchParams`等）に触れる箇所をSuspenseで囲む必要があり、トップページの構成の見直しが必要になる。記事数・更新頻度から見て、そこまでの効果がない |
| fetch単位のキャッシュ（Cache Componentsなし） | `fetch(url, { next: { revalidate, tags } })`。Next.js公式の「caching-without-cache-components」ガイドの方式 | **採用**。microCMS SDKの`customRequestInit`で渡せるため、`external/`層の中だけで完結する |

```ts
// external/microcms/endpoints.ts
const REVALIDATE_SECONDS = 60 * 60; // 1時間

export function buildCacheOptions(endpoint: MicrocmsEndpoint) {
  return { next: { revalidate: REVALIDATE_SECONDS, tags: [endpoint] } };
}

// external/microcms/blogs.ts
export function getBlogList() {
  return microcmsClient.getAllContents<Blog>({
    endpoint: "blogs",
    customRequestInit: buildCacheOptions("blogs"),
  });
}
```

- 開発中（`next dev`）は、ブラウザのスーパーリロードなどで`cache-control: no-cache`が付くとキャッシュが無視される（Next.jsの仕様）。キャッシュの効き方は`npm run build && npm run start`で確認する
- 将来、Cache Componentsへ移行する場合も、キャッシュの指定が`external/`層に閉じているので、変更はこの層の中で済む
