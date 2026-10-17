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
| `getBlogDetail(id)` | 記事1件の取得 | `id: string` | `Article \| null`。microCMSが404を返したときだけ`null`を返し、それ以外のエラーはそのまま投げる。`null`のとき呼び出し側（記事詳細）で`notFound()`を呼ぶ |
| `getProfile()` | 著者情報の取得（`/profile`と全ページのサイドバー著者カード） | なし | `Author`（`profile`はオブジェクト形式のため`getObject`で取得） |
| `getAbout()` | このブログについての本文取得（`/about`） | なし | `About`（`about`はオブジェクト形式のため`getObject`で取得） |
| `getPrivacyPolicy()` / `getDisclaimer()` | 規約系ページの本文取得（`/privacy-policy`・`/disclaimer`。それぞれ別ファイル） | なし | `LegalPage`（オブジェクト形式のため`getObject`で取得） |

### 取得方針

| 項目 | 方針 |
|---|---|
| 取得タイミング | Server Component内（ビルド時／リクエスト時）。クライアントから直接microCMSを呼ばない |
| 全件取得 | microCMSの`limit`上限は100件。**現状の記事数（6件程度）では全件を1回で取得**する。100件を超えたら`offset`で繰り返し取得、またはサーバー側フィルタ（案B）へ移行する |
| ページネーション（表示件数・ページ番号） | MVPではこの全件取得結果に対して**アプリ側（案A）**で絞り込み・ページ分割を計算する（[05_domain_design.md](./05_domain_design.md)の`paginate`）。1回のAPI呼び出しで取得できる上限（100件）を超える規模になったら、`limit`/`offset`と`filters`をmicroCMSへ直接渡す案Bへ移行し、`getBlogList()`の引数を`{ page, pageSize, category, q, month }`相当に拡張する |
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
| プロフィール | GET | `.../api/v1/profile` | オブジェクト形式（1件のみ）。`/profile`と著者カードで使用 |
| このブログについて | GET | `.../api/v1/about` | オブジェクト形式（1件のみ）。`/about`の本文取得に使用 |

実際の呼び出しは`microcms-js-sdk`（`getList` / `getListDetail`）を使う。

### 記事一覧のクエリパラメータ

| パラメータ | 値の例 | 用途 |
|---|---|---|
| `orders` | `-publishedAt` | 公開日の降順 |
| `limit` | `100` | 取得件数（既定10、最大100） |
| `offset` | `0` | 取得開始位置（100件超で使用） |
| `fields` | `id,title,excerpt,categories,publishedAt` | 一覧では本文を除外 |
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
| `title` / `excerpt` | `title` / `excerpt` | そのまま。`excerpt`は画面に表示せず、記事詳細のdescription・OGPにのみ使う。未設定のときはルートの既定のdescription（キャッチコピー）になる。本文先頭から生成する案は採用しない |
| `content` | `body` | そのまま（HTML） |
| `categories[]` | `categories[]` | 文字列（カテゴリ名）の配列のまま。未設定の記事はキー自体が無いので空配列にする |
| （microCMSに無し） | `card` | `label`=先頭カテゴリ名、`theme`=先頭カテゴリからの固定マッピング（該当なしは`blue`）で導出 |
| `publishedAt` | `publishedAt` | そのまま（ISO 8601） |
| `eyecatch` | `eyecatch` | 任意 |

### 認証・環境変数

| 変数 | 内容 | 公開範囲 |
|---|---|---|
| `MICROCMS_SERVICE_DOMAIN` | microCMSのサービスドメイン | サーバー専用 |
| `MICROCMS_API_KEY` | 読み取り用APIキー（GET権限のみ） | サーバー専用。`NEXT_PUBLIC_`を付けない |
| `MICROCMS_WEBHOOK_SECRET` | microCMSのWebhookに設定するシークレット値。再検証APIへのリクエストが本物のmicroCMSから来たかを署名で確かめる | サーバー専用。Vercelでは本番環境にだけ設定する |
| `SITE_URL` | サイトのオリジン（例: 本番は`https://<本番ドメイン>`、ローカルは`http://localhost:3000`。末尾の`/`は付けない）。ドメイン取得前は`https://tech-blog-v2-lemon.vercel.app`を使い、取得後に値だけ差し替える。シェアボタンの記事URLとOGPの`metadataBase`に使う | サーバー専用。シェアボタンはServer Componentで組み立てるため`NEXT_PUBLIC_`は不要。Vercelでは本番環境の値に本番ドメインを設定する |

- 必須の環境変数は`shared/lib/env.ts`の`getRequiredEnv(name)`で読み、未設定なら`環境変数 ◯◯ が設定されていません`というエラーにする。`external/microcms/client.ts`の`MICROCMS_SERVICE_DOMAIN`・`MICROCMS_API_KEY`と、`shared/lib/site-url.ts`の`SITE_URL`で共用する
- 訂正: 以前は「未設定だと空文字で続行してしまう」と書いていたが、microCMS SDKの`createClient`は空文字を受け取ると`parameter is required (check serviceDomain and apiKey)`を投げるため、実際には失敗していた。ただし、どちらの変数が足りないのかが分からないメッセージなので、`getRequiredEnv`で変数名が分かるエラーにそろえる
- APIキーはコミットしない（`.env`はGit管理外）

## 3. エラーハンドリング

| 状況 | 発生源 | 扱い |
|---|---|---|
| 記事が存在しない（404） | `getBlogDetail` | SDKの例外を`isMicroCMSRequestError`で判定し、`status === 404`のときだけ`null`を返す。記事詳細（`generateMetadata`とページ本体）で`null`なら`notFound()`を呼び、`app/not-found.tsx`を出す |
| 認証エラー（401/403）・ネットワーク障害 | microCMS | 例外をそのまま投げる（404扱いにしない）。`error.tsx`で表示。ビルド時は失敗として検知 |
| レート制限（429） | microCMS | 例外として扱う。キャッシュにより通常は発生しにくい |
| 想定外のフィールド欠落 | microCMS | 変換層で既定値に落とし、画面を壊さない |

- 404の判定は`external/`層に閉じ込める。`isMicroCMSRequestError`はmicroCMS SDKの関数のため、`features/`や`app/`から使うとSDKへの依存が外に漏れる（[frontend/02_architecture.md](../../frontend/docs/02_architecture.md)の「外部層の差し替え可能性」）。`features/blog-detail/lib/get-article.ts`は`getBlogDetail`を`cache`で包むだけにし、エラーを握りつぶす`.catch(() => null)`は外す
- この判定は条件分岐を含むロジックなので、`tests/external/microcms/blogs.test.ts`に「404のとき`null`を返す」「500のときは例外を投げる」のテストを追加する

## 4. セキュリティ

- 本文HTMLは`dangerouslySetInnerHTML`で描画するため、**サニタイズ**を通す（許可タグを絞る）。入稿者は本人だが、防御を一段入れておく（詳細は下記4.1）
- APIキーをクライアントバンドルに含めない。`external/microcms/client.ts`・`shared/lib/env.ts`・`shared/lib/site-url.ts`の先頭で`import "server-only"`し、Client Componentから（間接的にでも）読み込まれたらビルドエラーにする。`external/microcms/`の各ファイルはすべて`client.ts`を読み込むため、`client.ts`に書けば外部層全体が守られる
- `server-only`はテスト環境（Vitest）では読み込むとエラーになるため、`server-only`を読み込むファイルを直接テストする場合は、テスト側で`vi.mock("server-only", () => ({}))`を書く（既存の`blogs.test.ts`は`client.ts`ごとモックしているので影響しない）
- 外部リンク（SNS）は`rel="noopener noreferrer"`、新規タブで開く

### 4.1 リッチテキストのサニタイズ

**実施する理由**

- 入稿者は本人だけだが、microCMSのアカウントやAPIキーが漏れた場合、本文に`<script>`や`onerror`属性を仕込まれると、閲覧者のブラウザでスクリプトが実行される（XSS）。サニタイズはその被害を防ぐ最後の防御になる
- 処理はServer Componentの中だけで行うため、閲覧者が読み込むJavaScriptは増えない。費用対効果が高い
- ポートフォリオとして「外部由来のHTMLを無条件に信用しない」設計を示せる

**実装方針**

| 項目 | 方針 |
|---|---|
| ライブラリ | `sanitize-html`（型は`@types/sanitize-html`）。DOMを必要とせずNode.jsで動くため、Server Componentで使える。`DOMPurify`はブラウザのDOMが前提で、サーバーで使うには`jsdom`が必要になり重いため採用しない |
| 置き場所 | `shared/lib/sanitize-html.ts`に`sanitizeRichText(html)`として置き、`shared/components/RichText.tsx`の中で呼ぶ。本文を描画する全ページ（記事詳細・about・プロフィール・規約系）に自動で効く |
| 許可するタグ | microCMSのリッチエディタが出力するもの: `h1`〜`h5`・`p`・`br`・`hr`・`strong`・`em`・`u`・`s`・`code`・`pre`・`blockquote`・`ul`・`ol`・`li`・`a`・`img`・`figure`・`figcaption`・`table`・`thead`・`tbody`・`tr`・`th`・`td`・`span`・`div` |
| 許可する属性 | `a`: `href`・`target`・`rel` ／ `img`: `src`・`alt`・`width`・`height` ／ 見出し: `id`（目次のアンカー用） ／ 全タグ: `class`（コードブロックの言語指定など） |
| URLのスキーム | `http`・`https`・`mailto`のみ。`javascript:`は除去される |
| 外部リンク | `a`に`target="_blank"`が付いている場合は`rel="noopener noreferrer"`を付与する（`transformTags`） |
| 埋め込み（`iframe`） | 現時点では許可しない。YouTube等を埋め込むことになったら、`allowedIframeHostnames`で許可するドメインを限定して追加する |

- 許可リストに無いタグは、タグだけ除去して中の文字は残る（`sanitize-html`の既定動作）。表示が崩れた場合は、まず許可リストの漏れを疑う
- 許可リストの設定はロジックなので、`tests/shared/lib/sanitize-html.test.ts`で「`<script>`が除去される」「`onerror`属性が除去される」「`javascript:`のリンクが除去される」「見出し・コードブロックは残る」を確認する

## 5. 再検証（キャッシュ更新）

**時間経過での更新**と**オンデマンド更新**の両方を採用する。普段は1時間キャッシュし、記事を公開・更新したらmicroCMSのWebhookですぐに反映する。Webhookが失敗しても、最長1時間後には反映される。

**キャッシュの付け方**

- Cache Components（`cacheComponents: true`）は有効にしない。有効にすると`searchParams`を使うトップページなどでSuspenseの配置の見直しが必要になり、変更範囲が大きいため（[frontend/04_data_fetching_policy.md](../../frontend/docs/04_data_fetching_policy.md)の「キャッシュ戦略」参照）
- 代わりに、microCMS SDKの`customRequestInit`でfetchに`next: { revalidate: 3600, tags: [エンドポイント名] }`を渡す。SDKは内部で`fetch`を使うため、Next.jsのデータキャッシュがそのまま効く
- タグはエンドポイント名と同じにする（`blogs`・`profile`・`about`・`privacy-policy`・`disclaimer`）。Webhookのペイロードの`api`にエンドポイント名が入るので、受け取った値をそのまま`revalidateTag`に渡せる
- エンドポイント名の一覧（`MICROCMS_ENDPOINTS`）と、有効期間とタグを付ける`buildCacheOptions(endpoint)`は`external/microcms/endpoints.ts`に1か所でまとめ、各取得関数とWebhookの判定から使う。`client.ts`に置かないのは、`client.ts`が読み込み時に環境変数を読むため、Webhookの判定のテストで`client.ts`ごと読み込まれるのを避けるため

**オンデマンド更新のAPI**

| 項目 | 内容 |
|---|---|
| URL | `POST /api/revalidate`（`app/api/revalidate/route.ts`） |
| 呼び出し元 | microCMSの各APIの「Webhook」→「カスタム通知」。公開・更新・削除のタイミングで送られる |
| 認証 | microCMSがリクエスト本文を`MICROCMS_WEBHOOK_SECRET`でHMAC-SHA256署名し、`X-MICROCMS-Signature`ヘッダーに入れて送る。受け取った本文から同じ方法で署名を作り、`crypto.timingSafeEqual`で比較する。一致しなければ`401` |
| 処理 | ペイロードの`api`が許可したエンドポイント名なら`revalidateTag(api, "max")`を呼ぶ。Next.js 16では第2引数が必須で、`"max"`は「次のアクセスでは古い内容を返しつつ裏で取り直す」動き |
| 成功 | `200 { "revalidated": true, "tag": "blogs" }` |
| 失敗 | `401`（署名なし・不一致）／`400`（本文がJSONでない、`api`が許可リストにない） |

- 署名の検証と`api`の判定は条件分岐を含むロジックなので、Route Handlerから切り出して`external/microcms/webhook.ts`（`verifyWebhookSignature`・`resolveRevalidateTag`）に置き、テストを書く。署名の方式もペイロードの形もmicroCMS固有なので、外部層に置く
- 署名ヘッダー名とペイロードの形式は、設定時にmicroCMSの管理画面とドキュメントで確認する
- **これが本アプリで唯一の書き込み系に近いAPI**。記事の内容は受け取らず、キャッシュを捨てる合図としてだけ使う

## 6. 廃止するAPI（参考）

| 既存 | 扱い |
|---|---|
| `GET /api/blogs` | 廃止（Server Componentから直接取得） |
| `GET /api/blogs/[id]` | 廃止（同上） |
| `GET /api/qiita` | 廃止（Qiita連携はスコープ外） |
