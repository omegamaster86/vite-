# テストガイド

このディレクトリには、以下のテストが含まれています：

- **E2Eテスト（Playwright）** - ブラウザベースのエンドツーエンドテスト
- **Edge Functionsテスト（Deno）** - Supabase Edge Functionsの統合テスト

## 📁 ディレクトリ構造

```
tests/
├── e2e/                                        # E2Eテスト（Playwright）
│   ├── playwright.config.ts                   # Playwright設定ファイル
│   ├── global-setup.ts                        # グローバルセットアップ
│   ├── .env.test                              # 環境変数設定ファイル
│   ├── .env.test.example                      # 環境変数設定ファイルのサンプル
│   ├── shared/                                 # 共通ユーティリティ
│   │   ├── freezeTime.ts                      # 時刻固定ユーティリティ
│   │   ├── test-helpers.ts                    # テスト用ヘルパー関数
│   │   ├── todo-helpers.ts                    # ToDoテスト用ヘルパー関数
│   │   └── user-helpers.ts                     # ユーザー管理ヘルパー関数
│   └── [機能名]/                               # 各機能のテスト
│       └── [機能名].spec.ts                    # テストファイル（例: todos/todos.spec.ts）
└── functions/                                  # Edge Functionsテスト（Deno）
    ├── deno.json                               # Deno設定ファイル
    ├── run-test.sh                             # テスト実行スクリプト
    ├── shared/                                 # 共通ユーティリティ
    │   ├── test-helpers.ts                     # テスト用ヘルパー関数
    │   ├── data-loader.ts                      # テストデータローダー
    │   ├── deno-helpers.ts                     # Deno固有のヘルパー関数
    │   └── user-helpers.ts                     # ユーザー管理ヘルパー関数
    └── [function-name]/                        # 各関数のテスト
        └── [function-name].test.ts             # テストファイル（例: get-todos/get-todos.test.ts）
```

---

## 🎭 E2Eテスト（Playwright）

### 🎯 テストの概要

E2Eテストでは、各specファイルの実行時に自動的にテストユーザーを作成・削除します。

**テストユーザーの管理**:
- `beforeAll`: テストユーザーを作成
- `afterAll`: テストユーザーを削除
- テストユーザーの認証情報は環境変数での指定不要
- `tests/e2e/shared/user-helpers.ts`を使用してユーザーを管理

**使用例**:

```typescript
import { createE2ETestUser, cleanupE2ETestUser, type E2ETestUser } from "../shared/user-helpers";

test.describe("テストスイート", () => {
  let testUser: E2ETestUser;

  test.beforeAll(async () => {
    testUser = await createE2ETestUser("test@example.com", "password123", "user");
  });

  test.afterAll(async () => {
    await cleanupE2ETestUser(testUser);
  });

  test.beforeEach(async ({ page }) => {
    // テストユーザーでログイン
    await page.goto("/login");
    await page.fill("input[name='email']", testUser.email);
    await page.fill("input[name='password']", testUser.password);
    await page.click("button[type='submit']");
  });
  
  // テスト実装...
});
```

### テストファイルの命名規則

テストファイルは機能ごとにディレクトリに分類されています：

- `{機能名}/*.spec.ts` - 各機能のテスト（例: `todos/todos.spec.ts`）

各テストファイルは `*.spec.ts` という命名規則に従います。

### 主要なテストケース（例）

各機能のテストファイルには、以下のようなテストケースが含まれます：

- **一覧表示のテスト**
  - データが正しく表示される
  - データがない時に適切なメッセージが表示される
  - フィルタリングやソートが正しく動作する

- **CRUD操作のテスト**
  - 新規作成フォームが正しく表示される
  - データを作成して一覧に反映される
  - バリデーションエラーが正しく表示される
  - キャンセルボタンが正しく動作する

### 🚀 テストの実行方法

#### 📋 利用可能な npm スクリプト一覧

| コマンド | 説明 |
|---------|------|
| `npm run test:e2e` | すべてのE2Eテストを実行（ヘッドレスモード） |
| `npm run test:e2e:ui` | UIモードでテストを実行（最も推奨・デバッグに便利） |
| `npm run test:e2e:headed` | ブラウザを表示してテストを実行（動作確認用） |
| `npm run test:e2e:debug` | デバッグモードで実行（ステップ実行、ブレークポイント設定） |
| `npm run test:e2e:report` | テスト結果のHTMLレポートを表示 |

#### ローカル環境での実行

##### 1. 前提条件

以下がインストールされていることを確認してください：

```bash
# Node.js (LTS推奨)
node --version

# Supabase CLI
supabase --version

# Deno (Edge Functions用)
deno --version
```

##### 2. 環境変数の設定

`tests/e2e/.env.test` ファイルを作成して、Supabase接続情報を設定します：

```bash
# サンプルファイルをコピー
cp tests/e2e/.env.test.example tests/e2e/.env.test

# Supabaseの接続情報を取得
supabase status

# .env.test ファイルを編集して、接続情報を設定
# NEXT_PUBLIC_SUPABASE_ANON_KEY と SUPABASE_SERVICE_ROLE_KEY を
# supabase status で表示される値に置き換えてください
```

`.env.test` ファイルの内容：

```env
# E2Eテスト用環境変数
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# テスト用固定日時（オプション）
FIXED_DATE=2025-10-01T13:00:00Z
```

> **Note:** E2Eテストは実行時に自動的にテストユーザーを作成・削除するため、テストユーザーの事前作成は不要です。

> **重要**: `.env.test` ファイルは `.gitignore` に含まれているため、Gitで管理されません。各環境で個別に作成してください。

##### 3. Supabaseローカル環境の起動

```bash
# Supabaseローカル環境を起動（Studio、Mailpitを除外）
supabase start -x studio,mailpit

# DBをリセット（初期データ投入）
supabase db reset
```

##### 4. Playwrightブラウザのインストール

```bash
npx playwright install --with-deps
```

##### 5. テストの実行

**推奨: npm run コマンドを使用**

```bash
# すべてのE2Eテストを実行
npm run test:e2e

# UIモードでテストを実行（デバッグに便利）
npm run test:e2e:ui

# ヘッドレスモードを無効にして実行（ブラウザを見ながら実行）
npm run test:e2e:headed

# デバッグモードで実行（ステップ実行、ブレークポイント設定が可能）
npm run test:e2e:debug

# レポートを表示
npm run test:e2e:report
```

**または、npx コマンドで直接実行**

```bash
# すべてのE2Eテストを実行
npx playwright test --config=tests/e2e/playwright.config.ts tests/e2e

# 特定のテストファイルのみ実行（例：todosテスト）
npx playwright test --config=tests/e2e/playwright.config.ts tests/e2e/todos/todos.spec.ts

# UIモードでテストを実行
npx playwright test --config=tests/e2e/playwright.config.ts tests/e2e --ui

# ヘッドレスモードを無効にして実行
npx playwright test --config=tests/e2e/playwright.config.ts tests/e2e --headed

# デバッグモードで実行
npx playwright test --config=tests/e2e/playwright.config.ts tests/e2e --debug

# レポートを表示
npx playwright show-report
```

### 🤖 CI/CD環境での実行（GitHub Actions）

#### ワークフローの概要

`.github/workflows/admin-web-playwright-tests.yml`でPlaywrightテストが実行されます。

##### トリガー条件

- `workflow_dispatch`（手動実行）

##### 実行ステップ

1. **Node.js、Deno、Supabase CLIのセットアップ**
2. **Supabaseローカル環境の起動**
   - Studio、Mailpitを除外して起動（`-x studio,mailpit`）
   - ヘルスチェックで起動完了を待機
   - Edge Runtimeの起動を待機（15秒）
   - `supabase db reset`でDB初期化
   - 環境変数をGitHub Actions環境に設定
3. **依存関係のインストール**
   - `npm ci`で依存パッケージをインストール
4. **Playwrightブラウザのインストール**
   - `npx playwright install --with-deps`
5. **テストの実行**
   - テスト結果を`playwright-results.txt`に出力
   - HTMLレポートを生成
6. **テスト結果サマリーの生成**
   - GitHub Step Summaryに以下を表示：
     - テスト実行情報（リポジトリ、コミット、ブランチ）
     - テスト結果のステータス（成功/失敗）
     - テスト統計（合計、成功、失敗、スキップ）
     - 失敗したテストの詳細
7. **Playwrightレポートのアップロード**
   - アーティファクトとして保存（30日間保持）

##### 環境変数

以下の環境変数が自動設定されます：

| 環境変数                                       | 説明                       | 値                        |
| ---------------------------------------------- | -------------------------- | ------------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`                     | Supabase API URL           | `supabase status`から取得 |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase匿名キー           | `supabase status`から取得 |
| `FIXED_DATE`                                   | 固定日時（テストの再現性） | `2025-10-01T13:00:00Z`    |

### ⚙️ Playwright設定

#### 主要な設定項目

```typescript
{
  testDir: ".",
  testMatch: /.*\.spec\.ts/,
  testIgnore: ["**/supabase/functions/**"],
  fullyParallel: false,  // 順次実行（DB競合を防ぐ）
  workers: 1,            // ワーカー数を1に制限
  retries: process.env.CI ? 2 : 0,  // CI環境では2回リトライ
  use: {
    baseURL: "http://localhost:3000",
    headless: true,
    screenshot: "only-on-failure",  // 失敗時のみスクリーンショット
    trace: "on-first-retry",        // リトライ時にトレースを記録
  },
}
```

#### テスト実行の特徴

- **順次実行**: DB競合を防ぐため、テストは1つずつ順番に実行されます
- **DBリセット**: 全テスト実行前に`global-setup.ts`が実行され、データベースがリセットされます
- **時刻固定**: `FIXED_DATE`環境変数により、テストの再現性を確保
- **開発サーバー自動起動**: テスト実行前に`npm run dev`が自動実行されます

### 🔧 テストユーティリティ

#### 時刻固定機能 (`shared/freezeTime.ts`)

テストの再現性を確保するため、ブラウザの時刻を固定します：

```typescript
import { freezeTime } from "../shared/freezeTime";

test.beforeEach(async ({ context }) => {
  await freezeTime(context, process.env.FIXED_DATE ?? "2025-10-01T13:00:00Z");
});
```

### 📊 テストレポート

#### ローカル環境

テスト実行後、HTMLレポートが自動生成されます：

```bash
# レポートを表示
npx playwright show-report
```

#### CI環境（GitHub Actions）

- **GitHub Step Summary**: テスト結果の概要がPRやワークフロー実行ページに表示されます
- **Playwrightレポート**: アーティファクトとしてダウンロード可能（30日間保持）

### 🐛 デバッグ

#### デバッグモードでテストを実行

**推奨: npm run コマンドを使用**

```bash
# UIモードでデバッグ（最も使いやすい）
npm run test:e2e:ui

# ヘッドレスモードを無効化（ブラウザの動作を確認）
npm run test:e2e:headed

# デバッガーを起動（ステップ実行、ブレークポイント設定）
npm run test:e2e:debug
```

**または、npx コマンドで直接実行**

```bash
# UIモードでデバッグ
npx playwright test --config=tests/e2e/playwright.config.ts tests/e2e --ui

# ヘッドレスモードを無効化
npx playwright test --config=tests/e2e/playwright.config.ts tests/e2e --headed

# デバッガーを起動
npx playwright test --config=tests/e2e/playwright.config.ts tests/e2e --debug
```

#### 特定のブラウザでテスト

```bash
# Chromiumのみ（npm runコマンド経由）
npm run test:e2e -- --project=chromium

# または、npx コマンドで直接実行
npx playwright test --config=tests/e2e/playwright.config.ts tests/e2e --project=chromium

# 複数ブラウザを有効化する場合は playwright.config.ts を編集
```

### 📝 テストの書き方

#### 基本的なテスト構造

```typescript
import { expect, test } from "@playwright/test";
import { freezeTime } from "../shared/freezeTime";

test.beforeEach(async ({ context }) => {
  await freezeTime(context, process.env.FIXED_DATE ?? "2025-10-01T13:00:00Z");
});

test("テストケース名", async ({ page }) => {
  // ページに移動
  await page.goto("/your-page");

  // 要素を操作
  await page.fill("input[name='email']", "test@example.com");
  await page.click("button[type='submit']");

  // アサーション
  await expect(page).toHaveURL("/expected-page");
});
```

#### ベストプラクティス

1. **時刻を固定する**: `beforeEach`で`freezeTime`を呼び出す
2. **適切な待機**: `waitForURL`、`waitForSelector`などを使用
3. **環境変数を活用**: 認証情報は環境変数から取得
4. **エラーメッセージを検証**: 多言語対応のため、複数のメッセージパターンをチェック
5. **ファイル名で実行順序を制御**: `00-`, `01-`, `02-`などのプレフィックスを使用

### 🔍 トラブルシューティング

#### よくある問題

##### 1. Supabaseに接続できない

```bash
# Supabaseが起動しているか確認
supabase status

# 起動していない場合
supabase start -x studio,mailpit
```

##### 2. テストがタイムアウトする

- `playwright.config.ts`の`timeout-minutes`を増やす
- ネットワークが遅い場合は、待機時間を調整

##### 3. DB関連のエラー

```bash
# DBをリセット
supabase db reset

# Supabaseを再起動
supabase stop
supabase start -x studio,mailpit
```

##### 4. 認証エラー

- `E2E_SIGNIN_EMAIL`と`E2E_SIGNIN_PASSWORD`が正しいか確認
- `supabase/seed.sql`にテストユーザーが存在するか確認

### 📚 参考リンク

- [Playwright公式ドキュメント](https://playwright.dev/)
- [Supabase CLI リファレンス](https://supabase.com/docs/reference/cli)
- [GitHub Actions - Playwright](https://playwright.dev/docs/ci-intro)

---

## 🔧 Edge Functionsテスト（Deno）

### 📄 概要

このセクションでは、Supabase Edge Functionsの統合テストについて説明します。テストはDenoを使用して、実際にデプロイされたEdge Functionに対してHTTPリクエストを送信します。

### 🚀 テストの実行

#### ローカル環境でSupabaseを使用してテストを実行（推奨）

Supabaseローカル環境が起動している状態で、環境変数を自動設定してテストを実行します。

##### 方法1: プロジェクトルートから実行（推奨）

プロジェクトルートから直接実行できます。npm スクリプトまたは直接スクリプトを実行してください。

```bash
# npm スクリプトで実行（推奨）
npm run test:functions

# または直接スクリプトを実行
bash tests/functions/run-test.sh

# 特定のテストファイルだけを実行
bash tests/functions/run-test.sh get-todos/get-todos.test.ts
```

##### 方法2: tests/functions ディレクトリに移動してから実行

```bash
# tests/functions ディレクトリへ移動
cd tests/functions

# 環境変数を自動設定してテストを実行
./run-test.sh

# 特定のテストファイルだけを実行
./run-test.sh get-todos/get-todos.test.ts
```

##### Windows (Git Bash) の場合


```bash
# npm スクリプトで実行（推奨）
npm run test:functions

# または直接スクリプトを実行
bash tests/functions/run-test.sh
```

**注意**: Windowsの場合は、必ずGit Bashまたは同等のBash互換シェルを使用してください。PowerShellやコマンドプロンプトでは動作しません。

#### 利用可能な npm スクリプト

```bash
# Edge Functionsテストを実行
npm run test:functions

# 特定のテストファイルを実行（例）
npm run test:functions get-todos/get-todos.test.ts
```

#### 環境変数を手動で設定してテストを実行

```bash
# Supabaseローカル環境から環境変数を取得
eval $(supabase status -o env | sed 's/"//g')
export SUPABASE_URL=$API_URL
export SUPABASE_ANON_KEY=$ANON_KEY
export SERVICE_ROLE_KEY=$SERVICE_ROLE_KEY

# テストを実行
cd tests/functions
deno task test
```

#### すべてのテストを実行

```bash
cd tests/functions
deno task test
```

#### 手動でのテスト実行

```bash
cd tests/functions

# 特定のテストファイルを実行（ネットワークアクセス許可）
deno test --allow-net --allow-all get-todos/get-todos.test.ts

# すべてのテストファイルを実行
deno test --allow-net --allow-all **/*.test.ts
```

#### リント

```bash
cd tests/functions

# リントを実行
deno task lint
```

### 🤖 GitHub Actions

`workflow_dispatch`（手動実行）でテストが実行されます。

ワークフローファイル: `.github/workflows/admin-web-deno-tests.yml`

#### テスト結果の確認方法

##### 1. GitHub Actionsページへのアクセス

1. GitHubリポジトリのページを開く
2. 上部メニューの「Actions」タブをクリック
3. 左サイドバーの「Deno Tests」ワークフローを選択
4. 実行履歴から確認したいワークフローをクリック

##### 2. サマリーの確認

ワークフローのページを開くと、最初に表示されるのが**サマリー**です。以下の情報が含まれます：

**✅ Check Results（チェック結果一覧）**

- 🧪 Deno Tests - テスト実行結果
- 🔍 Linting - コードの静的解析結果
- 💅 Formatting - コードフォーマット確認結果
- 🔧 Type Checking - 型チェック結果

**📊 Test Details（テスト統計）**

- Total Tests: 実行されたテストの総数
- Passed: 成功したテストの数 ✅
- Failed: 失敗したテストの数 ❌

**📝 Test Cases（全テストケース一覧）**

- すべてのテストケースの実行結果が表示されます
- 各テストケースの名前、結果（ok/FAILED）、実行時間が確認できます

**❌ Failed Tests Details（失敗したテストの詳細）**

- テストが失敗した場合のみ表示されます
- 失敗した原因（エラーメッセージ、期待値と実際の値の差分など）が表示されます

##### 3. 詳細ログの確認

サマリーだけでは情報が不足している場合は、詳細ログを確認します：

1. ワークフローページで「test」ジョブをクリック
2. 左サイドバーから確認したいステップを選択
   - 「Run Deno tests」- テスト実行の詳細ログ
   - 「Print functions logs before tests」- テスト実行前のEdge Functionsログ
   - 「Print functions logs after tests (always)」- テスト実行後のEdge Functionsログ（エラー行のみも表示）

##### 4. Edge Functionsのログ確認

テストが失敗した場合、Edge Functions側のエラーを確認することが重要です：

**「Print functions logs after tests (always)」ステップで以下を確認：**

- `functions.log (full content)` - 全ログ
- `functions.log (last 1000 lines)` - 最新1000行
- `functions.log (error lines only)` - エラー、失敗、例外を含む行のみ

これらのログから、Edge Functionsが正しく起動できたか、リクエスト処理中にエラーが発生していないかを確認できます。

##### 5. トラブルシューティング

**テストが失敗した場合のチェックリスト：**

1. **サマリーの「Failed Tests Details」を確認**
   - どのテストが失敗したか
   - エラーメッセージの内容
   - 期待値と実際の値の差分

2. **Edge Functionsのログを確認**
   - 起動時のエラー
   - リクエスト処理中の例外
   - データベース接続エラー

3. **テスト実行ログを確認**
   - ネットワークエラー
   - タイムアウト
   - 環境変数の設定ミス

4. **ローカル環境で再現**
   - 同じテストをローカルで実行して再現するか確認
   - プロジェクトルートから `npm run test:functions` を使用
   - または `bash tests/functions/run-test.sh` で直接実行

**よくある失敗の原因：**

- シードデータ（`supabase/seed.sql`）の不整合
- Edge Functionsのコードエラー
- データベーススキーマの変更
- テストの期待値が古い

### 📋 統合テストについて

このテストは**統合テスト**として、実際にデプロイされたSupabase Edge Functionに対してHTTPリクエストを送信します。

#### 特徴

- **実際のエンドポイント**を使用したテスト
- **ネットワークアクセス**が必要（`--allow-net`フラグ）
- **リアルタイム**でのAPI動作確認
- **パフォーマンステスト**も含む

#### 注意事項

- テスト実行時はインターネット接続が必要
- エンドポイントが利用可能である必要がある
- テストデータの存在に依存する場合がある

### 📊 テストデータの管理

テストでは、CSV形式のテストデータファイルを使用してデータベースの状態を準備します。

#### ディレクトリ構成

```
tests/functions/
├── [function-name]/
│   └── data/
│       ├── base.csv          # 基本テストケース用データ
│       ├── pagination.csv    # ページネーション用データ
│       └── locale.csv        # 多言語対応用データ
└── shared/
    └── data-loader.ts        # テストデータローダー
```

#### テストデータファイルの形式

CSVファイルは、テーブルのカラム名をヘッダー行に持つ標準的なCSV形式です。

**例: get-todos/data/base.csv**

```csv
title,description,is_completed,user_id
タスク1,説明1,false,user-id-1
タスク2,説明2,true,user-id-1
```

**注意点：**

- 空文字列は自動的に`null`に変換されます
- ヘッダー行（1行目）はスキップされます
- 前後の空白は自動的に削除されます

### 📂 テストファイルの配置

すべてのEdge Functionのテストは、`tests/functions/` ディレクトリに配置してください。

```
tests/functions/
├── [function-name]/
│   ├── [function-name].test.ts    # 各関数のテスト
│   └── data/                      # テストデータ（CSV）
│       └── base.csv
├── shared/
│   ├── test-helpers.ts            # 共通ヘルパー関数
│   └── data-loader.ts             # テストデータローダー
├── deno.json                      # Deno設定
└── run-test.sh                    # テスト実行スクリプト
```
