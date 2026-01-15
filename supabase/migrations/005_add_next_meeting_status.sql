-- 次回面談日のステータスを管理するカラムを追加
CREATE TYPE next_meeting_status AS ENUM ('scheduled', 'withdrawal', 'not_needed', 'unset');

ALTER TABLE members ADD COLUMN next_meeting_status next_meeting_status DEFAULT 'unset';

COMMENT ON COLUMN members.next_meeting_status IS '次回面談日のステータス: scheduled=日付指定, withdrawal=退会予定, not_needed=面談不要, unset=未設定';

-- 既存データの移行: next_meeting_dateがある場合はscheduledに設定
UPDATE members SET next_meeting_status = 'scheduled' WHERE next_meeting_date IS NOT NULL;
