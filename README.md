# Carpe Diem 管理者用Webアプリ

Carpe Diem プロジェクトの管理者向け Web アプリケーションです。

## 技術スタック

- **フレームワーク**: Next.js 15 (App Router)
- **UI**: React 19, TypeScript
- **スタイリング**: Tailwind CSS 4
- **コンポーネント**: shadcn/ui (Radix UI)
- **バックエンド**: Supabase (@supabase/ssr, @supabase/supabase-js)
- **バリデーション**: Zod
- **リンター / フォーマッター**: Biome
- **テスト**: Playwright (E2E), Deno (Edge Functions統合テスト)

## プロジェクト構成

```
admin_web/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (admin)/           # 管理画面ページ
│   │   │   ├── announcements/         # お知らせ管理
│   │   │   ├── announcements-create/  # お知らせ作成・編集
│   │   │   ├── approvals/             # アカウント承認
│   │   │   ├── students/              # 学生管理
│   │   │   ├── surveys/               # アンケート一覧
│   │   │   ├── survey-results/        # アンケート結果
│   │   │   ├── new-survey/            # アンケート作成
│   │   │   └── components/            # 管理画面共通コンポーネント
│   │   ├── (auth)/            # 認証関連ページ
│   │   │   └── login/
│   │   ├── layout.tsx
│   │   └── globals.css
│   ├── components/            # UIコンポーネント
│   │   └── ui/               # shadcn/ui コンポーネント
│   ├── services/             # サービス層
│   │   └── supabase/        # Supabase クライアント
│   ├── hooks/               # カスタムフック
│   ├── types/               # 型定義
│   │   └── database.types.ts # Supabase型定義（自動生成）
│   ├── utils/               # ユーティリティ関数
│   └── middleware.ts        # Next.js ミドルウェア（認証）
├── tests/
│   ├── e2e/                 # E2Eテスト（Playwright）
│   └── functions/           # Edge Functionsテスト（Deno）
├── public/                  # 静的ファイル
├── package.json
├── tsconfig.json
├── biome.json
├── next.config.ts
└── postcss.config.mjs
```

## セットアップ

### 前提条件

以下のツールがインストールされていることを確認してください：

- **Node.js**: v18.x 以上
- **npm**: v9.x 以上
- **Docker**: Supabase ローカル環境に必要
- **Supabase CLI**: [インストール手順](https://supabase.com/docs/guides/cli)
- **Deno**: Edge Functionsテスト用

### 手順

```bash
# 1. 依存関係をインストール
cd admin_web
npm install

# 2. Supabaseローカル環境を起動（プロジェクトルートで実行）
cd ..
supabase start

# 3. データベースをリセット（シードデータ投入）
supabase db reset

# 4. 環境変数を設定
cd admin_web
cp .env.local.example .env.local
# .env.local を編集して環境変数を設定
# supabase status で接続情報を確認できます

# 5. 開発サーバーを起動
npm run dev
```

ブラウザで http://localhost:3000 にアクセスしてください。

### 環境変数

`.env.local` ファイルに以下の環境変数を設定してください：

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=<supabase status で取得>

# Amazon Gift Card API (server-side only)
AMAZON_ENDPOINT=https://agcod-v2-fe-gamma.amazon.com
AMAZON_REGION=us-west-2
AMAZON_ACCESS_KEY=
AMAZON_SECRET_KEY=
AMAZON_PARTNER_ID=

# Cron
CRON_KEY=<任意の値>
```

テンプレートは `.env.local.example` を参照してください。

### マルチ環境

dev / uat / prd の各環境は Supabase・Firebase それぞれ別プロジェクトです。
ローカル開発時は `.env.local` の値を接続先に合わせて書き換えてください。
デプロイ時は Vercel 等のホスティングプラットフォームで環境変数を設定します。

## 開発

### コマンド

```bash
# 開発サーバー起動
npm run dev

# ビルド
npm run build

# 本番環境で起動
npm start

# リンター実行
npm run lint

# Biomeフォーマット
npm run format
```

### Supabase コマンド

```bash
# Supabase起動（プロジェクトルートで実行）
supabase start

# Supabase停止
supabase stop

# データベースリセット
supabase db reset

# 型定義生成（admin_web用）
npx --yes supabase gen types typescript --schema public --local > src/types/database.types.ts

# 型定義生成（Edge Functions用）
npx --yes supabase gen types typescript --schema public --local > ../supabase/functions/_shared/database.types.ts

# マイグレーション作成
supabase migration new [マイグレーション名]

# Edge Function作成
supabase functions new [function-name]

# Edge Functionローカル実行
supabase functions serve [function-name]
```

## テスト

### E2Eテスト（Playwright）

```bash
# すべてのE2Eテストを実行
npm run test:e2e

# UIモードでテストを実行（デバッグに便利）
npm run test:e2e:ui

# ブラウザを表示してテストを実行
npm run test:e2e:headed

# デバッグモードで実行
npm run test:e2e:debug

# テスト結果のHTMLレポートを表示
npm run test:e2e:report
```

### Edge Functionsテスト（Deno）

```bash
# Edge Functionsテストを実行
npm run test:functions
```

詳細は [tests/README.md](tests/README.md) を参照してください。

## ドキュメント

### プロジェクトドキュメント

- [プロジェクト概要](../sysdoc_starter/00-brief/01_プロジェクト概要.md)
- [技術スタック選定](../sysdoc_starter/20-architecture/01_技術スタック選定.md)
- [アーキテクチャ概要](../sysdoc_starter/20-architecture/02_アーキテクチャ概要.md)
- [Supabase実装ガイド](../sysdoc_starter/35-development/03_Supabase実装ガイド_Web.md)
- [コーディング規約](../sysdoc_starter/35-development/04_コーディング規約_Web.md)

## 参考リンク

- [Next.js ドキュメント](https://nextjs.org/docs)
- [Supabase ドキュメント](https://supabase.com/docs)
- [shadcn/ui ドキュメント](https://ui.shadcn.com/)
- [Tailwind CSS ドキュメント](https://tailwindcss.com/docs)
- [Biome ドキュメント](https://biomejs.dev/)
