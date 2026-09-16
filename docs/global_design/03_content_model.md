# コンテンツモデル設計

参考リポジトリの`06_database_design.md`に相当。本プロジェクトはDBを持たず、**microCMSのコンテンツモデル**がデータの正となる。

## 現状のモデル（`lib/types.ts`）

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
| categories | カテゴリ | 複数選択 or コンテンツ参照(`categories`) | フィルタタブ・TOPICSに使用。React / TypeScript / CSS / Testing / Git 等 |
| cardLabel | カード見出し文字 | テキストフィールド | カード内の大きな装飾文字（例: `TypeScript`, `useSomething()`） |
| cardCaption | カードキャプション | テキストフィールド | カード内の小さな添え文字（例: `type Safe = Learn<T>`） |
| cardTheme | カード配色 | セレクトフィールド | `blue` / `dark` / `green` / `purple` / `black` 等、デザインのバリエーション |
| readingMinutes | 読了時間（分） | 数値 | 「3 min read」表示用。未設定なら本文の文字数から概算する実装でも可 |
| eyecatch | アイキャッチ画像 | 画像 | 既存（現状カードでは未使用、詳細ページ等で活用余地あり） |
| publishedAt | 公開日時 | 既存の公開日時 | 既存 |

> カード装飾（`cardLabel` / `cardCaption` / `cardTheme`）は記事投稿のたびに手動設定するコストが発生する。「記事ごとに凝ったデザインを手動設定する」か「カテゴリに応じて自動でテーマ配色を決める（実装側で固定マッピングを持つ）」かはトレードオフがあるため、見た目のこだわりと運用コストのどちらを優先するか実装前に決めておくとよい。

### `categories`（新規・任意）

カテゴリを独立コンテンツにするか、`blogs`内の複数選択フィールドで済ませるかは記事数次第。件数が少ないうちは複数選択フィールドで十分。

| フィールドID | 表示名 | 型 |
|---|---|---|
| name | カテゴリ名 | テキスト |
| slug | スラッグ | テキスト |

### `profile`（新規・任意、シングルトン想定）

サイドバーの著者情報をコードに埋め込みたくない場合、microCMSのオブジェクト形式コンテンツとして管理する。

| フィールドID | 表示名 | 型 |
|---|---|---|
| name | 名前 | テキスト |
| role | 肩書き | テキスト |
| bio | 自己紹介 | テキストエリア |
| avatar | アバター画像 | 画像 |
| profileUrl | プロフィールページURL | テキスト |

更新頻度が低いなら、`lib/constants.ts`に定数として持たせる実装でも問題ない。

## 型定義への反映イメージ（`lib/types.ts`拡張案）

```ts
export type Category = {
  id: string;
  name: string;
};

export type Blog = {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  categories: Category[];
  cardLabel: string;
  cardCaption: string;
  cardTheme: "blue" | "dark" | "green" | "purple" | "black";
  readingMinutes: number;
  eyecatch?: { url: string; width: number; height: number };
  publishedAt: string;
};
```

型定義自体の変更は実装時にご自身で行ってください。ここでは設計の方向性のみを示しています。
