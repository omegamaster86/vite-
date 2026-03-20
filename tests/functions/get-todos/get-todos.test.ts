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

// 型定義: sel_todos_by_user の戻り値の型
type TodoItem =
  Database["public"]["Functions"]["sel_todos_by_user"]["Returns"][number];

// テスト対象の関数名
const FUNCTION_NAME = "get-todos";

// テスト用ユーザー情報
const TEST_USER = {
  email: "test-get-todos@example.com",
  password: "TestPassword123!",
};

/**
 * テストユーザーのToDo データを作成
 */
async function createTestTodos(
  mUserId: number,
  supabase: SupabaseClient,
  count: number,
  createdProgram: string,
): Promise<void> {
  const todos = [];
  for (let i = 1; i <= count; i++) {
    todos.push({
      user_id: mUserId, // m_user.id への参照
      title: `テストToDo ${i}`,
      description: `テストToDo ${i} の説明`,
      status: i % 2 === 0 ? "completed" : "pending", // 偶数番目は完了済み
      created_program: createdProgram,
      updated_program: createdProgram,
    });
  }

  const { error } = await supabase.from("t_todo").insert(todos);
  if (error) {
    throw new Error(`ToDoデータの挿入に失敗しました: ${error.message}`);
  }
}

/**
 * テストユーザーのToDo を削除
 */
async function cleanupTestTodos(
  mUserId: number,
  supabase: SupabaseClient,
): Promise<void> {
  await supabase.from("t_todo").delete().eq("user_id", mUserId);
}

Deno.test("get-todos - GET以外のリクエスト（405エラー）", async () => {
  logTestStart("GET以外のリクエスト（405エラー）");
  const response = await makeRequest(FUNCTION_NAME, "POST");
  await assertErrorResponse(response, 405, "Method not allowed");
  logTestEnd("GET以外のリクエスト（405エラー）");
});

Deno.test("get-todos - PUTリクエスト（未対応メソッド）", async () => {
  logTestStart("PUTリクエスト（未対応メソッド）");
  const response = await makeRequest(FUNCTION_NAME, "PUT");

  // PUTリクエストは未対応なので405エラーが期待される
  await assertErrorResponse(response, 405, "Method not allowed");
  logTestEnd("PUTリクエスト（未対応メソッド）");
});

Deno.test("get-todos - DELETEリクエスト（未対応メソッド）", async () => {
  logTestStart("DELETEリクエスト（未対応メソッド）");
  const response = await makeRequest(FUNCTION_NAME, "DELETE");

  // DELETEリクエストは未対応なので405エラーが期待される
  await assertErrorResponse(response, 405, "Method not allowed");
  logTestEnd("DELETEリクエスト（未対応メソッド）");
});

Deno.test({
  name: "get-todos - 認証ヘッダーなし（401エラー）",
  sanitizeResources: false,
  sanitizeOps: false,
  async fn() {
    logTestStart("認証ヘッダーなし（401エラー）");
    const endpointUrl = buildEndpointUrl(FUNCTION_NAME);

    // Authorizationヘッダーなしでリクエスト
    const response = await fetch(endpointUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
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
  name: "get-todos - 無効なトークン（401エラー）",
  sanitizeResources: false,
  sanitizeOps: false,
  async fn() {
    logTestStart("無効なトークン（401エラー）");
    const endpointUrl = buildEndpointUrl(FUNCTION_NAME);

    // 無効なトークンでリクエスト
    const response = await fetch(endpointUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer invalid-token",
      },
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
  name: "get-todos - 正常なレスポンス（認証済みユーザー、ToDo 3件）",
  sanitizeResources: false,
  sanitizeOps: false,
  async fn() {
    logTestStart("正常なレスポンス（認証済みユーザー、ToDo 3件）");

    // テストユーザー作成
    const { authUserId, mUserId, accessToken, supabase } = await createTestUser(
      TEST_USER.email,
      TEST_USER.password,
      FUNCTION_NAME,
    );

    try {
      // テストToDo を3件作成
      await createTestTodos(mUserId, supabase, 3, FUNCTION_NAME);

      // 認証トークン付きでリクエスト
      const endpointUrl = buildEndpointUrl(FUNCTION_NAME);
      const response = await fetch(endpointUrl, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      });

      await logNon200Response(response.clone());

      assertEquals(response.status, 200);
      const result = await response.json();
      const data = result.data as TodoItem[];

      // レスポンスの検証
      assert(Array.isArray(data), "レスポンスは配列であるべき");
      assertEquals(data.length, 3, "3件のToDoが返されるべき");

      // 各ToDoの検証
      for (const todo of data) {
        assertExists(todo.id);
        assertExists(todo.title);
        assertExists(todo.status);
        assertExists(todo.priority);

        // 型の検証
        assertEquals(typeof todo.id, "number");
        assertEquals(typeof todo.title, "string");
        assertEquals(typeof todo.status, "string");
        assertEquals(typeof todo.priority, "string");

        // description は null の可能性がある
        assert(
          todo.description === null || typeof todo.description === "string",
        );

        // status の値の検証
        assert(
          ["pending", "in_progress", "completed", "cancelled"].includes(
            todo.status,
          ),
          `statusは有効な値であるべき: ${todo.status}`,
        );

        // priority の値の検証
        assert(
          ["low", "medium", "high"].includes(todo.priority),
          `priorityは有効な値であるべき: ${todo.priority}`,
        );
      }

      // タイトルの検証
      const titles = data.map((todo) => todo.title);
      assert(titles.includes("テストToDo 1"));
      assert(titles.includes("テストToDo 2"));
      assert(titles.includes("テストToDo 3"));
    } finally {
      // クリーンアップ
      await cleanupTestTodos(mUserId, supabase);
      await cleanupTestUser(authUserId, supabase);
    }
    logTestEnd("正常なレスポンス（認証済みユーザー、ToDo 3件）");
  },
});

Deno.test({
  name: "get-todos - 正常なレスポンス（認証済みユーザー、ToDo 0件）",
  sanitizeResources: false,
  sanitizeOps: false,
  async fn() {
    logTestStart("正常なレスポンス（認証済みユーザー、ToDo 0件）");

    // テストユーザー作成
    const { authUserId, mUserId, accessToken, supabase } = await createTestUser(
      TEST_USER.email,
      TEST_USER.password,
      FUNCTION_NAME,
    );

    try {
      // ToDoは作成しない

      // 認証トークン付きでリクエスト
      const endpointUrl = buildEndpointUrl(FUNCTION_NAME);
      const response = await fetch(endpointUrl, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      });

      await logNon200Response(response.clone());

      assertEquals(response.status, 200);
      const result = await response.json();
      const data = result.data as TodoItem[];

      // レスポンスの検証
      assert(Array.isArray(data), "レスポンスは配列であるべき");
      assertEquals(data.length, 0, "0件のToDoが返されるべき");
    } finally {
      // クリーンアップ
      await cleanupTestTodos(mUserId, supabase);
      await cleanupTestUser(authUserId, supabase);
    }
    logTestEnd("正常なレスポンス（認証済みユーザー、ToDo 0件）");
  },
});

Deno.test({
  name: "get-todos - 正常なレスポンス（認証済みユーザー、完了/未完了の混在）",
  sanitizeResources: false,
  sanitizeOps: false,
  async fn() {
    logTestStart("正常なレスポンス（認証済みユーザー、完了/未完了の混在）");

    // テストユーザー作成
    const { authUserId, mUserId, accessToken, supabase } = await createTestUser(
      TEST_USER.email,
      TEST_USER.password,
      FUNCTION_NAME,
    );

    try {
      // テストToDo を10件作成（偶数番目は完了済み）
      await createTestTodos(mUserId, supabase, 10, FUNCTION_NAME);

      // 認証トークン付きでリクエスト
      const endpointUrl = buildEndpointUrl(FUNCTION_NAME);
      const response = await fetch(endpointUrl, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      });

      await logNon200Response(response.clone());

      assertEquals(response.status, 200);
      const result = await response.json();
      const data = result.data as TodoItem[];

      // レスポンスの検証
      assert(Array.isArray(data), "レスポンスは配列であるべき");
      assertEquals(data.length, 10, "10件のToDoが返されるべき");

      // 完了済みと未完了のToDoが混在していることを確認
      const completedCount = data.filter(
        (todo) => todo.status === "completed",
      ).length;
      const uncompletedCount = data.filter(
        (todo) => todo.status !== "completed",
      ).length;

      assertEquals(completedCount, 5, "完了済みToDoは5件であるべき");
      assertEquals(uncompletedCount, 5, "未完了ToDoは5件であるべき");
    } finally {
      // クリーンアップ
      await cleanupTestTodos(mUserId, supabase);
      await cleanupTestUser(authUserId, supabase);
    }
    logTestEnd("正常なレスポンス（認証済みユーザー、完了/未完了の混在）");
  },
});

Deno.test({
  name: "get-todos - ユーザー分離の検証（他ユーザーのToDoは取得できない）",
  sanitizeResources: false,
  sanitizeOps: false,
  async fn() {
    logTestStart("ユーザー分離の検証（他ユーザーのToDoは取得できない）");

    // テストユーザー1を作成
    const testUser1 = await createTestUser(
      TEST_USER.email,
      TEST_USER.password,
      FUNCTION_NAME,
    );

    // テストユーザー2を作成（異なるメールアドレス）
    const testUser2 = await createTestUser(
      "test-get-todos-2@example.com",
      TEST_USER.password,
      FUNCTION_NAME,
    );

    try {
      // ユーザー1のToDoを3件作成
      await createTestTodos(
        testUser1.mUserId,
        testUser1.supabase,
        3,
        FUNCTION_NAME,
      );

      // ユーザー2のToDoを5件作成
      await createTestTodos(
        testUser2.mUserId,
        testUser2.supabase,
        5,
        FUNCTION_NAME,
      );

      // ユーザー1のトークンでリクエスト
      const endpointUrl = buildEndpointUrl(FUNCTION_NAME);
      const response1 = await fetch(endpointUrl, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${testUser1.accessToken}`,
        },
      });

      await logNon200Response(response1.clone());

      assertEquals(response1.status, 200);
      const result1 = await response1.json();
      const data1 = result1.data as TodoItem[];

      // ユーザー1は自分のToDoのみ取得できる
      assertEquals(data1.length, 3, "ユーザー1は3件のToDoを取得できるべき");

      // ユーザー2のトークンでリクエスト
      const response2 = await fetch(endpointUrl, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${testUser2.accessToken}`,
        },
      });

      await logNon200Response(response2.clone());

      assertEquals(response2.status, 200);
      const result2 = await response2.json();
      const data2 = result2.data as TodoItem[];

      // ユーザー2は自分のToDoのみ取得できる
      assertEquals(data2.length, 5, "ユーザー2は5件のToDoを取得できるべき");
    } finally {
      // クリーンアップ
      await cleanupTestTodos(testUser1.mUserId, testUser1.supabase);
      await cleanupTestTodos(testUser2.mUserId, testUser2.supabase);
      await cleanupTestUser(testUser1.authUserId, testUser1.supabase);
      await cleanupTestUser(testUser2.authUserId, testUser2.supabase);
    }
    logTestEnd("ユーザー分離の検証（他ユーザーのToDoは取得できない）");
  },
});

Deno.test({
  name: "get-todos - レスポンス時間の確認",
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
      // テストToDo を100件作成
      await createTestTodos(mUserId, supabase, 100, FUNCTION_NAME);

      // レスポンス時間を計測
      const endpointUrl = buildEndpointUrl(FUNCTION_NAME);
      const startTime = Date.now();
      const response = await fetch(endpointUrl, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      });
      const endTime = Date.now();
      const responseTime = endTime - startTime;

      // レスポンス時間が3秒以内であることを確認
      assertResponseTime(responseTime, 3000);
      assertEquals(response.status, 200);

      const result = await response.json();
      const data = result.data as TodoItem[];
      assertEquals(data.length, 100, "100件のToDoが返されるべき");
    } finally {
      // クリーンアップ
      await cleanupTestTodos(mUserId, supabase);
      await cleanupTestUser(authUserId, supabase);
    }
    logTestEnd("レスポンス時間の確認");
  },
});

Deno.test({
  name: "get-todos - レスポンスデータの詳細検証",
  sanitizeResources: false,
  sanitizeOps: false,
  async fn() {
    logTestStart("レスポンスデータの詳細検証");

    // テストユーザー作成
    const { authUserId, mUserId, accessToken, supabase } = await createTestUser(
      TEST_USER.email,
      TEST_USER.password,
      FUNCTION_NAME,
    );

    try {
      // 特定のToDoを作成
      const specificTodo = {
        user_id: mUserId, // m_user.id への参照
        title: "詳細検証用ToDo",
        description: "これは詳細検証用のToDoです",
        status: "pending",
        created_program: FUNCTION_NAME,
        updated_program: FUNCTION_NAME,
      };

      const { error } = await supabase.from("t_todo").insert([specificTodo]);
      if (error) {
        throw new Error(`ToDoデータの挿入に失敗しました: ${error.message}`);
      }

      // 認証トークン付きでリクエスト
      const endpointUrl = buildEndpointUrl(FUNCTION_NAME);
      const response = await fetch(endpointUrl, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      });

      await logNon200Response(response.clone());

      assertEquals(response.status, 200);
      const result = await response.json();
      const data = result.data as TodoItem[];

      // レスポンスの検証
      assert(Array.isArray(data), "レスポンスは配列であるべき");
      assertEquals(data.length, 1, "1件のToDoが返されるべき");

      const todo = data[0];

      // 各フィールドの詳細検証
      assertExists(todo.id);
      assertEquals(typeof todo.id, "number");
      assert(todo.id > 0, "idは正の数であるべき");

      assertEquals(todo.title, "詳細検証用ToDo");
      assertEquals(todo.description, "これは詳細検証用のToDoです");
      assertEquals(todo.status, "pending");
      assertEquals(todo.priority, "medium");
    } finally {
      // クリーンアップ
      await cleanupTestTodos(mUserId, supabase);
      await cleanupTestUser(authUserId, supabase);
    }
    logTestEnd("レスポンスデータの詳細検証");
  },
});
