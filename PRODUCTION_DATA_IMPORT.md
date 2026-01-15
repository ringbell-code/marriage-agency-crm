# 本番データインポート手順

## 概要

このドキュメントは、CSVファイルから本番データをSupabaseにインポートする手順を説明します。

## 🎯 準備したファイル

### 1. CSVデータ（11ファイル）
- 場所: `/supabase/data/`
- 各担当者ごとのモニタリングシート（三吉、仲田、佐久間、前田、勝屋、岡藤、水谷、永尾、西村、長畑、高坂）

### 2. 変換スクリプト
- ファイル: `/scripts/convert_csv_to_sql.py`
- 機能: CSVファイルを解析し、本番用SQLファイルを生成

### 3. 生成されたSQLファイル
- ファイル: `/supabase/import_production_data.sql`
- データ件数: **272件**

## 📊 データ変換の詳細

### ステータス正規化

| CSV値 | DB値 |
|-------|------|
| 休会/退会 | 退会 |
| お見合い | お見合い |
| 仮交際 | 仮交際 |
| 真剣交際 | 真剣交際 |
| 成婚退会 | 成婚退会 |
| 公開前 | 公開前 |
| 休会 | 休会 |
| 退会 | 退会 |

### 日付パース

**基準日: 2026年1月15日**

| CSV形式 | DB形式 | ルール |
|---------|--------|--------|
| 2025/11/10 | 2025-11-10 | 年付き日付はそのまま |
| 12/18 | 2025-12-18 | 7-12月 → 2025年 |
| 1/5 | 2026-01-05 | 1-6月 → 2026年 |

**除外される日付表現:**
- "未定"
- "公開後"
- "シフト出てから"
- "月末に調整"
- "確認中"
- "活動延期"
- "予定"（例: "1/10予定"）

### next_meeting_status

- `next_meeting_date`が設定されている → `'scheduled'`
- `next_meeting_date`が`NULL` → `'unset'`

## 🚀 インポート手順

### ステップ1: マイグレーションの実行

まず、最新のマイグレーションが適用されていることを確認します。

```bash
# Supabase CLIでマイグレーションを確認
supabase migration list

# 未適用のマイグレーションがあれば実行
supabase db push
```

**必要なマイグレーション:**
1. `001_create_members_table.sql` - membersテーブル作成
2. `002_create_activity_logs_table.sql` - activity_logsテーブル作成
3. `003_add_next_meeting_date.sql` - next_meeting_dateカラム追加
4. `004_add_summary_to_activity_logs.sql` - summaryカラム追加
5. `005_add_next_meeting_status.sql` - next_meeting_statusカラム追加
6. `006_add_last_contact_date.sql` - last_contact_dateカラム追加

### ステップ2: データのバックアップ（オプション）

既存のテストデータをバックアップしたい場合:

```sql
-- 既存データをエクスポート（Supabase Dashboard > SQL Editor）
COPY (SELECT * FROM members) TO '/tmp/members_backup.csv' WITH CSV HEADER;
COPY (SELECT * FROM activity_logs) TO '/tmp/activity_logs_backup.csv' WITH CSV HEADER;
```

### ステップ3: 本番データのインポート

**⚠️ 警告: この操作は既存のデータを削除します！**

```bash
# Supabase Dashboard > SQL Editor で以下を実行
# または、ローカルから実行する場合:

supabase db execute < supabase/import_production_data.sql
```

**または、Supabase Dashboardから:**

1. Supabaseプロジェクトにログイン
2. 左メニューから「SQL Editor」を選択
3. `/supabase/import_production_data.sql`の内容をコピー＆ペースト
4. 「Run」ボタンをクリック

### ステップ4: データの確認

インポートが成功したか確認します:

```sql
-- 会員数の確認
SELECT COUNT(*) as total_members FROM members;
-- 結果: 272

-- ステータス別の集計
SELECT status, COUNT(*) as count 
FROM members 
GROUP BY status 
ORDER BY count DESC;

-- 担当者別の集計
SELECT assigned_staff, COUNT(*) as count 
FROM members 
GROUP BY assigned_staff 
ORDER BY count DESC;

-- 次回面談日が設定されている会員
SELECT COUNT(*) 
FROM members 
WHERE next_meeting_status = 'scheduled';

-- 面談未設定の会員（活動中のみ）
SELECT COUNT(*) 
FROM members 
WHERE next_meeting_status = 'unset' 
AND status NOT IN ('公開前', '退会', '休会', '成婚退会');
```

## 🔄 CSVデータの再変換

CSVファイルを更新して再度SQLを生成したい場合:

```bash
# プロジェクトルートで実行
python3 scripts/convert_csv_to_sql.py

# 新しいSQLファイルが生成されます
# supabase/import_production_data.sql
```

## 📝 注意事項

1. **既存データの削除**: `TRUNCATE TABLE`により、既存のテストデータは**完全に削除**されます
2. **CASCADE**: activity_logsテーブルも同時に削除されます（外部キー制約のため）
3. **ID自動生成**: `member_id`はCSVから読み込まれますが、DBの`id`（UUID）は自動生成されます
4. **デフォルト値**: 
   - `assigned_staff`が空白 → `'未割当'`
   - `enrollment_date`が空白 → `'2025-01-01'`
5. **重複チェック**: 同じ`member_id`が複数のCSVに存在する場合、最初のものだけが保持されます

## 🐛 トラブルシューティング

### エラー: "column does not exist"

→ マイグレーションが適用されていない可能性があります。ステップ1を再確認してください。

### エラー: "invalid input syntax for type date"

→ 日付フォーマットの問題です。`convert_csv_to_sql.py`の`parse_date`関数を確認してください。

### データが期待と異なる

→ CSVファイルの形式を確認してください。ヘッダー行は2行目、データは3行目から開始される想定です。

## 📊 期待される結果

インポート後のダッシュボードには以下が表示されます:

- **総会員数**: 272名
- **ステータス分布**: 仮交際、お見合い、公開前、退会など
- **面談未設定の会員**: 活動中で次回面談が未設定の会員
- **30日以上連絡なし**: 最終面談日・打診日から30日以上経過している会員
- **今週の面談予定**: 次回面談日が今週の会員

## ✅ 完了

本番データのインポートが完了しました！

アプリケーションを起動して、ダッシュボードと会員一覧を確認してください:

```bash
npm run dev
```

ブラウザで `http://localhost:3000` を開き、データが正しく表示されることを確認してください。
