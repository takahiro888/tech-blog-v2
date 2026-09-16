# 技術スタック

現状の`package.json`に基づく。

## フレームワーク・ランタイム

- Next.js 16.3.4（App Router）
- React 19.2.8 / React DOM 19.2.8
- Node.js 24.x（`.nvmrc`, `engines`）
- TypeScript 5（strict mode）

## スタイリング

- Tailwind CSS v4（`@tailwindcss/postcss`）
- daisyUI v5（現状`ArticleCard`等で`card`, `btn`等のクラスを使用）

## データソース

- microCMS（`microcms-js-sdk`）— ブログ記事のヘッドレスCMS
- ~~Qiita API~~ — スコープ外（[global_design/01_requirements.md](../global_design/01_requirements.md)参照）

## テスト

- Vitest + `@testing-library/react` + `@testing-library/dom` + jsdom
- `vite-tsconfig-paths`でパスエイリアス（`@/*`）をテスト実行時にも解決

## Lint / Format

- ESLint 9（`eslint-config-next`のcore-web-vitals + typescriptルールセット）

## Next.js 16特有の注意点

このプロジェクトのNext.jsバージョンはトレーニングデータと挙動が異なる可能性があるため、実装時は必ず`node_modules/next/dist/docs/`を参照すること（`AGENTS.md`のルール）。特に以下はv15以前と挙動が異なるため、[04_data_fetching_policy.md](./04_data_fetching_policy.md)で詳説する。

- `fetch`はデフォルトでキャッシュされない（v15以降）
- Cache Components（`cacheComponents: true`）と`"use cache"`ディレクティブによる新しいキャッシュ制御（v16〜）
- 現状の`next.config.ts`では`cacheComponents`は未設定
