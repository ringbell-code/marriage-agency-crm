-- ⚠️ このファイルは非推奨です（テスト用データ）
-- 本番データのインポートには 'import_production_data.sql' を使用してください
-- 詳細は PRODUCTION_DATA_IMPORT.md を参照

-- Sample data for members table
INSERT INTO members (member_id, name, status, assigned_staff, enrollment_date, last_meeting_date, next_meeting_date, next_action) VALUES
  ('M125654', '田中 太郎', '真剣交際', '高坂', '2025-06-15', '2026-01-10', '2026-01-20', '結婚の意思確認'),
  ('M125655', '佐藤 花子', '仮交際', '高坂', '2025-08-20', '2026-01-08', '2026-01-15', 'お見合い候補3名をリストアップ'),
  ('M125656', '鈴木 次郎', '成婚退会', '山田', '2024-12-01', '2025-12-28', NULL, 'なし（退会済み）'),
  ('M125657', '高橋 美咲', 'お見合い', '山田', '2025-11-10', '2025-12-20', '2026-01-25', 'プロフィール写真の更新'),
  ('M125658', '伊藤 健一', 'お見合い', '高坂', '2025-09-05', '2026-01-05', '2026-01-18', '初回お見合いのフィードバック確認');

-- Get member IDs for activity logs
DO $$
DECLARE
  tanaka_id UUID;
  sato_id UUID;
  suzuki_id UUID;
  takahashi_id UUID;
  ito_id UUID;
BEGIN
  SELECT id INTO tanaka_id FROM members WHERE member_id = 'M125654';
  SELECT id INTO sato_id FROM members WHERE member_id = 'M125655';
  SELECT id INTO suzuki_id FROM members WHERE member_id = 'M125656';
  SELECT id INTO takahashi_id FROM members WHERE member_id = 'M125657';
  SELECT id INTO ito_id FROM members WHERE member_id = 'M125658';

  -- Sample activity logs for 田中 太郎
  INSERT INTO activity_logs (member_id, type, content, sentiment, created_at) VALUES
    (tanaka_id, 'meeting', '面談実施。交際相手との関係が順調に進んでいる様子。結婚の意思も固まりつつあるとのこと。', 'positive', NOW() - INTERVAL '5 days'),
    (tanaka_id, 'line', 'お相手とのデートプラン相談。次回は両親への挨拶を検討中。', 'positive', NOW() - INTERVAL '3 days'),
    (tanaka_id, 'note', '次回面談で結婚の意思確認を行う予定。スケジュール調整中。', 'neutral', NOW() - INTERVAL '1 day');

  -- Sample activity logs for 佐藤 花子
  INSERT INTO activity_logs (member_id, type, content, sentiment, created_at) VALUES
    (sato_id, 'meeting', '仮交際に進んだ報告。お相手との相性は良いが、まだ不安もある様子。', 'neutral', NOW() - INTERVAL '7 days'),
    (sato_id, 'line', '新しいお見合い候補について質問あり。3名ほどリストアップして提案予定。', 'neutral', NOW() - INTERVAL '2 days');

  -- Sample activity logs for 鈴木 次郎
  INSERT INTO activity_logs (member_id, type, content, sentiment, created_at) VALUES
    (suzuki_id, 'meeting', '成婚退会手続き完了。お相手と結婚が決まり、非常に満足されている様子。', 'positive', NOW() - INTERVAL '18 days'),
    (suzuki_id, 'note', '退会手続き完了。今後のフォローアップは不要。', 'positive', NOW() - INTERVAL '18 days');

  -- Sample activity logs for 高橋 美咲
  INSERT INTO activity_logs (member_id, type, content, sentiment, created_at) VALUES
    (takahashi_id, 'meeting', '初回面談実施。プロフィール作成と写真撮影のアドバイスを実施。', 'neutral', NOW() - INTERVAL '26 days'),
    (takahashi_id, 'line', 'プロフィール写真の更新について相談。プロカメラマンの紹介を提案。', 'neutral', NOW() - INTERVAL '10 days');

  -- Sample activity logs for 伊藤 健一
  INSERT INTO activity_logs (member_id, type, content, sentiment, created_at) VALUES
    (ito_id, 'meeting', '最近の面談で初回お見合いのフィードバックを確認。お相手とは合わなかったとのこと。', 'negative', NOW() - INTERVAL '10 days'),
    (ito_id, 'line', '次のお見合い候補について相談。理想の条件を再確認。', 'neutral', NOW() - INTERVAL '5 days'),
    (ito_id, 'note', '次回は条件を緩めた候補も提案する予定。', 'neutral', NOW() - INTERVAL '3 days');
END $$;
