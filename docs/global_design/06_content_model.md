# コンテンツモデル設計

参考リポジトリの`06_database_design.md`に相当。本プロジェクトはDBを持たず、**microCMSのコンテンツモデル**がデータの正となる。用語は[03_ubiquitous_language.md](./03_ubiquitous_language.md)、取得方法は[07_api_design.md](./07_api_design.md)を参照。

## microCMSのAPI一覧

| エンドポイント | 形式 | 用途 |
|---|---|---|
| `blogs` | リスト形式 | 記事 |
| `profile` | オブジェクト形式 | 著者情報（`/profile`・著者カード） |
| `about` | オブジェクト形式 | このブログについて（`/about`） |
| `privacy-policy` | オブジェクト形式 | プライバシーポリシー（`/privacy-policy`） |
| `disclaimer` | オブジェクト形式 | 免責事項（`/disclaimer`） |

いずれも必須。コード側では`external/microcms/endpoints.ts`の`MICROCMS_ENDPOINTS`に同じ名前を並べ、キャッシュのタグとWebhookの判定に使っている。

## スキーマ

### `blogs`

| フィールドID | 表示名 | 型 | 備考 |
|---|---|---|---|
| title | タイトル | テキストフィールド | 一覧・詳細・パンくず・シェア・meta title |
| content | 本文 | リッチエディタ | 記事詳細の本文。描画前にサニタイズする |
| excerpt | 要約 | テキストフィールド | 記事の説明文（モックの「ユニオン型と型ガードで、安全で読みやすいコードに。」に相当）。画面には表示せず、記事詳細のmeta description・OGP（`openGraph.description`）にのみ使う。未入力の場合はルートの既定のdescriptionになる |
| categories | カテゴリ | セレクトフィールド（複数選択） | カードのタグ・サムネイルの装飾と配色、サイドバーのカテゴリー集計、絞り込みに使用。React / TypeScript / Next.js / CSS / Testing / Git 等。選択肢の文字列はコード側のテーママッピングのキーと一致させる。レスポンスは`string[]`（未選択ならキー自体が無い） |
| eyecatch | アイキャッチ画像 | 画像（任意） | 記事カードのサムネイル（未設定ならカテゴリ由来の装飾で代替）、記事詳細の先頭画像、OGP画像 |
| publishedAt | 公開日時 | microCMSのシステム項目 | 表示・新着判定・アーカイブ集計・月絞り込み |
| revisedAt | 最終公開日時 | microCMSのシステム項目 | サイトマップの`lastModified`。型`Blog`には定義しておらず、`sitemap-entries.ts`側で任意の項目として受け取っている |

> カード装飾（配色・大きな装飾文字）はmicroCMSにフィールドを持たず、**カテゴリから実装側で自動導出する**方針（先頭カテゴリ→テーマの固定マッピング、装飾文字は先頭カテゴリ名）。記事ごとに手動設定する運用コストを避けるための判断。必要になった場合のみ`cardTheme`等を後から追加する。

### カテゴリの管理方法

カテゴリは独立したAPI（コンテンツ参照）にせず、`blogs`の**セレクトフィールド（複数選択）**で管理する。レスポンスは文字列の配列（`["React", "TypeScript"]`）で、カテゴリ名がそのまま識別子になる（`slug`・`id`は持たない）。選択肢を追加したら、配色を決めたい場合はコード側のテーママッピング（`shared/lib/card-theme.ts`）にも追加する（追加しなければ既定の`blue`）。`external/microcms/types.ts`には選択肢の一覧`CATEGORIES`も定義してあるが、現状どこからも使われていない。カテゴリごとに説明文やアイコンを持たせたくなった場合に、独立APIへの移行を検討する。

### `profile`（**必須**、オブジェクト形式＝1件のみ）

内部プロフィールページ（`/profile`）の本文が長く、リッチエディタで編集したいため、microCMSの**オブジェクト形式**（シングルトン）で管理する。サイドバーの著者カードも同じデータを使う。

| フィールドID | 表示名 | 型 | 用途 |
|---|---|---|---|
| name | 名前 | テキスト | 著者カード |
| role | 肩書き | テキスト | 著者カード |
| bio | 自己紹介（短文） | テキストエリア | 著者カードの3行程度の紹介文（改行はそのまま表示）、`/profile`のメタ`description` |
| avatar | アバター画像 | 画像（任意） | 著者カードの円形アバター。未設定なら`m_`の文字で代替 |
| mainImage | メイン画像 | 画像（任意） | `/profile`上部のメインビジュアル。未設定なら非表示 |
| content | プロフィール本文 | リッチエディタ | `/profile`の本文（「何をしている人か」「経歴」「スキル」など） |
| snsLinks | SNSリンク | 繰り返しフィールド（カスタムフィールド。`type`: セレクト / `url`: テキスト） | 著者カードのSNSアイコン（GitHub / X など）。型（`SnsLink`。`fieldId`・`type: string[]`・`url`）は定義済みだが、画面への表示は未実装 |

- 以前の案にあった`profileUrl`（外部プロフィールURL）は**廃止**。内部ページ`/profile`に固定する
- 著者カードだけなら定数でも足りるが、`/profile`の本文をCMSで編集したいため、`profile`はmicroCMSで管理する方針とする

### `about`（**必須**、オブジェクト形式＝1件のみ）

内部ページ（`/about`）の本文を運営者が管理画面から編集できるように、`profile`と同じくmicroCMSの**オブジェクト形式**（シングルトン）で管理する。見出しテキスト（`「KAIZEN」ブログについて`）は変更頻度がほぼゼロのため、`profile`のh1と同様に`page.tsx`に固定で書き、CMS側は本文のみを持つ。

| フィールドID | 表示名 | 型 | 用途 |
|---|---|---|---|
| mainImage | メイン画像 | 画像（任意） | `/about`上部のメインビジュアル。`profile`と同じ扱いで、未設定なら非表示 |
| content | 本文 | リッチエディタ | `/about`の本文（ブログのコンセプト説明） |

- 以前の案では文章を定数管理としていたが、`profile`と足並みを揃えて運営者が編集できるようCMS管理に変更した
- タイトルは変更頻度がほぼゼロのため引き続き固定表示とする。今後編集したい項目が増えたら`profile`と同様にフィールドを追加する

### `privacy-policy`・`disclaimer`（**必須**、オブジェクト形式＝1件のみ）

フッターから遷移する規約系ページ（`/privacy-policy`・`/disclaimer`）の本文。`about`と同じくオブジェクト形式で管理し、見出し（ページ名）は`page.tsx`に固定で書く。2つは同じ形なので、型は`LegalPage`を共用する。

| フィールドID | 表示名 | 型 | 用途 |
|---|---|---|---|
| content | 本文 | リッチエディタ | 各ページの本文 |

## 型定義（`frontend/src/external/microcms/types.ts`）

```ts
export type Category = string; // セレクトフィールドの選択肢（カテゴリ名）

export type Blog = {
  id: string;
  title: string;
  content: string;
  excerpt?: string; // 未入力の場合、レスポンスにキー自体が含まれない
  categories?: Category[]; // 同上
  eyecatch?: { url: string; width: number; height: number };
  publishedAt: string;
};

export type MicroCMSImage = { url: string; width: number; height: number };

export type SnsLink = { fieldId: string; type: string[]; url: string };

export type Profile = {
  name: string;
  role: string;
  bio: string;
  avatar?: MicroCMSImage;
  mainImage?: MicroCMSImage;
  content: string;
  snsLinks?: SnsLink[];
};

export type About = { mainImage?: MicroCMSImage; content: string };

export type LegalPage = { content: string }; // privacy-policy・disclaimerで共用
```

- 旧案では`Blog`にカード装飾用の`card: { label, theme }`を持たせる予定だったが、カテゴリから描画時に導出できるため型には含めていない（[05_domain_design.md](./05_domain_design.md)参照）
- 任意項目（`?`）は、未入力のときレスポンスにキー自体が含まれない。使う側で`?? []`や条件付きの描画で扱う
