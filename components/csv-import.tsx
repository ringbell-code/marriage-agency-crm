"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Upload, FileText, CheckCircle2, AlertCircle } from "lucide-react"
import Papa from "papaparse"
import { supabase } from "@/lib/supabase"

interface CSVRow {
  id: string
  name: string
  "公開日": string
  担当: string
  ステータス: string
  次回面談日: string
  最終面談日: string
  [key: string]: string
}

export function CSVImport() {
  const [isUploading, setIsUploading] = useState(false)
  const [result, setResult] = useState<{ success: number; errors: string[] } | null>(null)

  const parseDate = (dateStr: string): string | null => {
    if (!dateStr || dateStr === "-" || dateStr === "") return null
    
    // "2025/08/30" 形式
    if (dateStr.match(/^\d{4}\/\d{1,2}\/\d{1,2}$/)) {
      return dateStr.replace(/\//g, "-")
    }
    
    // "1/16予定" などの形式は現在の年を使用
    const match = dateStr.match(/^(\d{1,2})\/(\d{1,2})/)
    if (match) {
      const month = match[1].padStart(2, "0")
      const day = match[2].padStart(2, "0")
      const year = new Date().getFullYear()
      return `${year}-${month}-${day}`
    }
    
    return null
  }

  const mapStatus = (status: string): string => {
    const statusMap: Record<string, string> = {
      "成婚退会": "成婚退会",
      "真剣交際": "真剣交際",
      "仮交際": "仮交際",
      "お見合い": "活動中",
      "公開前": "活動中",
    }
    return statusMap[status] || "活動中"
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    setResult(null)

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        const errors: string[] = []
        let successCount = 0

        const data = results.data as CSVRow[]

        for (const row of data) {
          try {
            // 空行やヘッダー行をスキップ
            if (!row.id || !row.name || row.id === "id") continue

            const memberId = row.id.trim()
            const name = row.name.trim()
            const assignedStaff = row["担当"]?.trim() || "未設定"
            const status = mapStatus(row["ステータス"]?.trim() || "")
            const enrollmentDate = parseDate(row["公開日"]) || new Date().toISOString().split("T")[0]
            const lastMeetingDate = parseDate(row["最終面談日"])
            const nextMeetingDate = row["次回面談日"]?.trim() || ""
            
            const nextAction = nextMeetingDate || "-"

            // 既存データをチェック
            const { data: existing } = await supabase
              .from("members")
              .select("id")
              .eq("member_id", memberId)
              .single()

            if (existing) {
              // 更新
              const { error } = await supabase
                .from("members")
                .update({
                  name,
                  status,
                  assigned_staff: assignedStaff,
                  enrollment_date: enrollmentDate,
                  last_meeting_date: lastMeetingDate,
                  next_action: nextAction,
                  updated_at: new Date().toISOString(),
                })
                .eq("member_id", memberId)

              if (error) {
                errors.push(`${memberId}: 更新エラー - ${error.message}`)
              } else {
                successCount++
              }
            } else {
              // 新規作成
              const { error } = await supabase.from("members").insert({
                member_id: memberId,
                name,
                status,
                assigned_staff: assignedStaff,
                enrollment_date: enrollmentDate,
                last_meeting_date: lastMeetingDate,
                next_action: nextAction,
              })

              if (error) {
                errors.push(`${memberId}: 作成エラー - ${error.message}`)
              } else {
                successCount++
              }
            }
          } catch (error) {
            errors.push(`${row.id}: 予期しないエラー - ${error}`)
          }
        }

        setResult({ success: successCount, errors })
        setIsUploading(false)
        
        // 成功したら少し待ってからページをリロード
        if (successCount > 0 && errors.length === 0) {
          setTimeout(() => {
            window.location.reload()
          }, 2000)
        }
      },
      error: (error) => {
        setResult({ success: 0, errors: [`CSVファイルの解析エラー: ${error.message}`] })
        setIsUploading(false)
      },
    })
  }

  return (
    <Card className="border-gray-200 shadow-sm rounded-lg overflow-hidden">
      <CardHeader className="bg-gray-50 border-b border-gray-200">
        <CardTitle className="text-lg font-semibold text-gray-800 flex items-center gap-2">
          <FileText className="h-5 w-5" />
          CSVインポート
        </CardTitle>
        <CardDescription className="text-sm text-gray-600">
          モニタリングシートのCSVファイルをアップロードして会員データを一括登録・更新
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-4">
          <div className="flex items-center justify-center w-full">
            <label
              htmlFor="dropzone-file"
              className="flex flex-col items-center justify-center w-full h-48 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors"
            >
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <Upload className="w-10 h-10 mb-3 text-gray-400" />
                <p className="mb-2 text-sm text-gray-500">
                  <span className="font-semibold">クリックしてアップロード</span> またはドラッグ＆ドロップ
                </p>
                <p className="text-xs text-gray-500">CSV形式のファイル</p>
              </div>
              <input
                id="dropzone-file"
                type="file"
                className="hidden"
                accept=".csv"
                onChange={handleFileUpload}
                disabled={isUploading}
              />
            </label>
          </div>

          {isUploading && (
            <div className="flex items-center justify-center py-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
              <span className="ml-3 text-sm text-gray-600">処理中...</span>
            </div>
          )}

          {result && (
            <div className="space-y-2">
              {result.success > 0 && (
                <div className="flex items-center gap-2 p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
                  <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                  <span className="text-sm text-emerald-800">
                    {result.success}件のデータを正常に処理しました
                  </span>
                </div>
              )}
              {result.errors.length > 0 && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertCircle className="h-5 w-5 text-red-600" />
                    <span className="text-sm font-semibold text-red-800">
                      {result.errors.length}件のエラーが発生しました
                    </span>
                  </div>
                  <ul className="text-xs text-red-700 space-y-1 ml-7 max-h-32 overflow-y-auto">
                    {result.errors.map((error, index) => (
                      <li key={index}>• {error}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
