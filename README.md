# Marriage Agency CRM

結婚相談所向けの次世代CRM（顧客管理システム）

スプレッドシート管理から脱却し、AIを活用した「会員対応のハイクオリティ化」を実現する管理画面です。

## ✨ 主な機能

### Phase 1（実装済み）
- ✅ **会員管理（CRUD）**: 会員情報の一覧表示と詳細管理
- ✅ **詳細ページ**: 会員ごとのプロフィール、ステータス変更、次のアクション管理
- ✅ **アクティビティログ**: タイムライン形式で面談履歴、LINE対応、メモを表示
- ✅ **モダンUI**: Linearのようなプロフェッショナルで高密度なデザイン
- ✅ **サイドバーナビゲーション**: 直感的な操作性

### Phase 2（今後実装予定）
- ⏳ **AI壁打ちチャット**: Vercel AI SDKを使用したLINE返信案の作成
- ⏳ **面談スケジュール管理**: カレンダー連携
- ⏳ **分析レポート**: 成約率、活動状況の可視化
- ⏳ **メッセージ機能**: 会員とのコミュニケーション履歴

## 🚀 技術スタック

- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **UI Components**: shadcn/ui
- **Icons**: Lucide React
- **Backend/DB**: Supabase (PostgreSQL, Auth)
- **Deployment**: Vercel

## 📦 セットアップ手順

### 1. リポジトリのクローン（既に作成済みの場合はスキップ）

```bash
cd /Users/01050933/Cursor/marriage-agency-crm
```

### 2. 依存関係のインストール

すでにインストール済みです。必要に応じて以下のコマンドで再インストール可能です：

```bash
npm install
```

### 3. Supabaseプロジェクトのセットアップ

#### 3.1 Supabaseアカウントの作成
1. [Supabase](https://supabase.com)にアクセス
2. 新しいプロジェクトを作成
3. プロジェクト名とデータベースパスワードを設定

#### 3.2 環境変数の設定
`.env.local`ファイルを編集して、SupabaseのURLとKEYを設定：

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

SupabaseのダッシュボードのSettings > API から取得できます。

#### 3.3 データベースのマイグレーション
Supabaseダッシュボードで SQL Editor を開き、以下のファイルを順番に実行：

1. `supabase/migrations/001_create_members_table.sql`
2. `supabase/migrations/002_create_activity_logs_table.sql`
3. `supabase/seed.sql`（サンプルデータ）

#### 3.4 RLS（Row Level Security）の無効化（開発環境のみ）
開発環境では、SQL Editorで以下を実行してRLSを無効化：

```sql
ALTER TABLE members DISABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs DISABLE ROW LEVEL SECURITY;
```

⚠️ **本番環境では適切なRLSポリシーを設定してください**

### 4. 開発サーバーの起動

```bash
npm run dev
```

ブラウザで [http://localhost:3000](http://localhost:3000) を開きます。

## 📁 プロジェクト構成

```
marriage-agency-crm/
├── app/
│   ├── layout.tsx          # ルートレイアウト（サイドバー＋ヘッダー）
│   ├── page.tsx            # 会員一覧ページ
│   ├── globals.css         # グローバルスタイル
│   └── members/
│       └── [id]/
│           └── page.tsx    # 会員詳細ページ
├── components/
│   ├── ui/                 # shadcn/uiコンポーネント
│   ├── app-sidebar.tsx     # サイドバーコンポーネント
│   ├── app-header.tsx      # ヘッダーコンポーネント
│   ├── status-badge.tsx    # ステータスバッジ
│   ├── activity-timeline.tsx    # アクティビティタイムライン
│   └── member-profile-card.tsx  # 会員プロフィールカード
├── lib/
│   ├── supabase.ts         # Supabaseクライアント設定
│   ├── utils.ts            # ユーティリティ関数
│   └── actions/
│       ├── members.ts      # 会員関連のServer Actions
│       └── activity-logs.ts # アクティビティログのServer Actions
├── supabase/
│   ├── migrations/         # データベースマイグレーション
│   ├── seed.sql           # サンプルデータ
│   └── README.md          # Supabaseセットアップガイド
└── .env.local             # 環境変数（要設定）
```

## 🎨 デザインガイドライン

- **配色**: 白ベースで清潔感があり、アクセントカラーに信頼感のある「ネイビー/ブルー」を使用
- **スタイル**: Linearのようなプロフェッショナルで高密度なUI
- **レスポンシブ**: モバイル、タブレット、デスクトップに対応

## 🗄️ データベーススキーマ

### `members` テーブル
会員の基本情報を管理

| カラム名 | 型 | 説明 |
|---------|-----|------|
| id | UUID | プライマリキー |
| member_id | VARCHAR | 会員ID (例: M125654) |
| name | VARCHAR | 氏名 |
| status | VARCHAR | ステータス |
| assigned_staff | VARCHAR | 担当者 |
| enrollment_date | DATE | 入会日 |
| last_meeting_date | DATE | 最終面談日 |
| next_action | TEXT | 次のアクション |
| created_at | TIMESTAMP | 作成日時 |
| updated_at | TIMESTAMP | 更新日時 |

### `activity_logs` テーブル
会員ごとの活動ログを管理

| カラム名 | 型 | 説明 |
|---------|-----|------|
| id | UUID | プライマリキー |
| member_id | UUID | 会員ID（外部キー） |
| type | VARCHAR | ログタイプ（meeting/line/note） |
| content | TEXT | 内容 |
| sentiment | VARCHAR | センチメント |
| created_at | TIMESTAMP | 作成日時 |

## 🔧 開発コマンド

```bash
# 開発サーバーの起動
npm run dev

# プロダクションビルド
npm run build

# プロダクションサーバーの起動
npm start

# リンター実行
npm run lint
```

## 📝 使い方

### 会員一覧ページ
- トップページ（`/`）で全会員の一覧を確認
- ステータス別に色分けされたバッジで視認性が高い
- 会員名をクリックして詳細ページへ遷移

### 会員詳細ページ
- 左カラム：会員の基本情報とステータス変更
- 右カラム：アクティビティログのタイムライン表示
- 次のアクションを編集・更新可能

## 🚢 デプロイ

### Vercelへのデプロイ

1. [Vercel](https://vercel.com)にログイン
2. プロジェクトをインポート
3. 環境変数を設定：
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. デプロイ

## 📄 ライセンス

MIT

## 👥 作成者

AI × Human Collaboration
