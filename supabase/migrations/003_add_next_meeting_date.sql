-- マイグレーション: 次回面談日カラムの追加
-- next_actionを次回面談日とアクション内容に分割

-- 次回面談日カラムを追加
ALTER TABLE members
ADD COLUMN next_meeting_date DATE;

-- コメント追加
COMMENT ON COLUMN members.next_meeting_date IS '次回面談予定日';
COMMENT ON COLUMN members.next_action IS '次のアクション内容';
