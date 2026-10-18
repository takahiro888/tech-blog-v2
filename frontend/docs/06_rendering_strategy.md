# レンダリング方式（SSR / SSG / ISR）

本プロジェクトはSPA（ブラウザでJSを動かしてから画面を作る方式）ではなく、**サーバー側でHTMLを作って返す方式**を中心にしている。ページごとに「いつHTMLを作るか」が異なり、それをNext.jsがコードの書き方から自動で判定している。

この文書では、どのページがどの方式になっているか、なぜそうなるのか、どの実装がそれを決めているのかをまとめる。キャッシュ設定を決めた経緯は[04_data_fetching_policy.md](./04_data_fetching_policy.md)の「キャッシュ戦略」、Webhookの仕様は[global_design/07_api_design.md](../../docs/global_design/07_api_design.md)の「5. 再検証」を参照。

## 用語

| 用語 | いつHTMLを作るか | 特徴 |
|---|---|---|
| SSR（Server-Side Rendering） | リクエストのたびにサーバーで作る | URLのクエリなど、アクセスされるまで分からない情報を使える。毎回描画するぶんサーバーの負荷は高い |
| SSG（Static Site Generation） | `next build`のときに1回だけ作る | 作り置きのHTMLを返すだけなので速い。ただし、そのままではビルドし直すまで内容が古いまま |
| ISR（Incremental Static Regeneration） | ビルド時に作り、**その後は必要なときにページ単位で作り直す** | SSGの速さを保ったまま、サイト全体をビルドし直さずに内容を更新できる。「SSG＋自動更新」と考えるとよい |

### ISRの動き

ISRには、時間で作り直す方法と、外部からの合図で作り直す方法がある。本プロジェクトは両方を使っている。

**時間ベース（本プロジェクトでは1時間）**

1. ビルド時に作ったHTMLを返す
2. 1時間が過ぎた後に最初のアクセスが来ても、**いったんは古いHTMLを返す**（利用者を待たせない）
3. その裏で新しいHTMLを作り直す
4. 作り直しが終わると、次のアクセスからは新しいHTMLが返る

**オンデマンド（microCMSのWebhook）**

microCMSで記事を公開・更新すると、microCMSが`/api/revalidate`を呼ぶ。そこで`revalidateTag`を実行すると、そのタグが付いたデータを使うページが「作り直しが必要」な状態になり、1時間を待たずに次のアクセスで作り直しが始まる。

## ページごとの方式

`npm run build`の出力（2026-10時点）:

```
Route (app)                Revalidate  Expire
┌ ƒ /
├ ○ /about                         1h      1y
├ ƒ /api/revalidate
├ ƒ /blogs/[id]
├ ○ /disclaimer                    1h      1y
├ ○ /privacy-policy                1h      1y
├ ○ /profile                       1h      1y
└ ○ /sitemap.xml                   1h      1y

○  (Static)   prerendered as static content
ƒ  (Dynamic)  server-rendered on demand
```

`○`はビルド時に作られたページ（SSG）で、`Revalidate`欄に値があればISRになっている。`ƒ`はリクエストごとに作られるページ（SSR）。

| ページ | 方式 | 理由 |
|---|---|---|
| `/`（記事一覧） | SSR | `searchParams`を使っているため |
| `/blogs/[id]`（記事詳細） | SSR | `generateStaticParams`がないため |
| `/about`・`/profile`・`/disclaimer`・`/privacy-policy` | SSG＋ISR | リクエスト時の情報を使っておらず、fetchに`revalidate`があるため |
| `/sitemap.xml` | SSG＋ISR | 同上 |
| `/api/revalidate` | リクエストごとに実行 | ページではなくAPI（Route Handler）。POSTを受けるため常に動的 |

## どの実装が方式を決めているか

Next.jsは、ページの中で**リクエストが来るまで分からない情報**（`searchParams`・`cookies()`・`headers()`など。Request-time APIと呼ぶ）を使っているかどうかを見て、使っていればSSR、使っていなければビルド時に作る（SSG）、という判定をする。`export const dynamic = ...`のような明示的な指定は、本プロジェクトでは使っていない。

### 1. 記事一覧（`/`）がSSRになる理由: `searchParams`

```tsx
// app/page.tsx
export default async function Home({ searchParams }: HomeProps) {
  const rawSearchParams = await searchParams; // ← ここでSSRになる
  const contents = await getBlogList();
  // ...
}
```

`/?category=react&page=2`のように、カテゴリ・キーワード・ページ番号・表示件数はURLのクエリで受け取る。クエリの組み合わせは無数にあり、ビルド時にすべてのHTMLを作ることはできないので、アクセスされたときに描画する必要がある。

### 2. 記事詳細（`/blogs/[id]`）がSSRになる理由: `generateStaticParams`がない

`[id]`のような動的なURLは、どのidのページを作ればよいかがビルド時に分からない。そのため、`generateStaticParams`でidの一覧を返さない限り、Next.jsはリクエスト時に描画する。

現在の[app/blogs/[id]/page.tsx](../src/app/blogs/[id]/page.tsx)には`generateStaticParams`がないのでSSRになっている。ただし、後述のデータキャッシュがあるので、アクセスのたびにmicroCMSへ問い合わせているわけではない。

SSG＋ISRにしたい場合は、次のように記事idの一覧を返す関数を追加する。

```tsx
// app/blogs/[id]/page.tsx（SSG＋ISRにする場合のイメージ）
export async function generateStaticParams() {
  const articles = await getBlogList();
  return articles.map((article) => ({ id: article.id }));
}
```

こうすると、ビルド時に全記事のHTMLが作られる。ビルド後に追加された記事は、最初にアクセスされたときに作られて保存される（`dynamicParams`の初期値が`true`のため）。

### 3. 固定ページがSSG＋ISRになる理由: Request-time APIを使わない＋fetchの`revalidate`

`/about`・`/profile`などは、microCMSからデータを取得して表示するだけで、`searchParams`などは使っていない。そのためビルド時にHTMLが作られる（SSG）。

さらに、データ取得のfetchに有効期間（`revalidate`）を付けているので、ページもその期間で作り直される（ISR）。設定は[external/microcms/endpoints.ts](../src/external/microcms/endpoints.ts)の1か所にまとめている。

```ts
// external/microcms/endpoints.ts
const REVALIDATE_SECONDS = 60 * 60; // 1時間

export function buildCacheOptions(endpoint: MicrocmsEndpoint) {
  return {
    next: {
      revalidate: REVALIDATE_SECONDS, // 1時間でデータとページを作り直す
      tags: [endpoint],               // Webhookで狙い撃ちするための名札
    },
  };
}
```

```ts
// external/microcms/about.ts など
microcmsClient.getObject({ endpoint: "about", customRequestInit: buildCacheOptions("about") });
```

microCMS SDKは内部で`fetch`を使っており、`customRequestInit`に渡した値がそのまま`fetch`の第2引数になる。そのため、Next.jsのfetchキャッシュの設定がSDK経由でも効く。

ページ側には`export const revalidate = 3600`のような指定は書いていない。**1つのページの中で使われているfetchの`revalidate`のうち、最も短いものがページ全体の作り直しの間隔になる**（Next.jsの仕様）ため、ビルド出力の`Revalidate`欄に`1h`と表示されている。

### 4. オンデマンドで作り直す仕組み: Webhook＋`revalidateTag`

```ts
// app/api/revalidate/route.ts（抜粋）
const tag = resolveRevalidateTag(payload); // 例: "blogs"
revalidateTag(tag, "max");
```

1. microCMSで記事を公開・更新する
2. microCMSが`POST /api/revalidate`を呼ぶ（署名で本物か確認する）
3. ペイロードの`api`（例: `blogs`）をそのままタグとして`revalidateTag`に渡す
4. `tags: ["blogs"]`が付いたfetchのキャッシュと、それを使っているページが「作り直しが必要」な状態になる
5. 次のアクセスでは古い内容を返しつつ、裏で新しい内容を取得する（第2引数の`"max"`の動き）

これにより、記事を更新しても最大1時間待つ必要はなくなる。1時間の`revalidate`は、Webhookが届かなかった場合の保険という位置づけになる。

### 5. SSRのページでもmicroCMSへの問い合わせはキャッシュされる

SSRとSSG/ISRの違いは「**HTML**をいつ作るか」であり、「**データ**をいつ取得するか」とは別の話になる。

記事一覧・記事詳細はSSRだが、microCMSへのfetchには同じ`buildCacheOptions("blogs")`が付いている。そのため、取得結果はNext.jsのデータキャッシュに最大1時間保存され、HTMLはリクエストごとに作り直しても、microCMSへの問い合わせは基本的にキャッシュから返る。

| | HTMLの作成 | microCMSへの問い合わせ |
|---|---|---|
| 記事一覧・記事詳細（SSR） | リクエストごと | キャッシュ（1時間＋Webhook） |
| 固定ページ（SSG＋ISR） | ビルド時＋1時間ごと／Webhook | キャッシュ（1時間＋Webhook） |

なお、記事詳細では`generateMetadata`とページ本体の両方で同じ記事を取得している。1回のリクエストの中で2回問い合わせないよう、[features/blog-detail/lib/get-article.ts](../src/features/blog-detail/lib/get-article.ts)でReactの`cache`を使っている。これはリクエストの中だけで効くメモ化で、上のデータキャッシュとは別の仕組み。

## ヘッダーなどの共通部分

ヘッダー・フッターは[app/layout.tsx](../src/app/layout.tsx)に書かれた共通部分なので、独自の方式は持たない。表示しているページと一緒に描画される（記事一覧ならSSR、`/about`ならSSG＋ISR）。

ヘッダー本体はServer Componentで、サーバー側でHTMLになる。そのうち、ブラウザ上で動く必要がある部品だけが`"use client"`のClient Componentになっている。

| 部品 | 種類 | Client Componentにしている理由 |
|---|---|---|
| `Header` | Server Component | — |
| `NavLink` | Client Component | 現在のURLを見て選択中の表示にするため（`usePathname`） |
| `MobileMenu` | Client Component | ボタンのクリックで検索・メニューのダイアログを開くため（`onClick`・`useRef`） |
| `ScrollTopButton` | Client Component | クリックでページ先頭へスクロールするため（`window.scrollTo`） |
| `PageSizeSelect`（記事一覧） | Client Component | 選択時にURLを書き換えるため（`router.push`） |

Client ComponentもHTMLはサーバーで作られる。ブラウザではそのHTMLに、クリックなどの動きだけを後から付ける（ハイドレーション）。

## SPAのような部分

`next/link`の`<Link>`でのページ移動や`router.push`は、ページ全体を読み込み直さずに画面だけを切り替える。この点ではSPAに近い。ただし、表示内容はブラウザで作っているのではなく、サーバーで描画した結果（RSC Payload）を取得している。つまり「描画はサーバー（SSR/SSG）、ページ移動はSPAのように」という組み合わせになっている。

## 確認方法

- どのページがどの方式かは、`npm run build`の出力の`○`／`ƒ`と`Revalidate`欄で確認する
- `next dev`ではすべてのページがリクエストごとに描画され、キャッシュの効き方も本番と異なる。ISRやキャッシュの動きは`npm run build && npm run start`で確認する
