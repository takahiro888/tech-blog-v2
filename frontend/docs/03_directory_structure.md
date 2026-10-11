# ディレクトリ構成

## リポジトリ構成の方針

参考リポジトリ（[immortal-architecture-mvp](https://github.com/YukiOnishi1129/immortal-architecture-mvp)）はリポジトリ直下に`docs/`（プロダクト全体の設計）と`frontend/`（アプリ本体一式。中に`frontend/docs/`を持つ）を分けている。本プロジェクトもこの構成を採用し、**アプリ本体（`package.json`・`next.config.ts`・`app/`・`components/`・`lib/`等）を`frontend/`サブディレクトリへ移動する**。

この移動は`.github/workflows/ci.yml`（現在リポジトリ直下で`npm ci`等を実行している）とVercelのRoot Directory設定の変更を伴う。詳細な手順は[05_development_guide.md](./05_development_guide.md)のステップ0を参照。

### 訂正: `frontend/src/`への集約

当初のこのドキュメントでは`frontend/`直下に`app/` `external/` `features/` `lib/`を並べる構成にしていたが、参考リポジトリを実際に確認したところ、`frontend/src/`配下に`app/` `external/` `features/` `shared/`をまとめる構成だったため、本プロジェクトもこれに合わせて修正した。`shared/`は「特定機能に依存しない共通コード」を置く層で、本プロジェクトの`lib/`（`constants.ts` / `types.ts` / `sample-articles.ts`）はここに含める。Next.js公式も`src/`配下にアプリコードをまとめる構成をサポートしており、`public/`・`package.json`・`next.config.ts`・`tsconfig.json`・`.env`はリポジトリ（`frontend/`）直下に残し、`tsconfig.json`の`paths`（`@/*`）を`./src/*`基準に変更する。

## 現状（リポジトリ直下にアプリが直接置かれている）

```
（リポジトリ直下）
app/
  api/
    blogs/route.ts
    blogs/[id]/route.ts
    qiita/route.ts        ← スコープ外化により削除予定
  blogs/page.tsx
  blogs/[id]/page.tsx
  page.tsx
  layout.tsx
components/
  ArticleCard.tsx
  ArticleGrid.tsx
lib/
  microcms.ts
  types.ts
  constants.ts
  sample-articles.ts
package.json / next.config.ts / tsconfig.json / vitest.config.ts 等
docs/
  global_design/
  frontend/              ← 本ドキュメント群（frontend/へ移動後は frontend/docs/ に移す）
.github/workflows/ci.yml
```

## 目標構成（参考リポジトリと同じ形）

```
（リポジトリ直下）
docs/
  global_design/                … プロダクト全体の設計（現状のまま維持）
.github/workflows/ci.yml         … working-directory: frontend を指定するよう変更
compose.yml                      … 現状不要（参考リポジトリはDB用。本プロジェクトはmicroCMSのみのため作成しない）

frontend/                        … アプリ本体一式をここに移動
  package.json
  next.config.ts
  tsconfig.json                  … paths の @/* を ./src/* に変更
  vitest.config.ts
  .env
  public/
    icons/                       … PWA用アイコン（icon-192.png / icon-512.png / icon-maskable-512.png）
  docs/                          … 本ドキュメント群の移動先（旧 docs/frontend/）
    01_tech_stack.md
    02_architecture.md
    03_directory_structure.md
    04_data_fetching_policy.md
    05_development_guide.md
  src/
    app/
      layout.tsx                 … metadata（title.template・metadataBase・openGraph）とviewport（themeColor）もここで持つ
      not-found.tsx              … 404ページ。どのルートにも一致しないURLと、記事詳細のnotFound()の両方で使われる
      manifest.ts                … PWAのマニフェスト（名前・アイコン・テーマ色）
      icon.svg / apple-icon.png  … ファビコン・iOSのホーム画面用アイコン（ファイル規約で自動的に読み込まれる）
      page.tsx                   … トップページ（Server Component、featuresを組み立てるだけ）。記事一覧を兼ねる（フィルタ・検索・ページネーション込み）
      blogs/
        [id]/page.tsx             … 記事詳細ページ。旧`blogs/page.tsx`（記事一覧）は廃止し、トップページ（`/`）に統合した
      about/
        page.tsx                 … このブログについて（新規）
      profile/
        page.tsx                 … プロフィール（新規、内部ページ）
      privacy-policy/
        page.tsx                 … プライバシーポリシー（新規。フッターからのみ遷移）
      disclaimer/
        page.tsx                 … 免責事項（新規。フッターからのみ遷移）
    features/
      blog-list/
        components/
          ArticleCard.tsx
          ArticleThumbnail.tsx     … 記事カードのサムネイル（アイキャッチ、未設定時はカテゴリ由来の装飾）
          ArticleGrid.tsx
          ResultSummary.tsx        … 「◯件中 ◯〜◯件を表示」
          Pagination.tsx           … ページ番号・前へ／次へ
          PageSizeSelect.tsx       … 表示件数セレクト
        lib/
          filter-articles.ts       … searchParamsのパース、絞り込み、ページ分割、一覧URLの組み立てなどの純粋関数
          list-metadata.ts         … 絞り込み条件からトップページの見出し（h1）とMetadata（title・description・robots）を組み立てる
      blog-detail/
        components/
          ArticleDetail.tsx        … シェア列とArticleBodyの配置（PCは左にシェア列、スマホは本文の末尾）。記事の絶対URLを組み立ててShareButtonsに渡す
          ArticleBody.tsx          … アイキャッチ・タイトル・カテゴリ・投稿日・本文の<article>
          ShareButtons.tsx         … X・Facebook・はてなブックマークのシェアボタン（Server Component。ツールチップはdaisyUIのCSSのみ）
          icons/                   … 各サービスのロゴのインラインSVGコンポーネント（XIcon / FacebookIcon / HatenaBookmarkIcon）
        lib/
          get-article.ts           … 記事1件の取得。React.cacheでgenerateMetadataとページ本体の取得を共有する（存在しない記事のnullはexternal層のgetBlogDetailが返す）
          article-metadata.ts      … 記事のMetadata（title・description・canonical・openGraph・twitter）を組み立てる
          share-links.ts           … 記事URLとタイトルから各サービスの共有画面URLを組み立てる純粋関数（テストは`frontend/tests/features/blog-detail/lib/share-links.test.ts`）
      sidebar/
        components/
          Sidebar.tsx              … サイドバー全体の組み立て
          SearchBox.tsx
          AuthorCard.tsx
          CategoryList.tsx         … カテゴリー一覧（旧称TopicsList）
          ArchiveList.tsx
          MessageBox.tsx           … 一言メッセージ枠
        lib/
          aggregate.ts             … カテゴリ・アーカイブの集計
    external/
      microcms/
        client.ts                … createClientのみ
        blogs.ts                 … getBlogList / getBlogDetail（microCMSが404を返したときだけnullを返す）
        profile.ts               … getProfile（オブジェクト形式のprofile）
        about.ts                 … getAbout（オブジェクト形式のabout）
        privacy-policy.ts        … プライバシーポリシー本文の取得
        disclaimer.ts            … 免責事項本文の取得
        types.ts                 … microCMSのレスポンス型
    shared/                      … 特定機能に依存しない共通コード
      lib/
        types.ts                 … アプリ内で使うドメイン寄りの型（Article等）
        constants.ts             … SITE_NAME・SITE_DESCRIPTION・CATCH_COPY・FOOTER_LINKS など
        sanitize-html.ts         … sanitizeRichText（リッチエディタHTMLの許可タグ・属性を絞る）。RichTextから呼ぶ
        site-url.ts              … getSiteUrl（環境変数SITE_URLの読み取り）/ buildAbsoluteUrl（絶対URLの組み立て）。layoutのmetadataBaseと記事詳細で共用
        published-at.ts          … 投稿日の表示形式・年月ラベル
        sort-article.ts          … 記事の並び替え
        card-theme.ts            … カテゴリからカード装飾を導出
      components/
        RichText.tsx             … microCMSのリッチエディタHTMLを描画する共通部品（`prose`のスタイル指定を1か所に集約）。
                                   記事詳細・about・profile・privacy-policy・disclaimerの本文で共用する。Server Component
        PageTitle.tsx            … 固定ページのh1（タイトル＋下罫線＋本文との余白）。about・profile・privacy-policy・disclaimerで共用する。Server Component
        layout/                  … ページの枠組みになる部品（Header / Footer / Breadcrumb / SidebarLayout / NavLink）。Server Component中心。
                                   Headerはロゴ・ナビに加えキャッチコピー行（全ページ共通で常時表示）も持つ（旧`features/home/CatchCopy`を統合）
                                   Breadcrumbはトップページの絞り込み時・記事詳細・プロフィールで共用する（「HOME > 現在地」表示）
                                   Client化が必要な最小単位（NavLink等）もここにフラットに置く
```

`compose.yml`は参考リポジトリではPostgres（Drizzle用）を起動するためのものだが、本プロジェクトはDBを持たずmicroCMSのみを利用するため作成しない。この点は「構造を完全に一致させる」のではなく「意味のある部分だけを再現する」という判断。

## Before/After 対応表

| 現状 | 移行先 | 変更内容 |
|---|---|---|
| リポジトリ直下の `app/` `components/` `lib/` `package.json` 等一式 | `frontend/` 配下 | アプリ本体を`frontend/`サブディレクトリへ移動（参考リポジトリと同じ構成）。`.github/workflows/ci.yml`・Vercelのroot directory設定の変更を伴う |
| `docs/frontend/` | `frontend/docs/` | 本ドキュメント群の置き場所。`docs/global_design/`はリポジトリ直下のまま維持 |
| `app/` `external/` `features/` | `src/app/` `src/external/` `src/features/` | 参考リポジトリに合わせて`src/`配下へ集約（訂正） |
| `lib/` | `src/shared/lib/` | `lib/microcms.ts`は`src/external/microcms/client.ts` + `blogs.ts`に分割。`types.ts`・`constants.ts`・`sample-articles.ts`は`src/shared/lib/`へ移動 |
| `components/ArticleCard.tsx` | `src/features/blog-list/components/ArticleCard.tsx` | 記事一覧機能に紐づくため移動 |
| `components/ArticleGrid.tsx` | `src/features/blog-list/components/ArticleGrid.tsx` | 同上。`useEffect`+`fetch`のクライアント取得をやめ、Server Componentからpropsでデータを受け取る形に変更（詳細は[04_data_fetching_policy.md](./04_data_fetching_policy.md)） |
| `app/api/blogs/route.ts` | 廃止 | Server Componentから`external/microcms/blogs.ts`を直接呼べるため、内部中継用のAPI Routeは不要になる |
| `app/api/blogs/[id]/route.ts` | 廃止 | 同上（`app/blogs/[id]/page.tsx`は既に`getBlogDetail`を直接呼んでおり、この形に統一する） |
| `app/api/qiita/route.ts` | 削除 | Qiita連携はスコープ外化のため |
| `lib/sample-articles.ts` | 要確認 | 現在の使用箇所を確認し、不要であれば削除 |

## コード例（外部層の分離イメージ）

現状の`lib/microcms.ts`:

```ts
import { createClient } from "microcms-js-sdk";
import type { Blog } from "./types";

export const client = createClient({
  serviceDomain: process.env.MICROCMS_SERVICE_DOMAIN || "",
  apiKey: process.env.MICROCMS_API_KEY || "",
});

export function getBlogList() {
  return client.getList<Blog>({ endpoint: "blogs" });
}

export function getBlogDetail(contentId: string) {
  return client.getListDetail<Blog>({ endpoint: "blogs", contentId });
}
```

移行イメージ（`src/external/microcms/client.ts` + `src/external/microcms/blogs.ts`）:

```ts
// src/external/microcms/client.ts
import { createClient } from "microcms-js-sdk";

export const microcmsClient = createClient({
  serviceDomain: process.env.MICROCMS_SERVICE_DOMAIN || "",
  apiKey: process.env.MICROCMS_API_KEY || "",
});
```

```ts
// src/external/microcms/blogs.ts
import { microcmsClient } from "./client";
import type { Blog } from "./types";

export function getBlogList() {
  return microcmsClient.getList<Blog>({ endpoint: "blogs" });
}

export function getBlogDetail(contentId: string) {
  return microcmsClient.getListDetail<Blog>({ endpoint: "blogs", contentId });
}
```

このように分けるのが「意図的なレイヤー分離」の最小単位。クライアントの生成方法（認証情報の持ち方等）とAPI呼び出しのロジックを分けておくと、将来クライアントの初期化方法だけが変わった場合の影響範囲がわかりやすくなる。

いずれも設計イメージのコード例であり、実際のファイル作成・移動はご自身で行ってください。
