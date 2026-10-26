# KAIZEN 技術ブログ（tech-blog-v2）

Next.js（App Router）と TypeScriptとmicroCMS で作っている個人の技術ブログです。

<img width="1400" height="788" alt="image" src="https://github.com/user-attachments/assets/61bbe07b-eb6f-4df9-abe2-a3096d99a54a" />

サービスURL： https://www.kaizen-tech-blog.com


## 詳細
こちらの記事で紹介しています。

https://qiita.com/takahiro_honda/items/19f15f755afbd922afe7

## このプロジェクトについて

自分で運用し続けることを前提にした技術ブログです。記事を書いて学びを残すことに加えて、技術選定・設計・実装を実際に動くサービスの上で検証する場として作っています。

- **技術検証**: Next.js 16 の App Router・Server Components・fetch 単位のキャッシュと Webhook による再検証などを、本番の構成で試す
- **設計検証**: 参考にしたアーキテクチャ（下記）を小規模なサービスに当てはめたとき、どこを採用し、どこを簡略化するかを判断し、その理由をドキュメントに残す
- **運用と保守**: 記事を書き続け、機能を足していけるよう、レイヤー分離・テスト・CI を整えておく

設計の参考:

- [Next.js App Router アーキテクチャの設計思想](https://zenn.dev/yukionishi/articles/cd79e39ea6c172)


## 主な機能

- 記事一覧（トップページ）: カテゴリ・月・キーワードでの絞り込み、表示件数の切り替え、ページネーション（状態はすべて URL のクエリで表す）
- 記事詳細: アイキャッチ・カテゴリ・本文、X / Facebook / はてなブックマークへのシェア、OGP
- 固定ページ: このブログについて・プロフィール・プライバシーポリシー・免責事項（本文は microCMS で管理）
- サイドバー: 検索、著者カード、カテゴリー・アーカイブの集計
- SEO: ページごとのメタデータ、canonical、サイトマップ、robots.txt
- キャッシュ: microCMS への問い合わせを 1 時間キャッシュし、記事の公開・更新時は Webhook で即時に反映
- セキュリティ: リッチエディタの HTML をサーバー側でサニタイズ、API キーを扱うモジュールを `server-only` で保護
- PWA: ホーム画面への追加（オフライン対応はなし）

## 技術スタック

| 分類 | 使用技術 |
|---|---|
| フレームワーク | Next.js 16（App Router）/ React 19 / TypeScript 5 |
| ランタイム | Node.js 24 |
| スタイリング | Tailwind CSS v4 / daisyUI v5 / @tailwindcss/typography |
| CMS | microCMS（`microcms-js-sdk`） |
| テスト | Vitest |
| Lint | ESLint 9（`eslint-config-next`） |
| CI | GitHub Actions（lint・typecheck・test） |
| ホスティング | Vercel（ドメイン・DNS は Cloudflare） |

詳細は [frontend/docs/01_tech_stack.md](frontend/docs/01_tech_stack.md) を参照してください。

## ディレクトリ構成

```
.
├── docs/                 # プロダクト全体の設計（要件・ユースケース・UI・ドメイン・コンテンツモデル・API）
├── frontend/             # アプリ本体
│   ├── docs/             # フロントエンド実装の設計
│   ├── src/
│   │   ├── app/          # ルーティングとページの組み立て（薄く保つ）
│   │   ├── features/     # 機能ごとの UI とロジック（blog-list / blog-detail / sidebar）
│   │   ├── external/     # 外部サービス（microCMS）との接続点
│   │   └── shared/       # 機能に依存しない共通の部品・関数・定数
│   └── tests/            # ロジックのテスト（src/ と同じ階層）
└── .github/workflows/    # CI
```

レイヤー分離の考え方は [frontend/docs/02_architecture.md](frontend/docs/02_architecture.md)、各ファイルの役割は [frontend/docs/03_directory_structure.md](frontend/docs/03_directory_structure.md) を参照してください。

## ローカルでの起動

アプリ本体は `frontend/` にあるため、コマンドはすべて `frontend/` で実行します。

```bash
cd frontend
nvm use          # .nvmrc の Node.js 24 を使う
npm ci
npm run dev      # http://localhost:3000
```

### 環境変数

`frontend/.env` に次の値を設定します（`.env` は Git 管理外）。いずれもサーバー専用で、`NEXT_PUBLIC_` は付けません。

| 変数 | 内容 |
|---|---|
| `MICROCMS_SERVICE_DOMAIN` | microCMS のサービスドメイン |
| `MICROCMS_API_KEY` | microCMS の API キー（読み取り権限のみで足りる） |
| `SITE_URL` | サイトのオリジン（ローカルは `http://localhost:3000`。末尾の `/` は付けない） |
| `MICROCMS_WEBHOOK_SECRET` | Webhook の署名検証用のシークレット（`/api/revalidate` を使う場合のみ） |

未設定の場合は、どの変数が足りないかが分かるエラーになります。microCMS 側に必要な API（`blogs`・`profile`・`about`・`privacy-policy`・`disclaimer`）とフィールドは [docs/global_design/06_content_model.md](docs/global_design/06_content_model.md) を参照してください。

### npm スクリプト

| コマンド | 内容 |
|---|---|
| `npm run dev` | 開発サーバーを起動 |
| `npm run build` | 本番ビルド（ページごとのレンダリング方式も出力される） |
| `npm run start` | ビルド結果を起動（キャッシュの効き方はこちらで確認する） |
| `npm run lint` | ESLint |
| `npm run typecheck` | 型チェック（`tsc --noEmit`） |
| `npm run test` | Vitest（ウォッチモード） |
| `npm run test:run` | Vitest（1 回だけ実行。CI と同じ） |
| `npm run test:coverage` | カバレッジ付きで実行 |

## テスト方針

見た目やレイアウトのテストは書かず、ロジック（絞り込み・ページ分割・集計・メタデータの組み立て・シェア URL・サニタイズ・Webhook の署名検証・microCMS の呼び出しなど）だけをテストしています。詳細は [frontend/docs/05_development_guide.md](frontend/docs/05_development_guide.md) を参照してください。

## デプロイ

`main` ブランチへの push で GitHub Actions の CI（lint・typecheck・test）が走り、Vercel が本番にデプロイします。Vercel の Root Directory は `frontend` です。記事の公開・更新は microCMS の Webhook から `/api/revalidate` が呼ばれ、キャッシュが更新されます。

## ドキュメント

設計ドキュメントの一覧は [docs/README.md](docs/README.md) にまとめています。
