# Supabase セットアップガイド

## 初期設定手順

### 1. Supabaseプロジェクトの作成
1. [Supabase](https://supabase.com)にアクセスし、新しいプロジェクトを作成
2. プロジェクト名とデータベースパスワードを設定
3. プロジェクトのURLとANON KEYをコピー

### 2. 環境変数の設定
`.env.local`ファイルに以下を設定：

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. マイグレーションの実行
Supabaseのダッシュボードで、SQL Editorを開いて以下のファイルを順番に実行：

1. `migrations/001_create_members_table.sql`
2. `migrations/002_create_activity_logs_table.sql`
3. `seed.sql` (サンプルデータ投入)

### 4. RLS（Row Level Security）の設定
本番環境では、適切なRLSポリシーを設定してください。

開発環境では、一時的にRLSを無効化することも可能です：
```sql
ALTER TABLE members DISABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs DISABLE ROW LEVEL SECURITY;
```

## テーブル構成

### members テーブル
会員の基本情報を管理

| カラム名 | 型 | 説明 |
|---------|-----|------|
| id | UUID | プライマリキー |
| member_id | VARCHAR | 会員ID (例: M125654) |
| name | VARCHAR | 氏名 |
| status | VARCHAR | ステータス (例: 成婚退会, 真剣交際, 仮交際) |
| assigned_staff | VARCHAR | 担当者 |
| enrollment_date | DATE | 入会日 |
| last_meeting_date | DATE | 最終面談日 |
| next_action | TEXT | 次のアクション |
| created_at | TIMESTAMP | 作成日時 |
| updated_at | TIMESTAMP | 更新日時 |

### activity_logs テーブル
会員ごとの活動ログを管理

| カラム名 | 型 | 説明 |
|---------|-----|------|
| id | UUID | プライマリキー |
| member_id | UUID | 会員ID (外部キー) |
| type | VARCHAR | ログタイプ (meeting, line, note) |
| content | TEXT | 内容 |
| sentiment | VARCHAR | センチメント (positive, negative, neutral) |
| created_at | TIMESTAMP | 作成日時 |
