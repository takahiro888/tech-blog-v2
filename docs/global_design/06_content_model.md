# コンテンツモデル設計

参考リポジトリの`06_database_design.md`に相当。本プロジェクトはDBを持たず、**microCMSのコンテンツモデル**がデータの正となる。用語は[03_ubiquitous_language.md](./03_ubiquitous_language.md)、アプリ内の型（Article）への変換は[07_api_design.md](./07_api_design.md)を参照。

## 現状のモデル（`frontend/src/external/microcms/types.ts`の`Blog`）

```ts
export type Blog = {
  id: string;
  title: string;
  content: string;
  eyecatch?: { url: string; width: number; height: number };
  publishedAt: string;
};
```

モック画面を実現するには、カテゴリ・要約・カード装飾用の情報が不足している。

## 提案するmicroCMSスキーマ

### `blogs`（既存APIを拡張）

| フィールドID | 表示名 | 型 | 備考 |
|---|---|---|---|
| title | タイトル | テキストフィールド | 既存 |
| content | 本文 | リッチエディタ | 既存 |
| excerpt | 要約 | テキストフィールド | カード・詳細ページの説明文（モックの「ユニオン型と型ガードで、安全で読みやすいコードに。」に相当） |
| categories | カテゴリ | セレクトフィールド（複数選択） | フィルタタブ・TOPICSに使用。React / TypeScript / Next.js / CSS / Testing / Git 等。選択肢の文字列はコード側のテーママッピングのキーと一致させる。レスポンスは`string[]` |
| eyecatch | アイキャッチ画像 | 画像 | 既存（現状カードでは未使用、詳細ページ等で活用余地あり） |
| publishedAt | 公開日時 | 既存の公開日時 | 既存 |

> カード装飾（配色・大きな装飾文字）はmicroCMSにフィールドを持たず、**カテゴリから実装側で自動導出する**方針（先頭カテゴリ→テーマの固定マッピング、装飾文字は先頭カテゴリ名）。記事ごとに手動設定する運用コストを避けるための判断。必要になった場合のみ`cardTheme`等を後から追加する。

### カテゴリの管理方法

カテゴリは独立したAPI（コンテンツ参照）にせず、`blogs`の**セレクトフィールド（複数選択）**で管理する。レスポンスは文字列の配列（`["React", "TypeScript"]`）で、カテゴリ名がそのまま識別子になる（`slug`・`id`は持たない）。選択肢の追加時は、コード側の`CATEGORIES`とテーママッピングにも反映する。カテゴリごとに説明文やアイコンを持たせたくなった場合に、独立APIへの移行を検討する。

### `profile`（新規・**必須**、オブジェクト形式＝1件のみ）

内部プロフィールページ（`/profile`）の本文が長く、リッチエディタで編集したいため、microCMSの**オブジェクト形式**（シングルトン）で管理する。サイドバーの著者カードも同じデータを使う。

| フィールドID | 表示名 | 型 | 用途 |
|---|---|---|---|
| name | 名前 | テキスト | 著者カード（例: `ある Web エンジニア`） |
| role | 肩書き | テキスト | 著者カード（例: `フロントエンドエンジニア`） |
| bio | 自己紹介（短文） | テキストエリア | 著者カードの3行程度の紹介文、`/profile`のメタ`description` |
| avatar | アバター画像 | 画像 | 著者カードの円形アバター。未設定なら`m_`ロゴで代替 |
| mainImage | メイン画像 | 画像（任意） | `/profile`上部のメインビジュアル |
| content | プロフィール本文 | リッチエディタ | `/profile`の本文（「何をしている人か」「経歴」「スキル」など） |
| snsLinks | SNSリンク | 繰り返しフィールド（`type`: セレクト / `url`: テキスト） | 著者カードのSNSアイコン（GitHub / X など） |

- 以前の案にあった`profileUrl`（外部プロフィールURL）は**廃止**。内部ページ`/profile`に固定する
- 著者カードだけなら定数でも足りるが、`/profile`の本文をCMSで編集したいため、`profile`はmicroCMSで管理する方針とする

## 型定義への反映イメージ（`external/microcms/types.ts`の拡張案）

```ts
export type Category = string; // セレクトフィールドの選択肢（カテゴリ名）

export type Blog = {
  id: string;
  title: string;
  content: string;
  excerpt?: string; // 未入力の場合、レスポンスにキー自体が含まれない
  categories?: Category[]; // 同上
  card: { label: string; theme: "blue" | "dark" | "green" | "purple" | "black" | "yellow" }; // カテゴリから導出
  eyecatch?: { url: string; width: number; height: number };
  publishedAt: string;
};
```

型定義自体の変更は実装時にご自身で行ってください。ここでは設計の方向性のみを示しています。
