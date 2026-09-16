# アーキテクチャの設計思想

[Next.js App Router アーキテクチャの設計思想](https://zenn.dev/yukionishi/articles/cd79e39ea6c172)で示されている4原則を、本プロジェクトの規模に合わせて採用する。

## 参考記事の4原則と本プロジェクトでの採用方針

| # | 原則 | 参考元の内容 | 本プロジェクトでの採用 |
|---|---|---|---|
| 1 | 意図的なレイヤー分離 | `app/`を薄く、`features/`がドメイン単位の司令塔、`external/`が外部接続点 | **採用**。詳細は[03_directory_structure.md](./03_directory_structure.md) |
| 2 | ルーティングによるUX設計 | 認証状態（guest/authenticated/neutral）ごとにルートグループを分離 | **不採用（該当なし）**。本プロジェクトは認証を持たない公開ブログのため、ルートグループによる認証状態の表現は不要。将来管理画面等を追加する場合に再検討する |
| 3 | Server-firstなデータフェッチ | サーバー側でキャッシュを構築し、HydrationBoundaryでクライアントに渡す | **趣旨を採用、実装手段は簡略化**。TanStack Queryは導入せず、Next.js 16のServer Components + `"use cache"`によるサーバー完結のデータ取得に統一する。詳細は[04_data_fetching_policy.md](./04_data_fetching_policy.md) |
| 4 | 設計の仕組み化 | ESLintカスタムルール、DTO検証、Error Boundaryで設計品質を自動的に守る | **将来検討**。まずは手動でレイヤー分離を守り、破られやすくなったらESLintルールの追加を検討する（[05_development_guide.md](./05_development_guide.md)のTODOに記載） |

## 3層構造

```
app/        … ルーティングとページの組み立てのみ（薄く保つ）
features/   … 画面・機能単位のロジックとUIの司令塔
external/   … 外部（microCMS）との接続点。差し替え可能にする
```

### なぜこの3層にするか

現状の実装（`app/page.tsx`が`ArticleGrid`を直接呼び、`ArticleGrid`がAPI Route経由でmicroCMSのデータをクライアント側でfetchする構成）には、以下の課題がある。

1. `components/ArticleGrid.tsx`が「データ取得」と「表示」の両方を担っており、責務が混ざっている
2. `app/api/blogs/route.ts`という内部API Routeを経由しているが、Server Componentなら`lib/microcms.ts`を直接呼べるため、このAPI Routeは実質不要な中継層になっている
3. `lib`という名前だけでは「外部接続点」であることが伝わらない

これらを`external/microcms/`（外部接続点）と`features/*/`（機能単位のUI・ロジック）に分けることで、**フォルダ名を見るだけで責務がわかる**状態を目指す。これが参考記事の「意図的なレイヤー分離」の核心。

## 外部層の差し替え可能性

参考記事では「Drizzleから外部マイクロサービスへの移行も容易」という利点が挙げられている。本プロジェクトでも`external/microcms/`にmicroCMSへの依存を閉じ込めておくことで、将来的に別のヘッドレスCMS（例: Contentful, newt等）へ移行する場合も`external/`層の実装を差し替えるだけで済み、`features/`層への影響を最小化できる。
