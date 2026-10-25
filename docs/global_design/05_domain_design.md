# ドメイン設計書

本ブログは読み取り専用で、状態遷移も権限も持たない。そのため参考リポジトリのような重い集約・ドメインサービスは不要で、ここでは**「何を表すデータ（エンティティ・値）」と「テストできる純粋なルール（ドメインロジック）」**に絞って整理する。

## 設計方針

- 永続化はmicroCMSに任せる。本アプリは**読み取ったデータを表示用に整える**ことが責務
- ルールは副作用のない**純粋関数**として切り出す（入力→出力が決まる）。UIやmicroCMS SDKに依存させない
- 純粋関数はテストしやすい。テストは「ロジック」のみを対象にし、見た目やレイアウトのテストは書かない
- `external/`層の型（microCMSのレスポンス形）と、アプリ内で使う型（Article）は本来分けて考える。**規模が小さい間は同一型でよい**とし、現状はmicroCMSのレスポンス型`Blog`（`external/microcms/types.ts`）を各層でそのまま使っている。変換層（DTO）は、型を分ける必要が出た時点で`external/`の境界に追加する

## エンティティ

| エンティティ | 説明 | 主な属性（現状の型のフィールド） |
|---|---|---|
| Article | 記事1件。ブログの中心。型は`Blog` | `id`, `title`, `excerpt?`, `content`（本文HTML）, `categories?`, `eyecatch?`, `publishedAt` |
| Category | 記事の分類。独立したエンティティではなく、Articleが持つ**カテゴリ名の文字列**（microCMSのセレクトフィールドの選択肢）。型は`Category = string` | 文字列そのもの |
| Author | 著者（サイト全体で1人）。著者カードと`/profile`の元になる。型は`Profile` | `name`, `role`, `bio`, `avatar?`, `mainImage?`, `content`（本文HTML）, `snsLinks?` |
| SnsLink | 著者のSNSへの外部リンク（Authorの一部）。型は定義済みだが、画面への表示は未実装 | `type`（`github` / `x` など。セレクトのため配列）, `url` |

## 値オブジェクト（VO）

| 名前 | 使う場所 | 守るルール | 例 |
|---|---|---|---|
| CardTheme | 記事カードのサムネイル | `blue` / `dark` / `green` / `purple` / `black` / `yellow` のいずれか。先頭カテゴリから導出し、記事のデータには持たない | `blue` |
| ArchiveMonth | アーカイブの1項目、`month`パラメータ | `YYYY-MM`形式（JSTの年月） | `2026-09` |
| PublishedAt | Article.publishedAt | ISO 8601の日時文字列。表示時は`YYYY.MM.DD`に整形 | `2026-09-14T09:00:00.000Z` |

- 旧案では`ArticleCardStyle`（`{ label, theme }`）を記事が持つ値として定義していたが、どちらもカテゴリから描画時に導出できるため、記事のデータとしては持たない形にした（装飾文字は先頭カテゴリ名、無ければ`Article`）

## 集約・関係

読み取り専用のため、トランザクション境界や不変条件を守る**書き込み集約は存在しない**。データの関係だけを示す。

```
[Article] ──has many──> Category（文字列） … 記事は複数カテゴリを持てる（0件も可）
[Article] ──derives──> CardTheme           … 先頭カテゴリから描画時に導出する（保持しない）
[Author] ──has many──> [SnsLink]          … 著者はSNSリンクを持つ
[Author]                                 … 記事とは関連付けない（サイト全体で1人）。`/profile`の本文（HTML）も保持する
```

| 項目 | 内容 |
|---|---|
| 集約ルート | Article（読み取りの単位。カテゴリは参照として持つ） |
| 一意性 | ArticleId は一意。カテゴリ名は1記事内で重複しない（Reactのkeyにもカテゴリ名を使う） |
| 整合性 | カテゴリの選択肢はmicroCMS側で管理し、コード側はテーママッピング（`shared/lib/card-theme.ts`）だけが選択肢の文字列に依存する。選択肢を追加したら、必要に応じてマッピングにも追加する。マッピングにないカテゴリは既定テーマ（`blue`）で表示する |

## ドメインロジック（純粋関数）

### 記事の表示ルール

| ルール | 内容 | 関数（置き場所） |
|---|---|---|
| 新着バッジ | 公開日から**7日以内**（`NEW_DAYS`）の記事に付ける。未来の日時は対象外。基準日は「現在日時」を引数で渡す（テスト可能にするため） | `isNew(publishedAt, now, days = NEW_DAYS)`（`shared/lib/published-at.ts`） |
| 公開日の表記 | `YYYY.MM.DD`（カード・詳細）。**日本時間（JST）**で日付を決める | `formatPublishedDate(iso)`（同上） |
| 年月の表記 | `YYYY-MM`を`YYYY年M月`に（パンくず・見出し・メタデータ） | `formatYearMonthLabel(yearMonth)`（同上） |
| カード配色 | 先頭カテゴリからテーマを決める。カテゴリなし・マッピングなしは`blue` | `getCardTheme(categories)`（`shared/lib/card-theme.ts`） |
| 並び順 | 公開日の降順 | `sortByPublishedAtDesc(articles)`（`shared/lib/sort-article.ts`）。関数とテストはあるが、現状どこからも呼ばれていない（並び順はmicroCMSの既定の順序に依存している。[05_development_guide.md](../../frontend/docs/05_development_guide.md)の「残課題」参照） |

### 絞り込み・検索

`features/blog-list/lib/filter-articles.ts`にまとめている。

| ルール | 内容 | 関数 |
|---|---|---|
| URLパラメータの解釈 | `searchParams`（`category` / `keyword` / `month` / `page` / `pageSize`）を絞り込み条件に変換する。`page`は正の整数でなければ1、`pageSize`は10・20・30以外なら10 | `parseArticlesSearchParams(raw)` |
| 絞り込み | 次の条件のAND。指定のない条件は無視する | `filterArticles(articles, { category, keyword, yearMonth })` |
| └ カテゴリ | 選択したカテゴリ名を持つ記事 | （`filterArticles`内） |
| └ 月 | `publishedAt`のJST年月が`YYYY-MM`と一致 | （同上） |
| └ キーワード | タイトルの部分一致。大文字小文字は区別しない。空文字は全件 | （同上） |
| 一覧URLの組み立て | 絞り込み条件とページ番号から`/?…`を作る。既定値（`page=1`・`pageSize=10`）はURLに含めない | `buildArticlesHref(query, targetPage)` |

### ページネーション

トップページ（`/`）の最新記事セクションが全記事一覧を兼ねる（旧`/blogs`は廃止）ため、`filterArticles`の結果に対してページ分割を行う。

| ルール | 内容 | 関数 |
|---|---|---|
| ページ分割 | 絞り込み済みの記事群を`pageSize`単位に分割し、指定`page`分を返す。`page`が総ページ数を超える場合は最終ページに、1未満は1ページ目にクランプする | `paginateArticles(articles, page, pageSize)` |
| 総ページ数・表示範囲 | 上記の戻り値に含める。総ページ数は`Math.max(1, Math.ceil(totalCount / pageSize))`、表示範囲は1始まりの`displayStart`〜`displayEnd`（0件のときは`0`〜`0`） | 戻り値`{ items, totalCount, currentPage, totalPages, displayStart, displayEnd }` |

> 適用順序は「絞り込み（`filterArticles`）→ ページ分割（`paginateArticles`）」。サイドバーのカテゴリー・アーカイブの集計は**絞り込み前の全記事**から行い、件数バッジは常に「絞り込みをかけていない場合の件数」を示す。

### 見出し・メタデータ

`features/blog-list/lib/list-metadata.ts`にまとめている（UIの文言の組み立てだが、分岐を含むのでロジックとして扱う）。

| ルール | 内容 | 関数 |
|---|---|---|
| パンくずの現在地 | カテゴリ名、または`YYYY年M月`。どちらも無ければ`null`（両方あればカテゴリ優先） | `buildFilterLabel(query)` |
| h1の見出し | `「◯◯」の記事一覧` ／ `YYYY年M月の記事一覧`。絞り込みなしは`null` | `buildArticleListHeading(query)` |
| トップページのMetadata | キーワード検索時は`「◯◯」の検索結果`＋`noindex`、カテゴリ・月の絞り込み時は見出しと同じtitleとdescription・canonical、それ以外は`canonical: "/"`のみ | `buildArticleListMetadata(query)` |

### 集計

`features/sidebar/lib/aggregate.ts`にまとめている。

| ルール | 内容 | 関数 |
|---|---|---|
| カテゴリー集計 | 記事群からカテゴリごとの件数を数える。0件のカテゴリは出さない。表示順は件数の降順、同数はカテゴリ名順 | `aggregateCategories(articles)` |
| アーカイブ集計 | 記事群からJSTの`YYYY-MM`ごとの件数を数える。新しい月が先頭 | `aggregateArchives(articles)` |

- 旧案にあった「フィルタタブ生成（`buildCategoryTabs`）」は、一覧上部のカテゴリタブの廃止に伴い不要になった

### 記事詳細

`features/blog-detail/lib/`にまとめている。

| ルール | 内容 | 関数 |
|---|---|---|
| シェアURL | 記事URLとタイトルから、X・Facebook・はてなブックマークの共有画面URLを`URLSearchParams`で組み立てる | `buildShareLinks(articleUrl, title)`（`share-links.ts`） |
| 記事のMetadata | title・description・canonical・openGraph・twitterを組み立てる | `buildArticleMetadata(blog)`（`article-metadata.ts`） |
| サイトマップの項目 | 固定ページと全記事のURL・`lastModified`（`revisedAt`があればそれ、無ければ`publishedAt`。トップは最新の値）を作る。絶対URLを作る関数は引数で受け取る | `buildSitemapEntries(articles, toAbsoluteUrl)`（`sitemap-entries.ts`） |

## 置き場所

参考リポジトリの`features/`がドメイン単位の司令塔になる考え方に合わせる。

| 種類 | 置き場所 | 備考 |
|---|---|---|
| Article / Category / Author の型 | `external/microcms/types.ts`（`Blog` / `Category` / `Profile`など） | 変換層を持たないため、microCMSのレスポンス型をそのまま使う。`shared/lib/types.ts`には旧実装の`Article`型が残っているが、どこからも使われていない |
| 一覧の絞り込み・ページネーション・見出し | `features/blog-list/lib/` | |
| サイドバーの集計 | `features/sidebar/lib/` | |
| 記事詳細のシェア・メタデータ・サイトマップ | `features/blog-detail/lib/` | サイトマップは記事のデータから作るため記事詳細に置いた |
| 複数featureで使う表示ルール（日付・配色・並び替え） | `shared/lib/` | 複数featureで使うと分かった時点で`shared/lib/`へ昇格する |
| 定数（新着の日数、キャッチコピー、サイト名、フッターのリンクなど） | `shared/lib/constants.ts` | ページサイズの選択肢（`PAGE_SIZE_OPTIONS`・`DEFAULT_PAGE_SIZE`）は一覧専用なので`features/blog-list/lib/filter-articles.ts`に置いている |

## テスト方針

- 対象: 上記の純粋関数と、microCMS呼び出し層（呼び出し内容・404の判定・Webhookの署名検証）。テストは`frontend/tests/`に、`src/`と同じ階層で置く
- 対象外: コンポーネントの見た目・レイアウト・スタイル
- 境界値の例: 新着の7日ちょうど・未来の日時、UTCとJSTの日付またぎ（`2026-09-13T16:00:00Z`はJSTで`09-14`）、カテゴリなしの記事、検索語が空・大文字小文字の違い、総件数が`pageSize`でちょうど割り切れる場合と余りが出る場合（例: 30件を10件ずつなら3ページちょうど、31件なら4ページ目は1件のみ）、総ページ数を超える`page`を渡した場合のクランプ、不正な`page`・`pageSize`
