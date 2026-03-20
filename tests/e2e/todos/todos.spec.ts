import { expect, test } from "@playwright/test";
import { freezeTime } from "../shared/freezeTime";
import { logTestEnd, logTestStart } from "../shared/test-helpers";
import {
  cleanupTestTodos,
  createBasicTodos,
  createPriorityTestTodos,
  createStatusTestTodos,
} from "../shared/todo-helpers";
import {
  cleanupE2ETestUser,
  createE2ETestUser,
  type E2ETestUser,
} from "../shared/user-helpers";

test.describe("ToDo一覧ページ", () => {
  // テストユーザーを保持する変数
  let testUser: E2ETestUser;

  // 全テスト実行前に1度だけテストユーザーを作成
  test.beforeAll(async () => {
    console.log("\n🔧 [SETUP] テストユーザーを作成中...");
    testUser = await createE2ETestUser(
      "e2e-test@example.com",
      "TestPass1@",
      "user",
    );
    console.log(`✅ [SETUP] テストユーザー作成完了: ${testUser.email}\n`);
  });

  // 全テスト実行後にテストユーザーを削除
  test.afterAll(async () => {
    if (testUser) {
      console.log("\n🧹 [CLEANUP] テストユーザーを削除中...");
      await cleanupE2ETestUser(testUser);
      console.log("✅ [CLEANUP] テストユーザー削除完了\n");
    }
  });

  test.beforeEach(async ({ context, page }, testInfo) => {
    logTestStart(testInfo.title);

    await freezeTime(context, process.env.FIXED_DATE ?? "2025-10-01T13:00:00Z");

    // 作成したテストユーザーでサインイン
    await page.goto("/login");
    // ログインフォームが表示されるまで待機
    await page.waitForSelector("input#email", { timeout: 10000 });
    await page.fill("input#email", testUser.email);
    await page.fill("input#password", testUser.password);
    await page.click("button[type='submit']");

    // todosページへの遷移を待機
    await page.waitForURL("**/todos", { timeout: 30000 });
  });

  test.afterEach(async ({ page: _page }, testInfo) => {
    // testInfo.statusの型を適切に処理
    const status =
      testInfo.status === "interrupted" ? "failed" : testInfo.status;
    logTestEnd(testInfo.title, status, testInfo.duration);
  });

  test("【ToDo一覧】登録された全てのToDoが正しく表示される", async ({
    page,
  }) => {
    // テスト用データをクリアしてから登録
    await cleanupTestTodos(testUser.mUserId);
    await createBasicTodos(testUser.mUserId);

    await page.goto("/todos");

    // ローディングが完了するまで待機
    await page.waitForTimeout(1500);

    // ToDoリストが表示される（5件登録されている）
    const todoItems = page.locator("div.p-6.transition-colors");
    const count = await todoItems.count();
    expect(count).toBe(5); // base.csvには5件のデータがある

    // ToDoリストのヘッダーに件数が表示される
    const header = page.locator("h3.text-lg.font-semibold");
    await expect(header).toHaveText("ToDoリスト (5件)");

    // 各ToDoの詳細を検証
    // ORDER BY句に従った順序:
    // 1. ステータス順: in_progress(1) → pending(2) → completed(3)
    // 2. 優先度順: high(1) → medium(2) → low(3)
    // 3. due_date ASC NULLS LAST
    // 4. created_at DESC
    const expectedTodos = [
      {
        title: "バグ修正",
        description: "ログイン画面の不具合を修正する",
        status: "進行中",
        priority: "高",
      },
      {
        title: "ミーティング資料の準備",
        description: "来週の定例会議用の資料を準備する",
        status: "進行中",
        priority: "中",
      },
      {
        title: "週報を作成する",
        description: "先週の活動をまとめて週報を作成",
        status: "未着手",
        priority: "高",
      },
      {
        title: "環境構築ドキュメント更新",
        description: "新しい開発環境のセットアップ手順を文書化",
        status: "未着手",
        priority: "中",
      },
      {
        title: "コードレビュー",
        description: "プルリクエストのレビューを実施",
        status: "完了",
        priority: "低",
      },
    ];

    // 各ToDoを検証
    for (let i = 0; i < Math.min(count, expectedTodos.length); i++) {
      const todo = todoItems.nth(i);
      const expectedTodo = expectedTodos[i];

      // タイトルが表示される（TodoList/index.tsx:103-105行目）
      const titleElement = todo.locator("h4.text-base.font-medium");
      await expect(titleElement).toBeVisible();
      const titleText = await titleElement.textContent();
      expect(titleText).toBe(expectedTodo.title);

      // 説明が表示される（TodoList/index.tsx:121-125行目）
      if (expectedTodo.description) {
        const descriptionElement = todo.locator("p.text-sm.text-gray-600");
        await expect(descriptionElement).toBeVisible();
        const descriptionText = await descriptionElement.textContent();
        expect(descriptionText).toBe(expectedTodo.description);
      }

      // ステータスバッジが表示される（TodoList/index.tsx:106-112行目）
      const statusBadge = todo.locator("span.inline-flex.rounded-full").first();
      await expect(statusBadge).toBeVisible();
      const statusText = await statusBadge.textContent();
      expect(statusText).toBe(expectedTodo.status);

      // 優先度バッジが表示される（TodoList/index.tsx:113-119行目）
      const priorityBadge = todo
        .locator("span.inline-flex.rounded-full")
        .nth(1);
      await expect(priorityBadge).toBeVisible();
      const priorityText = await priorityBadge.textContent();
      expect(priorityText).toContain(`優先度: ${expectedTodo.priority}`);
    }
  });

  test("【ToDo一覧】データがない時に適切なメッセージが表示される", async ({
    page,
  }) => {
    // テスト用データをクリアして空の状態にする
    await cleanupTestTodos(testUser.mUserId);

    await page.goto("/todos");

    // ローディングが完了するまで待機
    await page.waitForTimeout(1500);

    // ToDoリストアイテムがないことを確認
    const todoItems = page.locator("div.p-6.transition-colors");
    const count = await todoItems.count();
    expect(count).toBe(0);

    // ToDoリストのヘッダーに件数0が表示される
    const header = page.locator("h3.text-lg.font-semibold");
    await expect(header).toHaveText("ToDoリスト (0件)");

    // 空状態のメッセージが表示される（TodoList/index.tsx:91-93行目）
    const emptyMessage = page.locator("div.p-6.text-center.text-gray-500");
    await expect(emptyMessage).toBeVisible();
    await expect(emptyMessage).toHaveText(
      "ToDoがありません。新しいToDoを作成してください。",
    );
  });

  test("【ToDo一覧】優先度別の表示が正しく動作する", async ({ page }) => {
    // テスト用データをクリアしてから優先度別のデータを作成
    await cleanupTestTodos(testUser.mUserId);
    await createPriorityTestTodos(testUser.mUserId);

    await page.goto("/todos");

    // ローディングが完了するまで待機
    await page.waitForTimeout(1500);

    // 3件のToDoが表示される
    const todoItems = page.locator("div.p-6.transition-colors");
    const count = await todoItems.count();
    expect(count).toBe(3);

    // 優先度：高のToDo
    const highPriorityTodo = todoItems.first();
    const highPriorityBadge = highPriorityTodo
      .locator("span.inline-flex.rounded-full")
      .nth(1);
    await expect(highPriorityBadge).toBeVisible();
    await expect(highPriorityBadge).toHaveText("優先度: 高");
    // 優先度：高は赤色のバッジ（TodoList/index.tsx:18行目）
    const highPriorityClass = await highPriorityBadge.getAttribute("class");
    expect(highPriorityClass).toContain("bg-red-100");
    expect(highPriorityClass).toContain("text-red-800");

    // 優先度：中のToDo
    const mediumPriorityTodo = todoItems.nth(1);
    const mediumPriorityBadge = mediumPriorityTodo
      .locator("span.inline-flex.rounded-full")
      .nth(1);
    await expect(mediumPriorityBadge).toBeVisible();
    await expect(mediumPriorityBadge).toHaveText("優先度: 中");
    // 優先度：中は黄色のバッジ（TodoList/index.tsx:20行目）
    const mediumPriorityClass = await mediumPriorityBadge.getAttribute("class");
    expect(mediumPriorityClass).toContain("bg-yellow-100");
    expect(mediumPriorityClass).toContain("text-yellow-800");

    // 優先度：低のToDo
    const lowPriorityTodo = todoItems.nth(2);
    const lowPriorityBadge = lowPriorityTodo
      .locator("span.inline-flex.rounded-full")
      .nth(1);
    await expect(lowPriorityBadge).toBeVisible();
    await expect(lowPriorityBadge).toHaveText("優先度: 低");
    // 優先度：低は緑色のバッジ（TodoList/index.tsx:22行目）
    const lowPriorityClass = await lowPriorityBadge.getAttribute("class");
    expect(lowPriorityClass).toContain("bg-green-100");
    expect(lowPriorityClass).toContain("text-green-800");
  });

  test("【ToDo一覧】ステータス別の表示が正しく動作する", async ({ page }) => {
    // テスト用データをクリアしてからステータス別のデータを作成
    await cleanupTestTodos(testUser.mUserId);
    await createStatusTestTodos(testUser.mUserId);

    await page.goto("/todos");

    // ローディングが完了するまで待機
    await page.waitForTimeout(1500);

    // 4件のToDoが表示される
    const todoItems = page.locator("div.p-6.transition-colors");
    const count = await todoItems.count();
    expect(count).toBe(4);

    // ORDER BY句に従った順序:
    // 1. ステータス順: in_progress(1) → pending(2) → completed(3) → cancelled(4)
    // 2. 優先度順: すべてmedium(2)なので同じ
    // 3. due_date ASC NULLS LAST
    // 4. created_at DESC

    // 進行中のToDo（1番目: in_progress, medium, 2025-10-03）
    const inProgressTodo = todoItems.first();
    const inProgressStatusBadge = inProgressTodo
      .locator("span.inline-flex.rounded-full")
      .first();
    await expect(inProgressStatusBadge).toBeVisible();
    await expect(inProgressStatusBadge).toHaveText("進行中");
    // 進行中は青色のバッジ（TodoList/index.tsx:36行目）
    const inProgressClass = await inProgressStatusBadge.getAttribute("class");
    expect(inProgressClass).toContain("bg-blue-100");
    expect(inProgressClass).toContain("text-blue-800");

    // 未着手のToDo（2番目: pending, medium, 2025-10-05）
    const pendingTodo = todoItems.nth(1);
    const pendingStatusBadge = pendingTodo
      .locator("span.inline-flex.rounded-full")
      .first();
    await expect(pendingStatusBadge).toBeVisible();
    await expect(pendingStatusBadge).toHaveText("未着手");
    // 未着手はグレーのバッジ（TodoList/index.tsx:38行目）
    const pendingClass = await pendingStatusBadge.getAttribute("class");
    expect(pendingClass).toContain("bg-gray-100");
    expect(pendingClass).toContain("text-gray-800");

    // 完了したToDo（3番目: completed, medium, 2025-09-30）
    const completedTodo = todoItems.nth(2);
    const completedStatusBadge = completedTodo
      .locator("span.inline-flex.rounded-full")
      .first();
    await expect(completedStatusBadge).toBeVisible();
    await expect(completedStatusBadge).toHaveText("完了");
    // 完了は緑色のバッジ（TodoList/index.tsx:34行目）
    const completedClass = await completedStatusBadge.getAttribute("class");
    expect(completedClass).toContain("bg-green-100");
    expect(completedClass).toContain("text-green-800");

    // キャンセルしたToDo（4番目: cancelled, medium, 2025-10-10）
    const cancelledTodo = todoItems.nth(3);
    const cancelledStatusBadge = cancelledTodo
      .locator("span.inline-flex.rounded-full")
      .first();
    await expect(cancelledStatusBadge).toBeVisible();
    await expect(cancelledStatusBadge).toHaveText("キャンセル");
    // キャンセルは赤色のバッジ（TodoList/index.tsx:40行目）
    const cancelledClass = await cancelledStatusBadge.getAttribute("class");
    expect(cancelledClass).toContain("bg-red-100");
    expect(cancelledClass).toContain("text-red-800");
  });

  test("【ToDo一覧】「新しいToDoを作成」ボタンが機能する", async ({ page }) => {
    // テスト用データをクリアして空の状態にする
    await cleanupTestTodos(testUser.mUserId);

    await page.goto("/todos");

    // ローディングが完了するまで待機
    await page.waitForTimeout(1500);

    // 「新しいToDoを作成」ボタンを取得（page.tsx:38-43行目）
    const createButton = page.locator('a[href="/todos/new"]');
    await expect(createButton).toBeVisible();
    await expect(createButton).toHaveText("新しいToDoを作成");

    // ボタンをクリック
    await createButton.click();

    // 新規作成ページに遷移したことを確認
    await page.waitForURL("**/todos/new", { timeout: 10000 });
    expect(page.url()).toContain("/todos/new");
  });

  test("【ToDo新規作成】新規作成フォームが正しく表示される", async ({
    page,
  }) => {
    await page.goto("/todos/new");

    // ページタイトルが表示される（page.tsx:17-22行目）
    const pageTitle = page.locator("h2.text-2xl.font-bold");
    await expect(pageTitle).toBeVisible();
    await expect(pageTitle).toHaveText("新しいToDoを作成");

    const pageDescription = page.locator("p.mt-1.text-sm.text-gray-500");
    await expect(pageDescription).toBeVisible();
    await expect(pageDescription).toHaveText(
      "必要な情報を入力して新しいToDoを作成できます。",
    );

    // フォームが表示される
    const form = page.locator("form");
    await expect(form).toBeVisible();

    // タイトル入力フィールドが表示される（NewTodoForm/index.tsx:74-95行目）
    const titleLabel = page.locator("label[for='title']");
    await expect(titleLabel).toBeVisible();
    await expect(titleLabel).toHaveText(/タイトル/);

    const titleInput = page.locator("input#title");
    await expect(titleInput).toBeVisible();
    await expect(titleInput).toHaveAttribute(
      "placeholder",
      "例：週報を作成する",
    );
    await expect(titleInput).toHaveAttribute("required");

    // 説明入力フィールドが表示される（NewTodoForm/index.tsx:97-117行目）
    const descriptionLabel = page.locator("label[for='description']");
    await expect(descriptionLabel).toBeVisible();
    await expect(descriptionLabel).toHaveText("説明（任意）");

    const descriptionTextarea = page.locator("textarea#description");
    await expect(descriptionTextarea).toBeVisible();
    await expect(descriptionTextarea).toHaveAttribute(
      "placeholder",
      "ToDoの詳細を入力...",
    );

    // 優先度選択フィールドが表示される（NewTodoForm/index.tsx:119-155行目）
    const priorityLabel = page.locator("label[for='priority']");
    await expect(priorityLabel).toBeVisible();
    await expect(priorityLabel).toHaveText("優先度");

    const priorityTrigger = page.locator("#priority");
    await expect(priorityTrigger).toBeVisible();
    // SelectTriggerはデフォルトで「中」が選択されている
    await expect(priorityTrigger).toContainText("中");

    // キャンセルボタンが表示される（NewTodoForm/index.tsx:159-166行目）
    const cancelButton = page
      .locator("button[type='button']")
      .filter({ hasText: "キャンセル" });
    await expect(cancelButton).toBeVisible();

    // 作成ボタンが表示される（NewTodoForm/index.tsx:167-173行目）
    const submitButton = page.locator("button[type='submit']");
    await expect(submitButton).toBeVisible();
    await expect(submitButton).toHaveText("ToDoを作成");
  });

  test("【ToDo新規作成】ToDoを作成して一覧に反映される", async ({ page }) => {
    // テスト用データをクリアして空の状態にする
    await cleanupTestTodos(testUser.mUserId);

    await page.goto("/todos/new");

    // フォームに入力
    const titleInput = page.locator("input#title");
    await titleInput.fill("E2Eテスト用のToDo");

    const descriptionTextarea = page.locator("textarea#description");
    await descriptionTextarea.fill("これはE2Eテストで作成されたToDoです");

    // 優先度を選択
    const priorityTrigger = page.locator("#priority");
    await priorityTrigger.click();

    // SelectContentが表示されるまで待機（Radix UIのPortalでレンダリングされるため）
    await page.waitForSelector('[role="listbox"]', { timeout: 5000 });

    // ドロップダウンから「高」を選択
    const highOption = page
      .locator('[role="option"]')
      .filter({ hasText: "高" });
    await expect(highOption).toBeVisible();
    await highOption.click();

    // 作成ボタンをクリック
    const submitButton = page.locator("button[type='submit']");
    await submitButton.click();

    // ToDo一覧ページに自動的にリダイレクトされる（NewTodoForm/index.tsx:38-42行目）
    await page.waitForURL("**/todos", { timeout: 10000 });

    // ローディングが完了するまで待機
    await page.waitForTimeout(1500);

    // 作成したToDoが表示される
    const todoItems = page.locator("div.p-6.transition-colors");
    const count = await todoItems.count();
    expect(count).toBeGreaterThan(0);

    // 最初のToDoを検証（新しく作成したToDoが表示される）
    const firstTodo = todoItems.first();
    const titleElement = firstTodo.locator("h4.text-base.font-medium");
    await expect(titleElement).toHaveText("E2Eテスト用のToDo");

    const descriptionElement = firstTodo.locator("p.text-sm.text-gray-600");
    await expect(descriptionElement).toHaveText(
      "これはE2Eテストで作成されたToDoです",
    );

    const priorityBadge = firstTodo
      .locator("span.inline-flex.rounded-full")
      .nth(1);
    await expect(priorityBadge).toHaveText("優先度: 高");
  });

  test("【ToDo新規作成】キャンセルボタンで一覧に戻る", async ({ page }) => {
    await page.goto("/todos/new");

    // キャンセルボタンをクリック（NewTodoForm/index.tsx:159-166行目）
    const cancelButton = page
      .locator("button[type='button']")
      .filter({ hasText: "キャンセル" });
    await cancelButton.click();

    // ToDo一覧ページに戻る（NewTodoForm/index.tsx:47-49行目）
    await page.waitForURL("**/todos", { timeout: 10000 });
    expect(page.url()).toContain("/todos");
  });

  test("【ToDo新規作成】タイトルが未入力の場合にバリデーションエラーが表示される", async ({
    page,
  }) => {
    await page.goto("/todos/new");

    // タイトルを入力せずに作成ボタンをクリック
    const submitButton = page.locator("button[type='submit']");
    await submitButton.click();

    // ブラウザの標準バリデーションが動作する（required属性による）
    // または、フォームが送信されない
    const titleInput = page.locator("input#title");
    // バリデーションエラーが表示されるか、フォームが送信されないことを確認
    const isInvalid = await titleInput.evaluate((el: HTMLInputElement) => {
      return !el.validity.valid;
    });
    expect(isInvalid).toBe(true);

    // ページが遷移していないことを確認（バリデーションエラーで送信が止まる）
    expect(page.url()).toContain("/todos/new");
  });
});
