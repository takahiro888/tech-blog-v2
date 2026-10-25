# ディレクトリ構成

## リポジトリ構成の方針

参考リポジトリ（[immortal-architecture-mvp](https://github.com/YukiOnishi1129/immortal-architecture-mvp)）はリポジトリ直下に`docs/`（プロダクト全体の設計）と`frontend/`（アプリ本体一式。中に`frontend/docs/`を持つ）を分けている。本プロジェクトもこの構成を採用し、**アプリ本体（`package.json`・`next.config.ts`・`src/`等）を`frontend/`サブディレクトリに置いている**。

アプリのコードは`frontend/src/`配下に`app/` `external/` `features/` `shared/`としてまとめる（参考リポジトリと同じ）。`shared/`は「特定機能に依存しない共通コード」を置く層。`public/`・`package.json`・`next.config.ts`・`tsconfig.json`・`.env`は`frontend/`直下に置き、`tsconfig.json`の`paths`（`@/*`）は`./src/*`を指す。テストは`frontend/tests/`に、`src/`と同じ階層で置く。

## 現在の構成

```
（リポジトリ直下）
README.md
AGENTS.md / CLAUDE.md            … AIエージェント向けの指示（AGENTS.mdは`next dev`が自動生成する）
docs/
  README.md                      … 設計ドキュメントの目次
  global_design/                 … プロダクト全体の設計（01〜07）
.github/workflows/ci.yml         … working-directory: frontend で lint・typecheck・test を実行

frontend/                        … アプリ本体一式
  package.json / package-lock.json
  .nvmrc                         … Node.js 24
  next.config.ts                 … images.remotePatterns（microCMSの画像ドメインなど）
  tsconfig.json                  … paths の @/* は ./src/*
  vitest.config.ts
  eslint.config.mjs
  postcss.config.mjs
  .env                           … Git管理外（環境変数は README・global_design/07 参照）
  public/
    logo.svg                     … ヘッダーのロゴ
    icons/                       … PWA用アイコン（icon-192.png / icon-512.png / icon-maskable-512.png）
  docs/                          … フロントエンド実装の設計（本ドキュメント群、01〜06）
  tests/                         … ロジックのテスト（src/ と同じ階層）
    external/microcms/           … blogs.test.ts / webhook.test.ts
    features/blog-detail/lib/    … share-links.test.ts / sitemap-entries.test.ts
    features/blog-list/lib/      … filter-articles.test.ts / list-metadata.test.ts
    features/sidebar/lib/        … aggregate.test.ts
    shared/lib/                  … card-theme / env / published-at / sanitize-html / sort-articles
  src/
    app/
      layout.tsx                 … Header・main・Footer・ScrollTopButtonの配置。metadata（title.template・metadataBase・openGraph）とviewport（themeColor）もここで持つ
      globals.css                … Tailwind・daisyUI（lightテーマ）・Typographyの読み込み
      page.tsx                   … トップページ（記事一覧を兼ねる）。searchParamsを解釈し、絞り込み・ページ分割した結果を並べる
      not-found.tsx              … 404ページ。どのルートにも一致しないURLと、記事詳細のnotFound()の両方で使われる
      error.tsx                  … エラー画面（Client Component）。microCMSの障害などで描画に失敗したとき
      global-error.tsx           … ルートのlayout.tsx自体が失敗したときのエラー画面（自前でhtml・bodyを持つ）
      sitemap.ts                 … /sitemap.xml。固定ページと全記事のURL
      robots.ts                  … /robots.txt
      manifest.ts                … PWAのマニフェスト（名前・アイコン・テーマ色）
      icon.svg / apple-icon.png  … ファビコン・iOSのホーム画面用アイコン（ファイル規約で自動的に読み込まれる）
      api/
        revalidate/route.ts      … microCMSのWebhookを受けてrevalidateTagを呼ぶRoute Handler
      blogs/
        [id]/page.tsx            … 記事詳細ページ
      about/page.tsx             … このブログについて
      profile/page.tsx           … プロフィール
      privacy-policy/page.tsx    … プライバシーポリシー（フッターからのみ遷移）
      disclaimer/page.tsx        … 免責事項（フッターからのみ遷移）
    features/
      blog-list/
        components/
          ArticleGrid.tsx          … 記事カードを罫線区切りで縦に並べる
          ArticleCard.tsx          … 1記事分のカード（カード全体が記事詳細へのリンク）
          ArticleThumbnail.tsx     … 記事カードのサムネイル（アイキャッチ、未設定時はカテゴリ由来の装飾）
          ResultSummary.tsx        … 「◯件中 ◯ - ◯ 件を表示」
          Pagination.tsx           … ページ番号・前へ／次へ（next/linkのリンク）
          PageSizeSelect.tsx       … 表示件数セレクト（Client Component。router.pushでURLを書き換える）
        lib/
          filter-articles.ts       … searchParamsの解釈、絞り込み、ページ分割、一覧URLの組み立て。PAGE_SIZE_OPTIONSもここ
          list-metadata.ts         … 絞り込み条件からパンくずの現在地・見出し（h1）・Metadata（title・description・canonical・robots）を組み立てる
      blog-detail/
        components/
          ArticleDetail.tsx        … シェア列とArticleBodyの配置（PCは左にシェア列、スマホは本文の末尾）。記事の絶対URLを組み立ててShareButtonsに渡す
          ArticleBody.tsx          … アイキャッチ・タイトル・カテゴリ・投稿日・本文の<article>
          ShareButtons.tsx         … X・Facebook・はてなブックマークのシェアボタン（Server Component。ツールチップはdaisyUIのCSSのみ）
          icons/                   … 各サービスのロゴのインラインSVGコンポーネント（XIcon / FacebookIcon / HatenaBookmarkIcon）
        lib/
          get-article.ts           … 記事1件の取得。React.cacheでgenerateMetadataとページ本体の取得を共有する
          article-metadata.ts      … 記事のMetadata（title・description・canonical・openGraph・twitter）を組み立てる
          sitemap-entries.ts       … 記事の配列からサイトマップの項目（url・lastModified）を作る
          share-links.ts           … 記事URLとタイトルから各サービスの共有画面URLを組み立てる
      sidebar/
        components/
          Sidebar.tsx              … サイドバー全体の組み立て（集計もここで呼ぶ）
          SearchBox.tsx            … 検索フォーム（GET送信。モバイルメニューの検索ダイアログからも使う）
          AuthorCard.tsx           … 著者カード
          CategoryList.tsx         … カテゴリー一覧（旧称TopicsList）
          ArchiveList.tsx          … アーカイブ（年月ごとの件数）
          MessageBox.tsx           … 一言メッセージ枠
        lib/
          aggregate.ts             … カテゴリ・アーカイブの集計
    external/
      microcms/
        client.ts                … createClientのみ。先頭でimport "server-only"
        endpoints.ts             … エンドポイント名の一覧（MICROCMS_ENDPOINTS）とキャッシュ設定を作るbuildCacheOptions
        webhook.ts               … Webhookの署名検証（verifyWebhookSignature）と、再検証するタグの判定（resolveRevalidateTag）
        blogs.ts                 … getBlogList / getBlogDetail（microCMSが404を返したときだけnullを返す）
        profile.ts               … getProfile（オブジェクト形式のprofile）
        about.ts                 … getAbout（オブジェクト形式のabout）
        privacy-policy.ts        … getPrivacyPolicy
        disclaimer.ts            … getDisclaimer
        types.ts                 … microCMSのレスポンス型（Blog / Profile / About / LegalPage など）。アプリ内でもこの型をそのまま使う
    shared/                      … 特定機能に依存しない共通コード
      lib/
        constants.ts             … SITE_NAME・SITE_DESCRIPTION・CATCH_COPY・THEME_COLOR・NEW_DAYS・SIDEBAR_MESSAGE・FOOTER_LINKS・COPYRIGHT など
        env.ts                   … getRequiredEnv（必須の環境変数を読み、未設定なら変数名入りのエラー）。server-only
        site-url.ts              … getSiteUrl（環境変数SITE_URLの読み取り）/ buildAbsoluteUrl（絶対URLの組み立て）。server-only
        sanitize-html.ts         … sanitizeRichText（リッチエディタHTMLの許可タグ・属性を絞る）。RichTextから呼ぶ
        published-at.ts          … 新着判定（isNew）・投稿日の表示形式・年月ラベル
        card-theme.ts            … 先頭カテゴリからカードの配色（CardTheme）を導出
        sort-article.ts          … 公開日の降順での並び替え（現状は未使用）
        types.ts                 … 旧実装のArticle型（現状は未使用）
      components/
        RichText.tsx             … microCMSのリッチエディタHTMLを描画する共通部品（`prose`のスタイル指定を1か所に集約）。
                                   記事詳細・about・profile・privacy-policy・disclaimerの本文で共用する。Server Component
        PageTitle.tsx            … 固定ページ・404・エラー画面のh1（タイトル＋下罫線＋本文との余白）。Server Component
        layout/                  … ページの枠組みになる部品
          Header.tsx             … ロゴ・キャッチコピー（PCのみ）・ナビ。Server Component
          NavLink.tsx            … 現在ページを判定するナビのリンク（Client Component。usePathname）
          MobileMenu.tsx         … スマホ・タブレットの検索・メニューのダイアログ（Client Component）
          Breadcrumb.tsx         … 「HOME > 現在地」のパンくず
          SidebarLayout.tsx      … メイン＋サイドバーの2カラム。サイドバー用のデータ（記事一覧・profile）を取得する（async Server Component）
          Footer.tsx             … リンク行とコピーライト
          ScrollTopButton.tsx    … ページ先頭へ戻るボタン（Client Component）
```

`compose.yml`は参考リポジトリではPostgres（Drizzle用）を起動するためのものだが、本プロジェクトはDBを持たずmicroCMSのみを利用するため作成しない。この点は「構造を完全に一致させる」のではなく「意味のある部分だけを再現する」という判断。

## 移行の記録（Before/After 対応表）

移行前は、リポジトリ直下に`app/`・`components/`・`lib/`が直接置かれ、記事一覧は`components/ArticleGrid.tsx`が内部API Route（`app/api/blogs/*`）経由でクライアント側からfetchしていた。移行の手順は[05_development_guide.md](./05_development_guide.md)のフェーズ0〜1を参照。

| 移行前 | 移行後 | 変更内容 |
|---|---|---|
| リポジトリ直下の `app/` `components/` `lib/` `package.json` 等一式 | `frontend/` 配下 | アプリ本体を`frontend/`サブディレクトリへ移動（参考リポジトリと同じ構成）。`.github/workflows/ci.yml`・VercelのRoot Directory設定も変更 |
| `docs/frontend/` | `frontend/docs/` | 本ドキュメント群の置き場所。`docs/global_design/`はリポジトリ直下のまま維持 |
| `app/` `external/` `features/` | `src/app/` `src/external/` `src/features/` | 参考リポジトリに合わせて`src/`配下へ集約 |
| `lib/` | `src/shared/lib/` | `lib/microcms.ts`は`src/external/microcms/client.ts` + `blogs.ts`に分割。`types.ts`・`constants.ts`は`src/shared/lib/`へ移動 |
| `components/ArticleCard.tsx` / `ArticleGrid.tsx` | `src/features/blog-list/components/` | 記事一覧機能に紐づくため移動。`ArticleGrid`は`useEffect`+`fetch`のクライアント取得をやめ、propsでデータを受け取る形に変更（詳細は[04_data_fetching_policy.md](./04_data_fetching_policy.md)） |
| `app/blogs/page.tsx`（記事一覧） | 廃止 | トップページ（`/`）に統合 |
| `app/api/blogs/route.ts` / `app/api/blogs/[id]/route.ts` | 廃止 | Server Componentから`external/microcms/blogs.ts`を直接呼べるため、内部中継用のAPI Routeは不要になった |
| `app/api/qiita/route.ts` | 削除 | Qiita連携はスコープ外化のため |
| `lib/sample-articles.ts` | 削除 | 使用箇所がなくなったため |

## コード例（外部層の分離）

移行前の`lib/microcms.ts`は、クライアントの生成と取得関数が1ファイルにまとまっていた。

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
```

現在は、クライアントの生成（`client.ts`）と取得関数（`blogs.ts`など）を分けている。

```ts
// src/external/microcms/client.ts
import "server-only";
import { createClient } from "microcms-js-sdk";
import { getRequiredEnv } from "@/shared/lib/env";

export const microcmsClient = createClient({
  serviceDomain: getRequiredEnv("MICROCMS_SERVICE_DOMAIN"),
  apiKey: getRequiredEnv("MICROCMS_API_KEY"),
});
```

```ts
// src/external/microcms/blogs.ts（抜粋）
export function getBlogList() {
  return microcmsClient.getAllContents<Blog>({
    endpoint: "blogs",
    customRequestInit: buildCacheOptions("blogs"),
  });
}
```

このように分けるのが「意図的なレイヤー分離」の最小単位。クライアントの生成方法（認証情報の持ち方等）とAPI呼び出しのロジックを分けておくと、将来クライアントの初期化方法だけが変わった場合の影響範囲がわかりやすくなる。また、`client.ts`に`import "server-only"`を書くことで、`external/microcms/`全体がClient Componentから読み込まれないように守られる。
