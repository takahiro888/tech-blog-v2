# tech-blog-v2 設計ドキュメント

このディレクトリには、tech-blog-v2（MARGIN | TECH JOURNAL）の設計ドキュメントをまとめています。

## 参考にした設計

- リポジトリ: [immortal-architecture-mvp](https://github.com/YukiOnishi1129/immortal-architecture-mvp)
- 記事: [Next.js App Router アーキテクチャの設計思想](https://zenn.dev/yukionishi/articles/cd79e39ea6c172)

参考元が採用している「2層のドキュメント体系（プロダクト全体の設計 / フロントエンド実装の設計）」と、「`app/`を薄く保ち、`features/`がドメイン単位の司令塔、`external/`が外部接続点になる」というレイヤー分離の思想を、本プロジェクトの規模（認証・DBを持たず、microCMSをヘッドレスCMSとして利用する読み取り主体のブログ）に合わせて採用しています。参考リポジトリと同じく、アプリ本体は`frontend/`サブディレクトリへ移動する方針も採用しています（[frontend/05_development_guide.md](../frontend/docs/05_development_guide.md)のフェーズ0参照）。

> **現在の状態**: `frontend/`ディレクトリへの移動作業（フェーズ0）は完了済みです。フロントエンド実装の設計ドキュメントは`frontend/docs/`に置かれています。次はフェーズ1（`frontend/`内部の`external/`・`features/`への再編）です。

## ドキュメント構成

### `global_design/` - プロダクト全体の設計

| # | ドキュメント | 内容 |
|---|---|---|
| 01 | [requirements.md](./global_design/01_requirements.md) | 要件定義 |
| 02 | [use_cases.md](./global_design/02_use_cases.md) | ユースケース（読者・運営者） |
| 03 | [ubiquitous_language.md](./global_design/03_ubiquitous_language.md) | ユビキタス言語一覧 |
| 04 | [ui_design.md](./global_design/04_ui_design.md) | UI設計（画面・コンポーネント・レスポンシブ） |
| 05 | [domain_design.md](./global_design/05_domain_design.md) | ドメイン設計（エンティティ・純粋なルール） |
| 06 | [content_model.md](./global_design/06_content_model.md) | microCMSのコンテンツモデル設計（DB設計書に相当） |
| 07 | [api_design.md](./global_design/07_api_design.md) | API設計（microCMS利用仕様・内部インターフェース） |

### `frontend/` - フロントエンド実装の設計

| # | ドキュメント | 内容 |
|---|---|---|
| 01 | [tech_stack.md](../frontend/docs/01_tech_stack.md) | 技術スタック |
| 02 | [architecture.md](../frontend/docs/02_architecture.md) | レイヤー分離の設計思想 |
| 03 | [directory_structure.md](../frontend/docs/03_directory_structure.md) | ディレクトリ構成（Before/After） |
| 04 | [data_fetching_policy.md](../frontend/docs/04_data_fetching_policy.md) | データ取得方針（Server-first） |
| 05 | [development_guide.md](../frontend/docs/05_development_guide.md) | 移行手順・コーディング規約 |

## 運用方針

- これらのドキュメントは設計の指針であり、実装（コードの変更）はご自身の手で行う前提で作成しています。
- コード例は「こう書ける」という参考イメージであり、そのままコピーして使うことを強制するものではありません。
- 参考元と異なり、認証・DB・複雑なドメインロジックを持たないため、参考リポジトリの`frontend/06_tanstack_query.md`・`08_authentication.md`に相当するドキュメントは本プロジェクトでは作成していません。なお`05_domain_design.md`は書き込み集約を持たない軽量版、`06_content_model.md`はDBの代わりにmicroCMSのモデルを扱う内容、`07_api_design.md`は独自HTTP APIを持たないためmicroCMS利用仕様が中心です。該当する設計判断が必要になった時点で追加してください。
