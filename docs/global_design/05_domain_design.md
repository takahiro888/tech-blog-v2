# ドメイン設計書

本ブログは読み取り専用で、状態遷移も権限も持たない。そのため参考リポジトリのような重い集約・ドメインサービスは不要で、ここでは**「何を表すデータ（エンティティ・値）」と「テストできる純粋なルール（ドメインロジック）」**に絞って整理する。

## 設計方針

- 永続化はmicroCMSに任せる。本アプリは**読み取ったデータを表示用に整える**ことが責務
- ルールは副作用のない**純粋関数**として切り出す（入力→出力が決まる）。UIやmicroCMS SDKに依存させない
- 純粋関数はテストしやすい。テストは「ロジック」のみを対象にし、見た目やレイアウトのテストは書かない
- `external/`層の型（microCMSのレスポンス形）と、アプリ内で使う型（Article）は**分けて考える**。変換は`external/`の境界で行う（規模が小さい間は同一型でも可）

## エンティティ

| エンティティ | 説明 | 主な属性 |
|---|---|---|
| Article | 記事1件。ブログの中心 | id, title, excerpt, body, categories[], card, publishedAt, eyecatch? |
| Category | 記事の分類 | id, name, slug |
| Author | 著者（サイト全体で1人）。著者カードと`/profile`の元になる | name, role, bio, avatarUrl?, snsLinks[], profileImageUrl?, profileBody |
| SnsLink | 著者のSNSへの外部リンク（Authorの一部） | type（`github` / `x` など）, url |

## 値オブジェクト（VO）

| 名前 | 使う場所 | 守るルール | 例 |
|---|---|---|---|
| ArticleCardStyle | Article.card | `label`（大きな装飾文字）`caption`（添え文字）`theme` の3点セット。`theme`は定義済みの値のみ | `{ label: "TypeScript", caption: "type Safe = Learn<T>", theme: "blue" }` |
| CardTheme | ArticleCardStyle.theme | `blue` / `dark` / `green` / `purple` / `black` / `yellow` のいずれか | `blue` |
| ArchiveMonth | Archiveの1項目 | `YYYY-MM`形式 | `2026-09` |
| PublishedAt | Article.publishedAt | ISO 8601の日時文字列。表示時は`YYYY.MM.DD`に整形 | `2026-09-14T09:00:00.000Z` |

## 集約・関係

読み取り専用のため、トランザクション境界や不変条件を守る**書き込み集約は存在しない**。データの関係だけを示す。

```
[Article] ──has many──> [Category]      … 記事は複数カテゴリを持てる（0件も可）
[Article] ──has──> [ArticleCardStyle]   … 表示用の装飾情報（VO）
[Author] ──has many──> [SnsLink]         … 著者はSNSリンクを持つ
[Author]                                … 記事とは関連付けない（サイト全体で1人）。`/profile`の本文（HTML）も保持する
```

| 項目 | 内容 |
|---|---|
| 集約ルート | Article（読み取りの単位。カテゴリは参照として持つ） |
| 一意性 | ArticleId、Category.slug はそれぞれ一意 |
| 整合性 | 参照先のカテゴリが削除された場合は、microCMS側の参照解除に従う。本アプリは存在するカテゴリのみを扱う |

## ドメインロジック（純粋関数）

### 記事の表示ルール

| ルール | 内容 | 関数（案） |
|---|---|---|
| NEWバッジ | 公開日から**7日以内**の記事に付ける。基準日は「現在日時」を引数で渡す（テスト可能にするため） | `isNew(publishedAt, now, days = 7)` |
| 公開日の表記 | `YYYY.MM.DD`（カード・詳細）。**日本時間（JST）**で日付を決める | `formatPublishedDate(iso)` |
| 並び順 | 公開日の降順 | `sortByPublishedAtDesc(articles)` |
| 件数表記 | 2桁ゼロ埋め（`06 ARTICLES`）。100件以上はそのまま | `formatArticleCount(n)` |

> 「7日」「500字/分」は初期値の提案。変更しやすいよう定数として切り出す。

### 絞り込み・検索

| ルール | 内容 | 関数（案） |
|---|---|---|
| キーワード検索 | タイトルの部分一致。大文字小文字・全角半角の空白の違いを無視。空文字は全件 | `matchesKeyword(article, q)` |
| カテゴリ絞り込み | 選択したカテゴリ（slug）を持つ記事。未選択（すべて）は全件 | `matchesCategory(article, slug?)` |
| 月絞り込み | `publishedAt`のJST年月が`YYYY-MM`と一致 | `matchesMonth(article, month?)` |
| 合成 | 上記のAND条件 | `filterArticles(articles, { q, category, month })` |

### 集計

| ルール | 内容 | 関数（案） |
|---|---|---|
| TOPICS集計 | 記事群からカテゴリごとの件数を数える。0件のカテゴリは出さない。表示順は件数の降順、同数はカテゴリ名順（モックの並びと異なる場合は実装時に調整） | `aggregateCategories(articles)` |
| ARCHIVE集計 | 記事群から`YYYY-MM`ごとの件数を数える。新しい月が先頭 | `aggregateArchives(articles)` |
| フィルタタブ生成 | 「すべて」＋`aggregateCategories`の結果 | `buildCategoryTabs(articles)` |
| 最新記事の抽出 | サイドバー用。表示中の記事を除き、新しい順に上位N件 | `pickLatest(articles, { exclude, limit })` |

## 置き場所

参考リポジトリの`features/`がドメイン単位の司令塔になる考え方に合わせる。

| 種類 | 置き場所（案） | 備考 |
|---|---|---|
| Article / Category / Author の型 | `shared/lib/types.ts`（規模が育てば`features/*/types.ts`） | UIとexternalの両方から参照される |
| 表示ルール・絞り込み・集計の純粋関数 | `features/blog-list/lib/`（記事一覧が中心のため）。サイドバーでのみ使うものは`features/sidebar/lib/` | 複数featureで使うと分かった時点で`shared/lib/`へ昇格 |
| microCMSレスポンス → Article への変換 | `external/microcms/` | 外部の形をアプリに持ち込まない |
| 定数（NEW日数、字/分、ヒーロー文言） | `shared/lib/constants.ts` | |

## テスト方針

- 対象: 上記の純粋関数（`isNew`, `filterArticles`, `aggregate*` など）と、microCMS呼び出し層のパラメータ組み立て
- 対象外: コンポーネントの見た目・レイアウト・スタイル
- 境界値の例: NEWの7日ちょうど、UTCとJSTの日付またぎ（`2026-09-13T16:00:00Z`はJSTで`09-14`）、カテゴリなしの記事、検索語が空
