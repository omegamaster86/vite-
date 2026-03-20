/**
 * Deno/Supabase Functions専用ヘルパー関数
 *
 * このファイルはDenoランタイムでのみ使用可能です。
 * Edge Functionのテストに必要なリクエスト送信やアサーション関数を提供します。
 */

import { assert, assertEquals } from "@std/assert";

/**
 * Supabase環境変数の設定
 */
export interface SupabaseConfig {
  url: string;
  anonKey: string;
}

/**
 * 環境変数からSupabase設定を取得
 * @returns Supabaseの設定
 * @throws 環境変数が設定されていない場合
 */
export function getSupabaseConfig(): SupabaseConfig {
  const url = Deno.env.get("SUPABASE_URL");
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY");

  if (!url) {
    throw new Error("SUPABASE_URL environment variable is not set.");
  }

  if (!anonKey) {
    throw new Error("SUPABASE_ANON_KEY environment variable is not set.");
  }

  return { url, anonKey };
}

/**
 * Edge Functionのエンドポイントを構築
 * @param functionName - 関数名
 * @returns エンドポイントURL
 */
export function buildEndpointUrl(functionName: string): string {
  const { url } = getSupabaseConfig();
  return `${url}/functions/v1/${functionName}`;
}

/**
 * Edge Functionにリクエストを送信
 * @param functionName - 関数名
 * @param method - HTTPメソッド（GET, POST, PUT, DELETE, OPTIONS等）
 * @param body - リクエストボディ（オプション）
 * @param headers - 追加ヘッダー（オプション）
 * @returns レスポンス
 */
export async function makeRequest(
  functionName: string,
  method: string,
  body?: unknown,
  headers: Record<string, string> = {},
): Promise<Response> {
  const { anonKey } = getSupabaseConfig();
  const endpointUrl = buildEndpointUrl(functionName);

  const requestHeaders = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${anonKey}`,
    ...headers,
  };

  const response = await fetch(endpointUrl, {
    method,
    headers: requestHeaders,
    body: body ? JSON.stringify(body) : undefined,
  });

  return response;
}

/**
 * 生のボディでEdge Functionにリクエストを送信
 * （無効なJSONやカスタムボディのテスト用）
 * @param functionName - 関数名
 * @param method - HTTPメソッド（GET, POST, PUT, DELETE, OPTIONS等）
 * @param rawBody - 生のリクエストボディ
 * @param headers - 追加ヘッダー（オプション）
 * @returns レスポンス
 */
export async function makeRawRequest(
  functionName: string,
  method: string,
  rawBody?: string | FormData | Blob,
  headers: Record<string, string> = {},
): Promise<Response> {
  const { anonKey } = getSupabaseConfig();
  const endpointUrl = buildEndpointUrl(functionName);

  const requestHeaders = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${anonKey}`,
    ...headers,
  };

  const response = await fetch(endpointUrl, {
    method,
    headers: requestHeaders,
    body: rawBody,
  });

  return response;
}

/**
 * 200以外のレスポンスの詳細をログ出力し、500エラーの場合はエラーをスロー
 * @param response - レスポンス
 * @throws 500エラーの場合
 */
export async function logNon200Response(response: Response): Promise<void> {
  // 200以外のレスポンスの場合はすべてconsole.errorを出力
  if (response.status !== 200) {
    let errorMessage = `${response.status}エラーが発生しました`;
    try {
      const errorData = await response.json();
      console.error(`${response.status}エラーの詳細:`, errorData);
      errorMessage = `${response.status}エラーが発生しました: ${errorData.error || "Unknown error"}`;
    } catch {
      const errorText = await response.text();
      console.error(`${response.status}エラーの詳細（テキスト）:`, errorText);
      errorMessage = `${response.status}エラーが発生しました: ${errorText}`;
    }

    // 500エラーの場合はエラーをスロー
    if (response.status === 500) {
      throw new Error(errorMessage);
    }
  } else {
    // 200の場合もクローンされたレスポンスのボディを完全に読み取って消費する
    await response.arrayBuffer();
  }
}

/**
 * 成功レスポンス（200 OK）を検証
 * @param response - レスポンス
 */
export function assertSuccessResponse(response: Response): void {
  assertEquals(response.status, 200);
  assertEquals(
    response.headers.get("content-type")?.includes("application/json"),
    true,
  );
}

/**
 * CORSヘッダーを検証
 * @param response - レスポンス
 */
export function assertCorsHeaders(response: Response): void {
  assertEquals(response.headers.get("Access-Control-Allow-Origin"), "*");
}

/**
 * レスポンス時間を計測してリクエストを実行
 * @param functionName - 関数名
 * @param method - HTTPメソッド
 * @param body - リクエストボディ（オプション）
 * @param headers - 追加ヘッダー（オプション）
 * @returns レスポンスとレスポンス時間
 */
export async function makeRequestWithTiming(
  functionName: string,
  method: string,
  body?: unknown,
  headers?: Record<string, string>,
): Promise<{ response: Response; responseTime: number }> {
  const startTime = Date.now();
  const response = await makeRequest(functionName, method, body, headers);
  const endTime = Date.now();
  const responseTime = endTime - startTime;

  return { response, responseTime };
}

/**
 * レスポンス時間が指定時間以内であることを検証
 * @param responseTime - レスポンス時間（ミリ秒）
 * @param maxTime - 最大許容時間（ミリ秒）
 */
export function assertResponseTime(
  responseTime: number,
  maxTime: number,
): void {
  assert(
    responseTime < maxTime,
    `Response time too slow: ${responseTime}ms (max: ${maxTime}ms)`,
  );
}

/**
 * エラーレスポンスを検証
 * @param response - レスポンス
 * @param expectedStatus - 期待されるステータスコード
 * @param expectedErrorMessage - 期待されるエラーメッセージ（オプション）
 */
export async function assertErrorResponse(
  response: Response,
  expectedStatus: number,
  expectedErrorMessage?: string,
): Promise<void> {
  assertEquals(response.status, expectedStatus);

  if (expectedErrorMessage) {
    const data = await response.json();
    assertEquals(data.error, expectedErrorMessage);
  }
}
