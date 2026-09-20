# API設計書（MVP）

## 概要

本アプリは読み取り専用で、**独自のHTTP APIを公開しない**。Server Componentから`external/microcms/`の関数を直接呼び、microCMSのREST APIへ接続する（[04_data_fetching_policy.md](../../frontend/docs/04_data_fetching_policy.md)）。

参考リポジトリのような`/api/xxx`のQuery/Command構成は採用しない。理由は次のとおり。

- ブラウザ→自サーバーAPI→microCMSという二重の中継が不要になる
- 書き込み（Command）が存在しない
- 現行の`app/api/blogs/*`は廃止予定（[03_directory_structure.md](../../frontend/docs/03_directory_structure.md)）

そこで本書では、次の2つを「API」として定義する。

1. **アプリ内部のデータ取得インターフェース**（`external/microcms/`が提供する関数）
2. **外部API（microCMS）の利用仕様**（エンドポイント・パラメータ・環境変数）

## 1. 内部インターフェース（`external/microcms/blogs.ts`）

すべてQuery（副作用なし）。戻り値はアプリ内の型（[05_domain_design.md](./05_domain_design.md)）。

| 関数 | 用途 | 引数 | 戻り値 |
|---|---|---|---|
| `getBlogList()` | 全記事の取得（トップ・一覧・サイドバー集計） | なし（将来: `limit` `offset`） | `Article[]`（公開日降順） |
| `getBlogDetail(id)` | 記事1件の取得 | `id: string` | `Article`。存在しなければ`notFound`を呼び出し側で扱う |

### 取得方針

| 項目 | 方針 |
|---|---|
| 取得タイミング | Server Component内（ビルド時／リクエスト時）。クライアントから直接microCMSを呼ばない |
| 全件取得 | microCMSの`limit`上限は100件。**現状の記事数（6件程度）では全件を1回で取得**する。100件を超えたら`offset`で繰り返し取得、またはサーバー側フィルタ（案B）へ移行する |
| 集計 | TOPICS・ARCHIVE・件数は取得済みの記事群から計算する（追加のAPI呼び出しをしない） |
| 取得フィールド | 一覧では**本文（`content`）を除外**して軽量化する（`fields`パラメータ）。詳細のみ本文を取得する |
| キャッシュ | 更新頻度は低い前提。`cacheLife("hours")`程度（有効化は任意。判断は実装者） |

## 2. microCMS API 利用仕様

### エンドポイント

| 用途 | メソッド | URL | 備考 |
|---|---|---|---|
| 記事一覧 | GET | `https://{serviceDomain}.microcms.io/api/v1/blogs` | リスト形式のAPI |
| 記事詳細 | GET | `https://{serviceDomain}.microcms.io/api/v1/blogs/{contentId}` | |
| カテゴリ一覧（任意） | GET | `.../api/v1/categories` | `categories`を独立コンテンツにした場合のみ |
| プロフィール（任意） | GET | `.../api/v1/profile` | オブジェクト形式。定数管理なら不要 |

実際の呼び出しは`microcms-js-sdk`（`getList` / `getListDetail`）を使う。

### 記事一覧のクエリパラメータ

| パラメータ | 値の例 | 用途 |
|---|---|---|
| `orders` | `-publishedAt` | 公開日の降順 |
| `limit` | `100` | 取得件数（既定10、最大100） |
| `offset` | `0` | 取得開始位置（100件超で使用） |
| `fields` | `id,title,excerpt,categories,cardLabel,cardCaption,cardTheme,readingMinutes,publishedAt` | 一覧では本文を除外 |
| `depth` | `1` | カテゴリを参照コンテンツにした場合、参照先の中身まで展開する |
| `filters` | `title[contains]hooks` | サーバー側検索（案Bに移行する場合のみ） |

### 記事詳細のクエリパラメータ

| パラメータ | 値の例 | 用途 |
|---|---|---|
| `depth` | `1` | カテゴリ参照の展開 |
| `draftKey` | （プレビュー時のみ） | 下書きプレビュー。MVPでは対象外 |

### レスポンス（microCMS → 外部型）

一覧: `{ contents: Blog[], totalCount, offset, limit }`。フィールドの定義は[06_content_model.md](./06_content_model.md)を参照。

`external/microcms/`は、このレスポンスをアプリ内の`Article`へ変換して返す。

| microCMSのフィールド | Article | 変換 |
|---|---|---|
| `id` | `id` | そのまま |
| `title` / `excerpt` | `title` / `excerpt` | そのまま。`excerpt`未設定なら本文先頭から生成する案もある（要判断） |
| `content` | `body` | そのまま（HTML） |
| `categories[]` | `categories[]` | `{ id, name, slug }`に整形。未設定は空配列 |
| `cardLabel` / `cardCaption` / `cardTheme` | `card` | 3点をまとめ、未設定時は既定値（`label`=先頭カテゴリ名、`theme`=カテゴリに応じた固定マッピングまたは`blue`） |
| `readingMinutes` | `readingMinutes` | 未設定なら`calcReadingMinutes(content)` |
| `publishedAt` | `publishedAt` | そのまま（ISO 8601） |
| `eyecatch` | `eyecatch` | 任意 |

### 認証・環境変数

| 変数 | 内容 | 公開範囲 |
|---|---|---|
| `MICROCMS_SERVICE_DOMAIN` | microCMSのサービスドメイン | サーバー専用 |
| `MICROCMS_API_KEY` | 読み取り用APIキー（GET権限のみ） | サーバー専用。`NEXT_PUBLIC_`を付けない |

- 未設定の場合、現状のクライアント生成は空文字で続行してしまう。起動時に検知して失敗させる（実装時の改善候補）
- APIキーはコミットしない（`.env`はGit管理外）

## 3. エラーハンドリング

| 状況 | 発生源 | 扱い |
|---|---|---|
| 記事が存在しない（404） | `getBlogDetail` | 呼び出し側（`/blogs/[id]/page.tsx`）で`notFound()`を呼び、404ページを出す |
| 認証エラー（401/403）・ネットワーク障害 | microCMS | 例外をそのまま投げる。`error.tsx`で表示。ビルド時は失敗として検知 |
| レート制限（429） | microCMS | 例外として扱う。キャッシュにより通常は発生しにくい |
| 想定外のフィールド欠落 | microCMS | 変換層で既定値に落とし、画面を壊さない |

## 4. セキュリティ

- 本文HTMLは`dangerouslySetInnerHTML`で描画するため、**サニタイズ**を通す（許可タグを絞る）。入稿者は本人だが、防御を一段入れておく
- APIキーをクライアントバンドルに含めない（`external/`はサーバー専用。`server-only`パッケージでの保護を検討）
- 外部リンク（プロフィール）は`rel="noopener noreferrer"`

## 5. 再検証（キャッシュ更新）

記事更新をサイトへ反映する方法の選択肢（実装時に判断）。

| 方式 | 内容 |
|---|---|
| 時間経過で更新 | `cacheLife`／ISRで一定時間ごとに再取得。追加実装なし |
| オンデマンド更新 | microCMSのWebhook → `POST /api/revalidate`（Route Handler、秘密トークンで保護）→ `revalidateTag("blogs")`。**これが本アプリで唯一の書き込み系に近いAPI** |

オンデマンド更新を採用する場合の仕様は次のとおり。

| 項目 | 内容 |
|---|---|
| URL | `POST /api/revalidate` |
| 認証 | 共有シークレット（ヘッダーまたはクエリ）。不一致は401 |
| 成功 | `200 { "revalidated": true }` |
| 失敗 | `401`（認証失敗）／`400`（不正なペイロード） |

## 6. 廃止するAPI（参考）

| 既存 | 扱い |
|---|---|
| `GET /api/blogs` | 廃止（Server Componentから直接取得） |
| `GET /api/blogs/[id]` | 廃止（同上） |
| `GET /api/qiita` | 廃止（Qiita連携はスコープ外） |
