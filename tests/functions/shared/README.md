# 共通テストヘルパー

このディレクトリには、Supabase FunctionsテストとE2Eテストの両方で使用できる共通のテストユーティリティが含まれています。

## ファイル構成

```
tests/
├── e2e/
│   └── shared/         # E2Eテスト用の共通ユーティリティ
│       ├── freezeTime.ts
│       ├── test-helpers.ts
│       ├── todo-helpers.ts
│       └── user-helpers.ts
└── functions/
    └── shared/         # Edge Functionsテスト用の共通ユーティリティ
        ├── data-loader.ts      # CSVデータの読み込みとSupabaseへの投入（Deno & Node.js）
        ├── test-helpers.ts     # テストデータ管理クラスとログ関数（Deno & Node.js）
        ├── deno-helpers.ts     # Supabase Functions固有のヘルパー（Denoのみ）
        ├── user-helpers.ts     # ユーザー管理ヘルパー関数
        └── README.md          # このファイル
```

## 主な機能

### 1. データローダー (`data-loader.ts`)

CSVファイルからテストデータを読み込み、Supabaseにロードするユーティリティ。
Deno（Supabase Functions）とNode.js（E2Eテスト）の両環境で動作します。

#### 関数

- `loadCsvFile(filePath: string)` - CSVファイルを読み込んでパース
- `insertTestData(tableName: string, data: Record<string, unknown>[])` - データを挿入
- `clearTable(tableName: string)` - テーブルをクリア
- `loadTestData(tableName: string, csvFilePath: string, truncate?: boolean)` - CSVからデータをロード
- `loadMultipleTestData(testDataList: Array<{...}>)` - 複数のテストデータを一括ロード

#### 使用例（直接使用）

```typescript
import { loadTestData, clearTable } from "@shared/data-loader.ts";

// データをロード（既存データをクリアしてから）
await loadTestData("t_todo", "./data/base.csv", true);

// テーブルをクリア
await clearTable("t_todo");
```

### 2. テストヘルパー (`test-helpers.ts`)

テストデータのセットアップ/クリーンアップを管理するクラスとログ関数。

#### TestDataクラス

テストデータのライフサイクルを管理します。

```typescript
import { TestData } from "@shared/test-helpers.ts";

const testData = new TestData(
  "t_todo",                      // テーブル名
  "./data/base.csv",             // CSVファイルパス（テストファイルからの相対パス）
  true                            // セットアップ時にクリアするか（デフォルト: true）
);

// セットアップ
await testData.setup();

try {
  // テスト実行
  // ...
} finally {
  // クリーンアップ
  await testData.cleanup();
}
```

#### ログ関数

テストの開始と終了を視覚的に区別するログを出力します。

```typescript
import { logTestStart, logTestEnd } from "@shared/test-helpers.ts";

logTestStart("ToDo一覧取得テスト");
// ================================================================================
// テスト開始: ToDo一覧取得テスト
// ================================================================================

// テスト実行...

logTestEnd("ToDo一覧取得テスト");
// ================================================================================
// テスト終了: ToDo一覧取得テスト
// ================================================================================
```

## 使用方法

### Supabase Functionsテストでの使用

共通ヘルパーとDeno固有ヘルパーの両方をインポートします：

```typescript
// tests/functions/get-todos/get-todos.test.ts
import {
  assertErrorResponse,
  assertResponseTime,
  logNon200Response,
  makeRequest,
} from "@shared/deno-helpers.ts";
import { logTestStart, logTestEnd } from "@shared/test-helpers.ts";
import { createTestUser, cleanupTestUser } from "@shared/user-helpers.ts";
import { assertEquals } from "@std/assert";

Deno.test("ToDo一覧取得テスト", async () => {
  logTestStart("ToDo一覧取得テスト");

  const testUser = await createTestUser("test@example.com", "TestPassword123!");
  try {
    const response = await makeRequest("get-todos", "GET", {}, testUser.accessToken);
    await logNon200Response(response);
    assertEquals(response.status, 200);
    // テスト実行...
  } finally {
    await cleanupTestUser(testUser);
  }

  logTestEnd("ToDo一覧取得テスト");
});
```

### E2Eテストでの使用

共通ヘルパーをインポートします（deno-helpers.tsは使用できません）：

```typescript
// tests/e2e/todos/todos.spec.ts
import { test } from "@playwright/test";
import path from "node:path";
import { loadTestData } from "../shared/data-loader.ts";
import { TestData, logTestStart, logTestEnd } from "../shared/test-helpers.ts";

test("ToDo一覧表示テスト", async ({ page }) => {
  // 方法1: 直接関数を使う
  const csvPath = path.join(__dirname, "data", "base.csv");
  await loadTestData("t_todo", csvPath, true);

  // 方法2: TestDataクラスを使う
  const testData = new TestData("t_todo", csvPath);
  await testData.setup();

  try {
    // テスト実行...
  } finally {
    await testData.cleanup();
  }
});
```

## 環境変数

以下の環境変数が必要です：

### Supabase Functions用
- `SUPABASE_URL` - SupabaseのURL
- `SUPABASE_ANON_KEY` - 匿名キー
- `SERVICE_ROLE_KEY` - サービスロールキー

### E2Eテスト用
- `NEXT_PUBLIC_SUPABASE_URL` - SupabaseのURL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - 匿名キー
- `SUPABASE_SERVICE_ROLE_KEY` - サービスロールキー

## 技術的な詳細

### クロスプラットフォーム対応

`data-loader.ts` と `test-helpers.ts` は、実行環境（Deno または Node.js）を自動的に判定し、適切なAPIを使用します：

- **ファイル読み込み**: `Deno.readTextFile` / `fs.readFileSync`
- **CSV パース**: Deno標準ライブラリ / `csv-parse`
- **環境変数**: `Deno.env.get` / `process.env`

### Deno専用モジュール

`deno-helpers.ts` はDeno環境でのみ使用可能で、以下の機能を提供します：

- Edge Functionへのリクエスト送信（`makeRequest`, `makeRequestWithTiming`, `makeRawRequest`）
- レスポンスの検証（`assertSuccessResponse`, `assertCorsHeaders`, `assertErrorResponse`）
- エラーハンドリング（`logNon200Response`）
- パフォーマンス検証（`assertResponseTime`）

### ファイル構成の違い

E2EテストとFunctionsテストでは、それぞれ独立した`shared`ディレクトリを持っています：

- `tests/e2e/shared/` - E2Eテスト用の共通ユーティリティ
  - `freezeTime.ts` - 時刻固定ユーティリティ（E2E専用）
  - `test-helpers.ts` - テスト用ヘルパー関数
  - `todo-helpers.ts` - ToDoテスト用ヘルパー関数
  - `user-helpers.ts` - ユーザー管理ヘルパー関数（E2E専用）

- `tests/functions/shared/` - Edge Functionsテスト用の共通ユーティリティ
  - `data-loader.ts` - テストデータローダー
  - `test-helpers.ts` - テスト用ヘルパー関数
  - `deno-helpers.ts` - Deno固有のヘルパー関数
  - `user-helpers.ts` - ユーザー管理ヘルパー関数（Deno専用）

## メリット

1. **コードの重複削減**: 同じロジックを2箇所で管理する必要がなくなります
2. **保守性の向上**: 変更は1箇所だけで済みます
3. **一貫性**: SupabaseテストとE2Eテストで同じデータ管理方法を使用できます
4. **明確な責任分離**: 共通機能とDeno固有機能が明確に分離されています

## 移行ガイド

### インポートパス

#### Supabase Functionsテストでのインポート

`deno.json`でエイリアスが設定されているため、`@shared/`を使用してインポートします：

```typescript
// Deno固有のヘルパー
import { makeRequest } from "@shared/deno-helpers.ts";

// 共通ヘルパー
import { TestData, logTestStart, logTestEnd } from "@shared/test-helpers.ts";
import { loadTestData } from "@shared/data-loader.ts";
import { createTestUser, cleanupTestUser } from "@shared/user-helpers.ts";
```

#### E2Eテストでのインポート

E2Eテストでは、相対パスを使用してインポートします：

```typescript
// 共通ヘルパー
import { TestData, logTestStart, logTestEnd } from "../shared/test-helpers.ts";
import { loadTestData } from "../shared/data-loader.ts";

// E2E専用ヘルパー
import { freezeTime } from "../shared/freezeTime.ts";
import { createE2ETestUser, cleanupE2ETestUser } from "../shared/user-helpers.ts";
```
