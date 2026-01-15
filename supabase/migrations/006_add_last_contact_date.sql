-- 最終打診日カラムを追加
ALTER TABLE members ADD COLUMN IF NOT EXISTS last_contact_date DATE;

COMMENT ON COLUMN members.last_contact_date IS '最終打診日（面談の打診をした日）';
