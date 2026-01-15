# スマート・アクティビティログ機能

## 🎯 概要

面談の書き起こしやLINE履歴を貼り付けるだけで、AIが自動的に：
- 📝 内容を要約
- 😊 感情分析（ポジティブ/中立/ネガティブ）
- 🎯 次のアクションを提案
- 📅 次回面談日を抽出（あれば）

そして、会員情報（次のアクション、次回面談日、最終面談日）を**自動更新**します！

---

## ✅ セットアップ手順

### 1. マイグレーションの実行

Supabaseダッシュボードで以下のマイグレーションを実行してください：

```sql
-- supabase/migrations/004_add_summary_to_activity_logs.sql
ALTER TABLE activity_logs
ADD COLUMN IF NOT EXISTS summary TEXT;

COMMENT ON COLUMN activity_logs.summary IS 'AI生成の要約文';
COMMENT ON COLUMN activity_logs.content IS '元のテキスト全文';
```

### 2. OpenAI APIキーの設定

`.env.local` ファイルに以下を追加してください：

```bash
# OpenAI (for AI Activity Analysis)
OPENAI_API_KEY=sk-your-actual-api-key-here
```

**OpenAI APIキーの取得方法:**
1. https://platform.openai.com/ にアクセス
2. アカウント作成/ログイン
3. API Keys → Create new secret key

**注意:** APIキーが未設定でも動作しますが、ダミーデータが使用されます。

### 3. 開発サーバーの再起動

```bash
npm run dev
```

---

## 🚀 使い方

### 基本的な流れ

1. **会員詳細ページを開く**
   - 一覧から会員をクリック

2. **「📝 入力」タブで内容を貼り付け**
   - 面談の書き起こし、LINEのやり取り、メモなど

3. **種類を選択**
   - 📅 面談
   - 💬 LINE
   - 📝 その他

4. **「✨ AI解析して保存」をクリック**
   - AIが数秒で解析
   - 左側の「次のアクション」「次回面談日」が自動更新！

5. **「📚 履歴」タブで確認**
   - 過去のログを時系列で表示
   - アコーディオンで全文を展開可能

---

## 📝 入力例

### 例1: 面談ログ

```
本日、田中さんと面談を実施。
お見合いで出会った佐藤さんとの進展について話し合った。
非常に前向きで、次回は来週火曜日（2026年1月21日）に設定。
次のステップとして、お相手のご両親への挨拶の準備を進める予定。
```

**AIが自動で:**
- 📝 要約: 「田中さんとの面談で、佐藤さんとの関係進展を確認。次回は1月21日に設定。」
- 😊 感情: ポジティブ
- 🎯 次のアクション: 「お相手のご両親への挨拶の準備を進める」
- 📅 次回面談日: 2026-01-21

### 例2: LINE履歴

```
[2026/01/15 14:30] 田中: こんにちは！先日のお見合いの件ですが...
[2026/01/15 14:32] カウンセラー: お疲れ様です。いかがでしたか？
[2026/01/15 14:35] 田中: 実は少し迷っています。もう一度考える時間が欲しいです。
[2026/01/15 14:40] カウンセラー: 承知しました。では来週改めてお話ししましょう。
```

**AIが自動で:**
- 📝 要約: 「お見合い後、田中さんが迷っており、再考の時間を希望。来週再度話し合い予定。」
- 😐 感情: 中立
- 🎯 次のアクション: 「来週、田中さんの気持ちを再確認する面談を設定」

---

## 🎨 UI機能

### タブ1: 📝 入力
- テキストエリア（大容量対応）
- 種類選択ドロップダウン
- AI解析ボタン（ローディング表示付き）
- ヒント: 「保存すると、左側の情報が自動更新されます」

### タブ2: 📚 履歴
- タイムライン形式で表示
- 各ログには：
  - 種類バッジ（📅面談 / 💬LINE / 📝その他）
  - 感情バッジ（色分け）
  - 日時
  - AI生成の要約
  - アコーディオンで全文展開

---

## 🔧 技術詳細

### 使用技術
- **AI SDK**: Vercel AI SDK (`generateObject`)
- **モデル**: OpenAI GPT-4o-mini
- **構造化出力**: Zod スキーマ
- **バックエンド**: Next.js Server Actions
- **UI**: shadcn/ui (Tabs, Accordion, Badge)

### Server Action: `analyzeAndSaveActivity`

```typescript
// lib/actions/activity.ts
export async function analyzeAndSaveActivity(
  memberId: string,
  text: string,
  type: string
): Promise<{ success: boolean; error?: string }>
```

**処理フロー:**
1. AI解析（`generateObject`）
2. `activity_logs` にログ保存
3. `members` テーブル更新:
   - `next_action` → AI提案
   - `next_meeting_date` → 抽出された日付（あれば）
   - `last_meeting_date` → 今日
4. ページ再検証（`revalidatePath`）

### データベーススキーマ

```sql
activity_logs:
  - id: uuid (PK)
  - member_id: uuid (FK)
  - type: text ('meeting', 'line', 'note')
  - content: text (元のテキスト全文)
  - summary: text (AI生成の要約) ★新規追加
  - sentiment: text ('positive', 'neutral', 'negative')
  - created_at: timestamptz
```

---

## 💡 活用のヒント

### 1. 面談後すぐに記録
- 記憶が新鮮なうちに書き起こしを貼り付け
- AIが要約してくれるので、長文でもOK

### 2. LINE履歴の一括保存
- 複数日のやり取りをまとめて貼り付け
- AIが重要な情報を抽出

### 3. 感情の変化を追跡
- タイムラインで感情バッジを確認
- ポジティブ/ネガティブの変化を可視化

### 4. 次のアクションの自動化
- AIの提案を確認して、必要なら手動で調整
- 左側のプロフィールカードに即座に反映

---

## ⚠️ 注意事項

- **API利用料金**: OpenAI APIは従量課金です。GPT-4o-miniは低コストですが、使用量にご注意ください。
- **個人情報**: 会員の個人情報がOpenAIに送信されます。利用規約を確認してください。
- **エラーハンドリング**: APIエラー時はアラートが表示されます。
- **ダミーモード**: APIキー未設定時は、ダミーデータでUIテストが可能です。

---

## 🎉 完成！

これで、面談ログやLINE履歴を貼り付けるだけで、魔法のように会員情報が更新される体験が実現しました！

**次のステップ:**
- より高度なAI分析（複数人の関係性分析など）
- 音声録音からの自動文字起こし
- チャット形式のAI対話機能

Happy Coding! 🚀
