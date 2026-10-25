# 技術スタック

現状の`package.json`に基づく。

## フレームワーク・ランタイム

- Next.js 16.3.4（App Router）
- React 19.2.8 / React DOM 19.2.8
- Node.js 24.x（`.nvmrc`, `engines`）
- TypeScript 5（strict mode）

## スタイリング

- Tailwind CSS v4（`@tailwindcss/postcss`）
- `@tailwindcss/typography` — リッチエディタHTMLの本文スタイル（`prose`）。`shared/components/RichText.tsx`で使う
- daisyUI v5（`light`テーマのみ。`btn`・`select`・`input`・`modal`・`tooltip`などのクラスを使用）
- フォント: `next/font/google`の`Geist`・`Geist_Mono`（`app/layout.tsx`）
- アイコン: アイコンライブラリ（`react-icons`等）は導入せず、必要なロゴ（シェアボタンのX・Facebook・はてなブックマーク等）はインラインSVGのコンポーネントとして持つ。使う数が少なく、依存を増やすほどではないため

## セキュリティ

- `server-only` — microCMSのAPIキーなどを扱うモジュールが、Client Componentから読み込まれたらビルドエラーにする（[global_design/07_api_design.md](../../docs/global_design/07_api_design.md)の4章参照）
- `sanitize-html`（+ `@types/sanitize-html`）— microCMSのリッチエディタHTMLをServer Componentでサニタイズする（[global_design/07_api_design.md](../../docs/global_design/07_api_design.md)の4.1参照）

## PWA

- 追加ライブラリなし。Next.js標準の`app/manifest.ts`でマニフェストを生成する。Service Worker（オフライン対応・プッシュ通知）は導入しない（[global_design/04_ui_design.md](../../docs/global_design/04_ui_design.md)の12章参照）

## データソース

- microCMS（`microcms-js-sdk`）— ブログ記事のヘッドレスCMS
- ~~Qiita API~~ — スコープ外（[global_design/01_requirements.md](../../docs/global_design/01_requirements.md)参照）

## テスト

- Vitest 5（`environment: "jsdom"`）+ `@vitejs/plugin-react`
- `vite-tsconfig-paths`でパスエイリアス（`@/*`）をテスト実行時にも解決
- `@testing-library/react` / `@testing-library/dom`は導入済みだが、テスト方針（ロジックのみテストする）により現状のテストでは使っていない

## CI / デプロイ

- GitHub Actions（`.github/workflows/ci.yml`）— `main`へのpush時に、`frontend/`で`npm ci` → `lint` → `typecheck` → `test:run`を実行する。Node.jsのバージョンは`frontend/.nvmrc`から読む
- Vercel — Root Directoryは`frontend`。本番URLは`https://www.kaizen-tech-blog.com`（ドメイン・DNSはCloudflare）

## Lint / Format

- ESLint 9（`eslint-config-next`のcore-web-vitals + typescriptルールセット）

## Next.js 16特有の注意点

このプロジェクトのNext.jsバージョンはトレーニングデータと挙動が異なる可能性があるため、実装時は必ず`node_modules/next/dist/docs/`を参照すること（`AGENTS.md`のルール）。特に以下はv15以前と挙動が異なるため、[04_data_fetching_policy.md](./04_data_fetching_policy.md)で詳説する。

- `fetch`はデフォルトでキャッシュされない（v15以降）
- Cache Components（`cacheComponents: true`）と`"use cache"`ディレクティブによる新しいキャッシュ制御（v16〜）
- 現状の`next.config.ts`では`cacheComponents`は未設定。**有効にしない方針に決定**し、fetch単位のキャッシュ（`next.revalidate`・`next.tags`）を使う（[04_data_fetching_policy.md](./04_data_fetching_policy.md)の「キャッシュ戦略」参照）
- `revalidateTag`は第2引数（`"max"`など）が必須。1引数の形は非推奨
- `error.tsx`の再試行の関数は`retry`（データを取り直して再描画する）。従来の`reset`は残っているが、データを取り直さない
