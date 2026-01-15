-- Add summary column to activity_logs table for AI-generated summaries
ALTER TABLE activity_logs
ADD COLUMN IF NOT EXISTS summary TEXT;

-- Add comment
COMMENT ON COLUMN activity_logs.summary IS 'AI生成の要約文';
COMMENT ON COLUMN activity_logs.content IS '元のテキスト全文';
