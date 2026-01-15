-- テスト用会員データの追加
-- このデータは統計・KPIから自動的に除外されます

INSERT INTO members (
  member_id,
  name,
  status,
  assigned_staff,
  enrollment_date,
  last_meeting_date,
  last_contact_date,
  next_meeting_date,
  next_meeting_status,
  next_action
) VALUES
  ('TEST001', 'テスト 太郎', 'お見合い', 'テスト', '2026-01-01', '2026-01-10', '2026-01-12', '2026-01-20', 'scheduled', 'テストアクション1'),
  ('TEST002', 'テスト 花子', '仮交際', 'テスト', '2026-01-02', '2026-01-11', '2026-01-13', NULL, 'unset', 'テストアクション2'),
  ('TEST003', 'テスト 次郎', '真剣交際', 'テスト', '2026-01-03', '2026-01-12', NULL, '2026-01-25', 'scheduled', 'テストアクション3'),
  ('TEST004', 'テスト 三郎', '公開前', 'テスト', '2026-01-04', NULL, NULL, NULL, 'unset', NULL),
  ('TEST005', 'テスト 四郎', '退会', 'テスト', '2025-12-01', '2025-12-15', '2025-12-20', NULL, 'unset', NULL)
ON CONFLICT (member_id) DO UPDATE SET
  name = EXCLUDED.name,
  status = EXCLUDED.status,
  assigned_staff = EXCLUDED.assigned_staff,
  enrollment_date = EXCLUDED.enrollment_date,
  last_meeting_date = EXCLUDED.last_meeting_date,
  last_contact_date = EXCLUDED.last_contact_date,
  next_meeting_date = EXCLUDED.next_meeting_date,
  next_meeting_status = EXCLUDED.next_meeting_status,
  next_action = EXCLUDED.next_action;

-- データ追加完了
-- 合計 5 件のテスト会員データを登録しました
