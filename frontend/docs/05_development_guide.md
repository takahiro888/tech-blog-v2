# 開発ガイド

## 前提

このドキュメント群は設計方針を示すものであり、**アプリケーションのロジック実装はご自身で行ってください**（学習目的のため）。ファイル・ディレクトリの機械的な移動やCI設定の更新など、コーディングを伴わない構成変更については依頼があれば代行します。方針とコード例の提示に留める範囲と、代行した範囲は各フェーズの記載を参照してください。

## 移行チェックリスト

現状のコードから目標構成（[03_directory_structure.md](./03_directory_structure.md)）へ移行する際の推奨順序。**「構造を先に固めてから、中身（microCMSの拡張フィールドやデザインの作り込み）は後から」**という方針で進める。この間、サイドバーやカードは`03_content_model.md`の拡張フィールドがまだ無い前提で、仮データ・仮スタイルで組んでおき、後続フェーズで本来のデータに差し替える。

### フェーズ0: リポジトリ構成の変更（`frontend/`への移動）✅ 完了

アプリ本体一式・`docs/frontend/`・`.github/workflows/ci.yml`の移動/更新は実施済み。以下は実施した内容の記録。

参考リポジトリと同じく、アプリ本体一式を`frontend/`サブディレクトリへ移動する。他のどのステップよりも先に、単独のコミットとして行うことを推奨する（他の変更と混ざると差分が読みにくくなるため）。

1. ✅ アプリ本体のファイル・ディレクトリを`frontend/`配下へ移動（`git mv`。トラッキング対象外の`node_modules` / `.env` / `next-env.d.ts`は`mv`で移動、`.next`・`tsconfig.tsbuildinfo`はビルドキャッシュのため削除して再生成に委ねた）
2. ✅ `.github/workflows/ci.yml`を更新し、`frontend/`ディレクトリ内でコマンドを実行するように変更（`working-directory: frontend`を各ステップに追加、`cache-dependency-path: frontend/package-lock.json`も指定）
3. ✅ `frontend/.gitignore`を新規作成 — ルートの`.gitignore`は`/node_modules`・`/.next/`等が**ルート起点のパターン**のため、`frontend/`配下には効かない。同等のルールを`frontend/.gitignore`に追加した
4. ⬜ デプロイ先（Vercel等）のRoot Directory設定を`frontend`に変更する（ダッシュボード側の操作のため未実施、各自対応）
5. ⬜ `frontend/`ディレクトリ内で`npm run dev` / `npm run build` / `npm run test:run`が問題なく動くことを確認する（未実施、各自確認）

### フェーズ1: ディレクトリ構造の再編（`frontend/`内部の整理）

1. **`external/microcms/` の作成**
   - `lib/microcms.ts` を `external/microcms/client.ts` + `external/microcms/blogs.ts` に分割
   - `lib/types.ts` の `Blog` 型を `external/microcms/types.ts` に移動（フィールド拡張はまだ行わない）
2. **`app/api/blogs/*` と `app/api/qiita/*` の廃止**（同じファイルを触るためまとめて実施）
   - `app/page.tsx` / `app/blogs/page.tsx` から `external/microcms/blogs.ts` を直接呼ぶよう変更
   - `app/page.tsx` のQiita記事一覧セクションを削除
   - 不要になった `app/api/blogs/route.ts` / `app/api/blogs/[id]/route.ts` / `app/api/qiita/route.ts` を削除
   - `.env` の `QIITA_API_KEY` / `NEXT_PUBLIC_QIITA_API_KEY` を削除（microCMS関連の環境変数のみ残す）
3. **`features/` の作成とコンポーネント移動**
   - `components/ArticleCard.tsx` / `ArticleGrid.tsx` を `features/blog-list/components/` へ移動
   - `ArticleGrid` からデータ取得ロジック（`useEffect`+`fetch`）を除去し、propsでデータを受け取る形に変更

### フェーズ2: 中身の実装（構造が固まった後）

4. **microCMSスキーマ拡張とcontent_model.mdの反映**
   - `excerpt` / `categories` / `cardLabel` / `cardCaption` / `cardTheme` / `readingMinutes` をmicroCMS側に追加し、`external/microcms/types.ts`に反映
5. **サイドバー機能の実装**
   - `features/sidebar/` にAuthorCard / TopicsList / ArchiveList / SearchBoxを実装
   - TOPICS・ARCHIVEは記事データからの集計ロジックが必要（`external/microcms/blogs.ts`に集計用関数を追加するか、features内で計算するかは設計時に決める）
6. **カテゴリフィルタ・検索の実装**
   - まずはクライアント側フィルタ（案A）で実装し、動作確認後に必要であれば案B（URL `searchParams`）へ移行
7. **`/about` ページの新規作成**

各ステップごとにコミットを分けると、後から見直しやすくなる。

## コーディング規約（案）

- import は `@/` エイリアスに統一する（現状`components/ArticleGrid.tsx`は相対パス、`app/blogs/[id]/page.tsx`は`@/`と混在している）
- `external/` 層はmicroCMS SDKへの依存をこの層の外に漏らさない（`features/`や`app/`からは`external/microcms/blogs.ts`が返す型だけを扱う）
- Server Componentで完結できる処理に`"use client"`を安易に付けない。クライアント側の状態（開閉、フィルタ選択等）が必要な最小単位のみをクライアントコンポーネントに切り出す

## テスト方針

- `external/microcms/`の関数は、microCMS SDKをモックした単体テストを追加する（現状`tests/`には`Button.test.tsx`のみで、データ取得層のテストがない）
- `features/`のコンポーネントは、Testing Libraryでの表示・インタラクションのテストを追加する
- 既存の`npm run test`（vitest）をそのまま利用する

## 将来検討（参考記事の「設計の仕組み化」に対応）

記事数・機能が増えてレイヤー違反（例: `app/`から直接microCMS SDKを呼んでしまう等）が起きやすくなったら、以下を検討する。

- ESLintの`no-restricted-imports`等で、`app/`から`external/`への直接importを禁止し、`features/`経由を強制する
- `external/microcms/types.ts`の型と`features/`側で使う型を分け、DTO変換を通す

MVPの現段階では、まず[03_directory_structure.md](./03_directory_structure.md)のレイヤー分離を守ることを優先し、仕組み化は必要になったタイミングで導入する。
