#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
CSVファイルから本番用SQLを生成するスクリプト
"""

import csv
import os
import re
from datetime import datetime
from pathlib import Path

def normalize_status(status: str) -> str:
    """ステータスを正規化"""
    if not status or status.strip() == '':
        return '公開前'
    
    status = status.strip()
    
    # マッピング
    status_map = {
        '休会/退会': '退会',
        '成婚退会': '成婚退会',
        '仮交際': '仮交際',
        'お見合い': 'お見合い',
        '真剣交際': '真剣交際',
        '公開前': '公開前',
        '休会': '休会',
        '退会': '退会',
    }
    
    return status_map.get(status, '公開前')

def parse_date(date_str: str, current_year: int = 2026, current_month: int = 1) -> str | None:
    """日付文字列をパースしてYYYY-MM-DD形式に変換
    
    基準日: 2026年1月15日
    ロジック:
    - 年付き日付（2025/11/10）はそのまま使用
    - 年なし日付（12/18、1/5など）は以下のルールで判定:
      - 現在月(1月)より後の月(2-12月) → 将来なら2026年、過去(7-12月)なら2025年
      - 現在月(1月)以前の月(1月) → 2026年
    """
    if not date_str or date_str.strip() == '':
        return None
    
    date_str = date_str.strip()
    
    # 特殊なケースを除外
    special_cases = ['未定', '公開後', 'シフト出てから', '月末に調整', '確認中', '活動延期', '予定']
    for case in special_cases:
        if case in date_str:
            return None
    
    # パターン1: 2025/11/10 (年付き)
    match = re.match(r'(\d{4})/(\d{1,2})/(\d{1,2})', date_str)
    if match:
        year, month, day = match.groups()
        return f"{year}-{month.zfill(2)}-{day.zfill(2)}"
    
    # パターン2: 12/18 または 1/5 (年なし)
    match = re.match(r'(\d{1,2})/(\d{1,2})', date_str)
    if match:
        month, day = match.groups()
        month_int = int(month)
        
        # 1-6月 → 2026年（将来の日付）
        # 7-12月 → 2025年（過去の日付）
        if month_int <= 6:
            year = 2026
        else:
            year = 2025
        
        return f"{year}-{month.zfill(2)}-{day.zfill(2)}"
    
    return None

def escape_sql_string(s: str) -> str:
    """SQL文字列をエスケープ"""
    if s is None:
        return 'NULL'
    return "'" + s.replace("'", "''") + "'"

def process_csv_files(data_dir: str) -> list[dict]:
    """全CSVファイルを処理"""
    members = []
    
    csv_files = list(Path(data_dir).glob('*.csv'))
    print(f"Found {len(csv_files)} CSV files")
    
    for csv_file in csv_files:
        print(f"Processing: {csv_file.name}")
        
        with open(csv_file, 'r', encoding='utf-8') as f:
            # CSVを読み込み（最初の2行はヘッダー）
            lines = f.readlines()
            
            # 3行目以降がデータ
            for i, line in enumerate(lines[2:], start=3):
                # カンマで分割
                fields = line.strip().split(',')
                
                if len(fields) < 14:
                    continue
                
                # フィールド抽出
                priority = fields[0].strip()
                member_id = fields[1].strip()
                name = fields[2].strip()
                enrollment_date_str = fields[3].strip()
                days_since = fields[4].strip()
                assigned_staff = fields[5].strip()
                status = fields[6].strip()
                next_meeting_date_str = fields[7].strip()
                last_meeting_date_str = fields[8].strip()
                last_contact_date_str = fields[9].strip()
                
                # 次のアクション（最後のフィールド、複数カンマで結合されている可能性）
                next_action = ','.join(fields[14:]).strip() if len(fields) > 14 else fields[13].strip() if len(fields) > 13 else ''
                
                # スキップ条件
                if not member_id:
                    continue
                if member_id.startswith('▽'):
                    continue
                if member_id == 'id':  # ヘッダー行をスキップ
                    continue
                if not name or name == 'name':  # ヘッダー行または空白をスキップ
                    continue
                if priority == '●':
                    # 優先マーカーは無視
                    pass
                
                # データ変換
                member_data = {
                    'member_id': member_id,
                    'name': name,
                    'status': normalize_status(status),
                    'assigned_staff': assigned_staff if assigned_staff else '未割当',
                    'enrollment_date': parse_date(enrollment_date_str) or '2025-01-01',
                    'last_meeting_date': parse_date(last_meeting_date_str),
                    'last_contact_date': parse_date(last_contact_date_str),
                    'next_meeting_date': parse_date(next_meeting_date_str),
                    'next_action': next_action if next_action else None,
                }
                
                # 重複チェック
                if not any(m['member_id'] == member_id for m in members):
                    members.append(member_data)
                    print(f"  Added: {member_id} - {name}")
    
    return members

def generate_sql(members: list[dict], output_file: str):
    """SQLファイルを生成"""
    with open(output_file, 'w', encoding='utf-8') as f:
        f.write("-- 本番データインポート用SQL\n")
        f.write("-- 生成日時: " + datetime.now().strftime("%Y-%m-%d %H:%M:%S") + "\n\n")
        
        f.write("-- 既存のテストデータを削除\n")
        f.write("TRUNCATE TABLE activity_logs CASCADE;\n")
        f.write("TRUNCATE TABLE members CASCADE;\n\n")
        
        f.write("-- 本番データを挿入\n")
        f.write("INSERT INTO members (\n")
        f.write("  member_id,\n")
        f.write("  name,\n")
        f.write("  status,\n")
        f.write("  assigned_staff,\n")
        f.write("  enrollment_date,\n")
        f.write("  last_meeting_date,\n")
        f.write("  last_contact_date,\n")
        f.write("  next_meeting_date,\n")
        f.write("  next_meeting_status,\n")
        f.write("  next_action\n")
        f.write(") VALUES\n")
        
        for i, member in enumerate(members):
            # next_meeting_statusを決定
            if member['next_meeting_date']:
                next_meeting_status = 'scheduled'
            else:
                next_meeting_status = 'unset'
            
            values = [
                escape_sql_string(member['member_id']),
                escape_sql_string(member['name']),
                escape_sql_string(member['status']),
                escape_sql_string(member['assigned_staff']),
                escape_sql_string(member['enrollment_date']),
                escape_sql_string(member['last_meeting_date']),
                escape_sql_string(member['last_contact_date']),
                escape_sql_string(member['next_meeting_date']),
                escape_sql_string(next_meeting_status),
                escape_sql_string(member['next_action'])
            ]
            
            line = f"  ({', '.join(values)})"
            if i < len(members) - 1:
                line += ","
            else:
                line += ";"
            
            f.write(line + "\n")
        
        f.write("\n-- データインポート完了\n")
        f.write(f"-- 合計 {len(members)} 件の会員データを登録しました\n")

if __name__ == '__main__':
    # パス設定
    script_dir = Path(__file__).parent
    project_root = script_dir.parent
    data_dir = project_root / 'supabase' / 'data'
    output_file = project_root / 'supabase' / 'import_production_data.sql'
    
    print("=" * 60)
    print("CSVからSQLへの変換を開始")
    print("=" * 60)
    
    # CSVファイルを処理
    members = process_csv_files(str(data_dir))
    
    print(f"\n合計 {len(members)} 件の会員データを抽出しました")
    
    # SQLファイルを生成
    generate_sql(members, str(output_file))
    
    print(f"\nSQLファイルを生成しました: {output_file}")
    print("=" * 60)
