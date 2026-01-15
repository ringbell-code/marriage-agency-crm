#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
生成されたSQLデータの統計分析スクリプト
"""

import re
from collections import Counter
from pathlib import Path

def analyze_sql_data(sql_file: str):
    """SQLファイルからデータを抽出して統計分析"""
    
    with open(sql_file, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # VALUES句からデータ行を抽出
    values_pattern = r"\('([^']+)', '([^']+)', '([^']+)', '([^']+)',"
    matches = re.findall(values_pattern, content)
    
    if not matches:
        print("データが見つかりませんでした")
        return
    
    total = len(matches)
    statuses = Counter()
    staff = Counter()
    
    for match in matches:
        member_id, name, status, assigned_staff = match
        statuses[status] += 1
        staff[assigned_staff] += 1
    
    print("=" * 70)
    print("📊 本番データ統計レポート")
    print("=" * 70)
    print(f"\n✅ 総会員数: {total} 名\n")
    
    print("📈 ステータス別集計")
    print("-" * 50)
    for status, count in statuses.most_common():
        percentage = (count / total) * 100
        bar = "█" * int(percentage / 2)
        print(f"  {status:12s} : {count:3d} 名 ({percentage:5.1f}%) {bar}")
    
    print("\n👥 担当者別集計")
    print("-" * 50)
    for person, count in staff.most_common():
        percentage = (count / total) * 100
        bar = "█" * int(percentage / 2)
        print(f"  {person:12s} : {count:3d} 名 ({percentage:5.1f}%) {bar}")
    
    print("\n" + "=" * 70)
    print("✨ データインポートの準備が完了しました！")
    print("=" * 70)
    
    # 次のステップ
    print("\n📝 次のステップ:")
    print("  1. Supabaseにログイン")
    print("  2. SQL Editorを開く")
    print("  3. 'supabase/import_production_data.sql' の内容を貼り付け")
    print("  4. 'Run' をクリックしてインポート実行")
    print("  5. アプリケーションで確認 (npm run dev)")
    print()

if __name__ == '__main__':
    script_dir = Path(__file__).parent
    project_root = script_dir.parent
    sql_file = project_root / 'supabase' / 'import_production_data.sql'
    
    analyze_sql_data(str(sql_file))
