// Deno/Supabase Functions固有のヘルパーをインポート
import {
  assertErrorResponse,
  assertResponseTime,
  buildEndpointUrl,
  logNon200Response,
  makeRequest,
} from "@shared/deno-helpers.ts";
// 共通テストヘルパーをインポート
import { logTestEnd, logTestStart } from "@shared/test-helpers.ts";
// ユーザー管理ヘルパーをインポート
import { cleanupTestUser, createTestUser } from "@shared/user-helpers.ts";
import { assert, assertEquals, assertExists } from "@std/assert";
// Supabaseクライアントのインポート
import type { SupabaseClient } from "@supabase/client";
// Database型定義をインポート
import type { Database } from "@supabase-shared/database.types.ts";

// 型定義: ins_todo の戻り値の型（拡張版）
type InsertedTodo =
  Database["public"]["Functions"]["ins_todo"]["Returns"][number];

// テスト対象の関数名
const FUNCTION_NAME = "create-todo";

// テスト用ユーザー情報
const TEST_USER = {
  email: "test-create-todo@example.com",
  password: "TestPassword123!",
};

/**
 * テストユーザーのToDo を削除
 */
async function cleanupTestTodos(
  mUserId: number,
  supabase: SupabaseClient,
): Promise<void> {
  await supabase.from("t_todo").delete().eq("user_id", mUserId);
}

Deno.test("create-todo - POST以外のリクエスト（405エラー）", async () => {
  logTestStart("POST以外のリクエスト（405エラー）");
  const response = await makeRequest(FUNCTION_NAME, "GET");
  await assertErrorResponse(response, 405, "Method not allowed");
  logTestEnd("POST以外のリクエスト（405エラー）");
});

Deno.test("create-todo - PUTリクエスト（未対応メソッド）", async () => {
  logTestStart("PUTリクエスト（未対応メソッド）");
  const response = await makeRequest(FUNCTION_NAME, "PUT");

  // PUTリクエストは未対応なので405エラーが期待される
  await assertErrorResponse(response, 405, "Method not allowed");
  logTestEnd("PUTリクエスト（未対応メソッド）");
});

Deno.test("create-todo - DELETEリクエスト（未対応メソッド）", async () => {
  logTestStart("DELETEリクエスト（未対応メソッド）");
  const response = await makeRequest(FUNCTION_NAME, "DELETE");

  // DELETEリクエストは未対応なので405エラーが期待される
  await assertErrorResponse(response, 405, "Method not allowed");
  logTestEnd("DELETEリクエスト（未対応メソッド）");
});

Deno.test({
  name: "create-todo - 認証ヘッダーなし（401エラー）",
  sanitizeResources: false,
  sanitizeOps: false,
  async fn() {
    logTestStart("認証ヘッダーなし（401エラー）");
    const endpointUrl = buildEndpointUrl(FUNCTION_NAME);

    // Authorizationヘッダーなしでリクエスト
    const response = await fetch(endpointUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title: "テストToDo",
      }),
    });

    await logNon200Response(response.clone());

    // 認証ヘッダーがない場合は401エラー
    assertEquals(response.status, 401);

    const data = await response.json();
    // レスポンス構造を確認（success: false, error: "..." の形式）
    assert(
      data.success === false || data.msg !== undefined,
      "エラーレスポンスが存在するべき",
    );
    logTestEnd("認証ヘッダーなし（401エラー）");
  },
});

Deno.test({
  name: "create-todo - 無効なトークン（401エラー）",
  sanitizeResources: false,
  sanitizeOps: false,
  async fn() {
    logTestStart("無効なトークン（401エラー）");
    const endpointUrl = buildEndpointUrl(FUNCTION_NAME);

    // 無効なトークンでリクエスト
    const response = await fetch(endpointUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer invalid-token",
      },
      body: JSON.stringify({
        title: "テストToDo",
      }),
    });

    await logNon200Response(response.clone());

    // 無効なトークンの場合は401エラー
    assertEquals(response.status, 401);

    const data = await response.json();
    // レスポンス構造を確認（success: false, error: "..." の形式）
    assert(
      data.success === false || data.msg !== undefined,
      "エラーレスポンスが存在するべき",
    );
    logTestEnd("無効なトークン（401エラー）");
  },
});

Deno.test({
  name: "create-todo - titleなし（400エラー）",
  sanitizeResources: false,
  sanitizeOps: false,
  async fn() {
    logTestStart("titleなし（400エラー）");

    // テストユーザー作成
    const { authUserId, mUserId, accessToken, supabase } = await createTestUser(
      TEST_USER.email,
      TEST_USER.password,
      FUNCTION_NAME,
    );

    try {
      const endpointUrl = buildEndpointUrl(FUNCTION_NAME);

      // titleなしでリクエスト
      const response = await fetch(endpointUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          description: "説明のみ",
        }),
      });

      await logNon200Response(response.clone());

      // titleがない場合は400エラー
      assertEquals(response.status, 400);

      const data = await response.json();
      assert(
        data.success === false && data.error !== undefined,
        "エラーレスポンスが存在するべき",
      );
      assertEquals(data.error, "title is required");
    } finally {
      // クリーンアップ
      await cleanupTestTodos(mUserId, supabase);
      await cleanupTestUser(authUserId, supabase);
    }
    logTestEnd("titleなし（400エラー）");
  },
});

Deno.test({
  name: "create-todo - title空文字（400エラー）",
  sanitizeResources: false,
  sanitizeOps: false,
  async fn() {
    logTestStart("title空文字（400エラー）");

    // テストユーザー作成
    const { authUserId, mUserId, accessToken, supabase } = await createTestUser(
      TEST_USER.email,
      TEST_USER.password,
      FUNCTION_NAME,
    );

    try {
      const endpointUrl = buildEndpointUrl(FUNCTION_NAME);

      // title空文字でリクエスト
      const response = await fetch(endpointUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          title: "",
          description: "説明",
        }),
      });

      await logNon200Response(response.clone());

      // title空文字の場合は400エラー
      assertEquals(response.status, 400);

      const data = await response.json();
      assert(
        data.success === false && data.error !== undefined,
        "エラーレスポンスが存在するべき",
      );
      assertEquals(data.error, "title is required");
    } finally {
      // クリーンアップ
      await cleanupTestTodos(mUserId, supabase);
      await cleanupTestUser(authUserId, supabase);
    }
    logTestEnd("title空文字（400エラー）");
  },
});

Deno.test({
  name: "create-todo - title空白文字のみ（400エラー）",
  sanitizeResources: false,
  sanitizeOps: false,
  async fn() {
    logTestStart("title空白文字のみ（400エラー）");

    // テストユーザー作成
    const { authUserId, mUserId, accessToken, supabase } = await createTestUser(
      TEST_USER.email,
      TEST_USER.password,
      FUNCTION_NAME,
    );

    try {
      const endpointUrl = buildEndpointUrl(FUNCTION_NAME);

      // title空白文字のみでリクエスト
      const response = await fetch(endpointUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          title: "   ",
          description: "説明",
        }),
      });

      await logNon200Response(response.clone());

      // title空白文字のみの場合は400エラー
      assertEquals(response.status, 400);

      const data = await response.json();
      assert(
        data.success === false && data.error !== undefined,
        "エラーレスポンスが存在するべき",
      );
      assertEquals(data.error, "title is required");
    } finally {
      // クリーンアップ
      await cleanupTestTodos(mUserId, supabase);
      await cleanupTestUser(authUserId, supabase);
    }
    logTestEnd("title空白文字のみ（400エラー）");
  },
});

Deno.test({
  name: "create-todo - 正常なレスポンス（最小限のフィールド：titleのみ）",
  sanitizeResources: false,
  sanitizeOps: false,
  async fn() {
    logTestStart("正常なレスポンス（最小限のフィールド：titleのみ）");

    // テストユーザー作成
    const { authUserId, mUserId, accessToken, supabase } = await createTestUser(
      TEST_USER.email,
      TEST_USER.password,
      FUNCTION_NAME,
    );

    try {
      const endpointUrl = buildEndpointUrl(FUNCTION_NAME);

      // titleのみでリクエスト
      const response = await fetch(endpointUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          title: "最小限のToDo",
        }),
      });

      await logNon200Response(response.clone());

      // 正常に作成された場合は201ステータス
      assertEquals(response.status, 201);

      const result = await response.json();
      assert(result.success === true, "successはtrueであるべき");

      const data = result.data as InsertedTodo;
      assertExists(data, "dataが存在するべき");

      // レスポンスの検証
      assertExists(data.id);
      assertEquals(typeof data.id, "number");
      assertEquals(data.title, "最小限のToDo");

      // デフォルト値の検証
      assertEquals(data.priority, "medium", "priorityのデフォルトはmedium");
      assertEquals(data.status, "pending", "statusのデフォルトはpending");

      // オプショナルフィールドの検証
      assertEquals(data.description, null, "descriptionはnull");

      // 作成されたToDoを確認
      const { data: todos, error: selectError } = await supabase
        .from("t_todo")
        .select("*")
        .eq("user_id", mUserId);

      assert(!selectError, "ToDoの取得に成功するべき");
      assertEquals(todos?.length, 1, "1件のToDoが作成されているべき");
      assertEquals(todos?.[0].title, "最小限のToDo");
    } finally {
      // クリーンアップ
      await cleanupTestTodos(mUserId, supabase);
      await cleanupTestUser(authUserId, supabase);
    }
    logTestEnd("正常なレスポンス（最小限のフィールド：titleのみ）");
  },
});

Deno.test({
  name: "create-todo - 正常なレスポンス（全フィールド）",
  sanitizeResources: false,
  sanitizeOps: false,
  async fn() {
    logTestStart("正常なレスポンス（全フィールド）");

    // テストユーザー作成
    const { authUserId, mUserId, accessToken, supabase } = await createTestUser(
      TEST_USER.email,
      TEST_USER.password,
      FUNCTION_NAME,
    );

    try {
      const endpointUrl = buildEndpointUrl(FUNCTION_NAME);

      // 全フィールドでリクエスト
      const todoData = {
        title: "完全なToDo",
        description: "詳細な説明",
        priority: "high",
        dueDate: "2025-12-31",
      };

      const response = await fetch(endpointUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(todoData),
      });

      await logNon200Response(response.clone());

      // 正常に作成された場合は201ステータス
      assertEquals(response.status, 201);

      const result = await response.json();
      assert(result.success === true, "successはtrueであるべき");

      const data = result.data as InsertedTodo;
      assertExists(data, "dataが存在するべき");

      // レスポンスの検証
      assertExists(data.id);
      assertEquals(typeof data.id, "number");
      assertEquals(data.title, todoData.title);
      assertEquals(data.description, todoData.description);
      assertEquals(data.priority, todoData.priority);
      assertEquals(data.status, "pending");

      // 作成されたToDoを確認
      const { data: todos, error: selectError } = await supabase
        .from("t_todo")
        .select("*")
        .eq("user_id", mUserId);

      assert(!selectError, "ToDoの取得に成功するべき");
      assertEquals(todos?.length, 1, "1件のToDoが作成されているべき");
      assertEquals(todos?.[0].title, todoData.title);
      assertEquals(todos?.[0].description, todoData.description);
      assertEquals(todos?.[0].priority, todoData.priority);
    } finally {
      // クリーンアップ
      await cleanupTestTodos(mUserId, supabase);
      await cleanupTestUser(authUserId, supabase);
    }
    logTestEnd("正常なレスポンス（全フィールド）");
  },
});

Deno.test({
  name: "create-todo - priority: low の検証",
  sanitizeResources: false,
  sanitizeOps: false,
  async fn() {
    logTestStart("priority: low の検証");

    // テストユーザー作成
    const { authUserId, mUserId, accessToken, supabase } = await createTestUser(
      TEST_USER.email,
      TEST_USER.password,
      FUNCTION_NAME,
    );

    try {
      const endpointUrl = buildEndpointUrl(FUNCTION_NAME);

      const response = await fetch(endpointUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          title: "低優先度のToDo",
          priority: "low",
        }),
      });

      await logNon200Response(response.clone());

      assertEquals(response.status, 201);
      const result = await response.json();
      const data = result.data as InsertedTodo;

      assertEquals(data.priority, "low");
    } finally {
      // クリーンアップ
      await cleanupTestTodos(mUserId, supabase);
      await cleanupTestUser(authUserId, supabase);
    }
    logTestEnd("priority: low の検証");
  },
});

Deno.test({
  name: "create-todo - 複数のToDo作成（連続作成）",
  sanitizeResources: false,
  sanitizeOps: false,
  async fn() {
    logTestStart("複数のToDo作成（連続作成）");

    // テストユーザー作成
    const { authUserId, mUserId, accessToken, supabase } = await createTestUser(
      TEST_USER.email,
      TEST_USER.password,
      FUNCTION_NAME,
    );

    try {
      const endpointUrl = buildEndpointUrl(FUNCTION_NAME);

      // 3件のToDoを連続で作成
      const todos = [
        { title: "ToDo 1", priority: "low" },
        { title: "ToDo 2", priority: "medium" },
        { title: "ToDo 3", priority: "high" },
      ];

      for (const todo of todos) {
        const response = await fetch(endpointUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify(todo),
        });

        assertEquals(response.status, 201, `${todo.title}の作成に成功するべき`);
        const result = await response.json();
        assert(result.success === true);
      }

      // 作成されたToDoを確認
      const { data: createdTodos, error: selectError } = await supabase
        .from("t_todo")
        .select("*")
        .eq("user_id", mUserId)
        .order("created_at", { ascending: true });

      assert(!selectError, "ToDoの取得に成功するべき");
      assertEquals(createdTodos?.length, 3, "3件のToDoが作成されているべき");

      // 各ToDoの検証
      assertEquals(createdTodos?.[0].title, "ToDo 1");
      assertEquals(createdTodos?.[0].priority, "low");
      assertEquals(createdTodos?.[1].title, "ToDo 2");
      assertEquals(createdTodos?.[1].priority, "medium");
      assertEquals(createdTodos?.[2].title, "ToDo 3");
      assertEquals(createdTodos?.[2].priority, "high");
    } finally {
      // クリーンアップ
      await cleanupTestTodos(mUserId, supabase);
      await cleanupTestUser(authUserId, supabase);
    }
    logTestEnd("複数のToDo作成（連続作成）");
  },
});

Deno.test({
  name: "create-todo - ユーザー分離の検証（各ユーザーが自分のToDoのみ作成）",
  sanitizeResources: false,
  sanitizeOps: false,
  async fn() {
    logTestStart("ユーザー分離の検証（各ユーザーが自分のToDoのみ作成）");

    // テストユーザー1を作成
    const testUser1 = await createTestUser(
      TEST_USER.email,
      TEST_USER.password,
      FUNCTION_NAME,
    );

    // テストユーザー2を作成（異なるメールアドレス）
    const testUser2 = await createTestUser(
      "test-create-todo-2@example.com",
      TEST_USER.password,
      FUNCTION_NAME,
    );

    try {
      const endpointUrl = buildEndpointUrl(FUNCTION_NAME);

      // ユーザー1がToDoを作成
      const response1 = await fetch(endpointUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${testUser1.accessToken}`,
        },
        body: JSON.stringify({
          title: "ユーザー1のToDo",
        }),
      });

      assertEquals(response1.status, 201);

      // ユーザー2がToDoを作成
      const response2 = await fetch(endpointUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${testUser2.accessToken}`,
        },
        body: JSON.stringify({
          title: "ユーザー2のToDo",
        }),
      });

      assertEquals(response2.status, 201);

      // ユーザー1のToDoを確認
      const { data: user1Todos } = await testUser1.supabase
        .from("t_todo")
        .select("*")
        .eq("user_id", testUser1.mUserId);

      assertEquals(user1Todos?.length, 1, "ユーザー1は1件のToDoを持つべき");
      assertEquals(user1Todos?.[0].title, "ユーザー1のToDo");

      // ユーザー2のToDoを確認
      const { data: user2Todos } = await testUser2.supabase
        .from("t_todo")
        .select("*")
        .eq("user_id", testUser2.mUserId);

      assertEquals(user2Todos?.length, 1, "ユーザー2は1件のToDoを持つべき");
      assertEquals(user2Todos?.[0].title, "ユーザー2のToDo");
    } finally {
      // クリーンアップ
      await cleanupTestTodos(testUser1.mUserId, testUser1.supabase);
      await cleanupTestTodos(testUser2.mUserId, testUser2.supabase);
      await cleanupTestUser(testUser1.authUserId, testUser1.supabase);
      await cleanupTestUser(testUser2.authUserId, testUser2.supabase);
    }
    logTestEnd("ユーザー分離の検証（各ユーザーが自分のToDoのみ作成）");
  },
});

Deno.test({
  name: "create-todo - レスポンス時間の確認",
  sanitizeResources: false,
  sanitizeOps: false,
  async fn() {
    logTestStart("レスポンス時間の確認");

    // テストユーザー作成
    const { authUserId, mUserId, accessToken, supabase } = await createTestUser(
      TEST_USER.email,
      TEST_USER.password,
      FUNCTION_NAME,
    );

    try {
      const endpointUrl = buildEndpointUrl(FUNCTION_NAME);

      // レスポンス時間を計測
      const startTime = Date.now();
      const response = await fetch(endpointUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          title: "レスポンス時間測定用ToDo",
          description: "パフォーマンステスト",
          priority: "high",
          dueDate: "2025-12-31",
        }),
      });
      const endTime = Date.now();
      const responseTime = endTime - startTime;

      // レスポンス時間が3秒以内であることを確認
      assertResponseTime(responseTime, 3000);
      assertEquals(response.status, 201);

      const result = await response.json();
      assert(result.success === true);
    } finally {
      // クリーンアップ
      await cleanupTestTodos(mUserId, supabase);
      await cleanupTestUser(authUserId, supabase);
    }
    logTestEnd("レスポンス時間の確認");
  },
});

Deno.test({
  name: "create-todo - 長いtitleの検証（255文字）",
  sanitizeResources: false,
  sanitizeOps: false,
  async fn() {
    logTestStart("長いtitleの検証（255文字）");

    // テストユーザー作成
    const { authUserId, mUserId, accessToken, supabase } = await createTestUser(
      TEST_USER.email,
      TEST_USER.password,
      FUNCTION_NAME,
    );

    try {
      const endpointUrl = buildEndpointUrl(FUNCTION_NAME);

      // 255文字のtitle
      const longTitle = "あ".repeat(255);

      const response = await fetch(endpointUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          title: longTitle,
        }),
      });

      await logNon200Response(response.clone());

      assertEquals(response.status, 201);
      const result = await response.json();
      const data = result.data as InsertedTodo;

      assertEquals(data.title, longTitle);
    } finally {
      // クリーンアップ
      await cleanupTestTodos(mUserId, supabase);
      await cleanupTestUser(authUserId, supabase);
    }
    logTestEnd("長いtitleの検証（255文字）");
  },
});

Deno.test({
  name: "create-todo - 長いdescriptionの検証（1000文字）",
  sanitizeResources: false,
  sanitizeOps: false,
  async fn() {
    logTestStart("長いdescriptionの検証（1000文字）");

    // テストユーザー作成
    const { authUserId, mUserId, accessToken, supabase } = await createTestUser(
      TEST_USER.email,
      TEST_USER.password,
      FUNCTION_NAME,
    );

    try {
      const endpointUrl = buildEndpointUrl(FUNCTION_NAME);

      // 1000文字のdescription
      const longDescription = "あ".repeat(1000);

      const response = await fetch(endpointUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          title: "長い説明のToDo",
          description: longDescription,
        }),
      });

      await logNon200Response(response.clone());

      assertEquals(response.status, 201);
      const result = await response.json();
      const data = result.data as InsertedTodo;

      assertEquals(data.description, longDescription);
    } finally {
      // クリーンアップ
      await cleanupTestTodos(mUserId, supabase);
      await cleanupTestUser(authUserId, supabase);
    }
    logTestEnd("長いdescriptionの検証（1000文字）");
  },
});

Deno.test({
  name: "create-todo - 特殊文字を含むtitleの検証",
  sanitizeResources: false,
  sanitizeOps: false,
  async fn() {
    logTestStart("特殊文字を含むtitleの検証");

    // テストユーザー作成
    const { authUserId, mUserId, accessToken, supabase } = await createTestUser(
      TEST_USER.email,
      TEST_USER.password,
      FUNCTION_NAME,
    );

    try {
      const endpointUrl = buildEndpointUrl(FUNCTION_NAME);

      // 特殊文字を含むtitle
      const specialTitle =
        "📝 ToDo <script>alert('XSS')</script> & \"test\" 'test'";

      const response = await fetch(endpointUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          title: specialTitle,
        }),
      });

      await logNon200Response(response.clone());

      assertEquals(response.status, 201);
      const result = await response.json();
      const data = result.data as InsertedTodo;

      // 特殊文字がそのまま保存されていることを確認
      assertEquals(data.title, specialTitle);
    } finally {
      // クリーンアップ
      await cleanupTestTodos(mUserId, supabase);
      await cleanupTestUser(authUserId, supabase);
    }
    logTestEnd("特殊文字を含むtitleの検証");
  },
});
