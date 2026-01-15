"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { MessageSquare, Calendar, FileText, Loader2, Sparkles, CheckCircle2 } from "lucide-react"
import { ActivityLog } from "@/lib/supabase"
import { analyzeActivity, saveActivityLog, ActivityAnalysis } from "@/lib/actions/activity"
import { useRouter } from "next/navigation"
import { format } from "date-fns"
import { ja } from "date-fns/locale"

interface ActivitySectionProps {
  memberId: string
  logs: ActivityLog[]
}

const typeIcons = {
  meeting: Calendar,
  line: MessageSquare,
  note: FileText,
}

const typeLabels = {
  meeting: "面談",
  line: "LINE",
  note: "その他",
}

const sentimentColors = {
  positive: "bg-emerald-50 text-emerald-700 border-emerald-200",
  neutral: "bg-gray-50 text-gray-700 border-gray-200",
  negative: "bg-rose-50 text-rose-700 border-rose-200",
}

const sentimentLabels = {
  positive: "ポジティブ",
  neutral: "中立",
  negative: "ネガティブ",
}

export function ActivitySection({ memberId, logs }: ActivitySectionProps) {
  const router = useRouter()
  const [text, setText] = useState("")
  const [type, setType] = useState("meeting")
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [analysisResult, setAnalysisResult] = useState<ActivityAnalysis | null>(null)
  const [updateMemberFields, setUpdateMemberFields] = useState(true)

  // AI解析を実行
  const handleAnalyze = async () => {
    if (!text.trim()) return

    setIsAnalyzing(true)
    try {
      const result = await analyzeActivity(text)
      
      if (result.success && result.data) {
        setAnalysisResult(result.data)
      } else {
        alert(`エラー: ${result.error}`)
      }
    } catch (error) {
      console.error("AI解析エラー:", error)
      alert("AI解析に失敗しました")
    } finally {
      setIsAnalyzing(false)
    }
  }

  // 解析結果を保存
  const handleSave = async () => {
    if (!analysisResult) return

    setIsSaving(true)
    try {
      const result = await saveActivityLog(memberId, text, type, analysisResult, updateMemberFields)
      
      if (result.success) {
        setText("")
        setAnalysisResult(null)
        router.refresh()
      } else {
        alert(`エラー: ${result.error}`)
      }
    } catch (error) {
      console.error("保存エラー:", error)
      alert("保存に失敗しました")
    } finally {
      setIsSaving(false)
    }
  }

  // 解析結果の更新
  const updateAnalysis = (field: keyof ActivityAnalysis, value: string | null) => {
    if (!analysisResult) return
    setAnalysisResult({ ...analysisResult, [field]: value })
  }

  return (
    <Card className="border-gray-200 rounded-lg overflow-hidden">
      <CardHeader className="bg-white border-b border-gray-200">
        <CardTitle className="text-gray-800 text-lg font-bold flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-gray-700" />
          スマート・アクティビティログ
        </CardTitle>
      </CardHeader>
      <CardContent className="bg-white pt-6">
        <Tabs defaultValue="input" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6 bg-white border-2 border-gray-300">
            <TabsTrigger value="input" className="font-bold text-base data-[state=active]:bg-blue-600 data-[state=active]:text-white">
              📝 入力
            </TabsTrigger>
            <TabsTrigger value="history" className="font-bold text-base data-[state=active]:bg-blue-600 data-[state=active]:text-white">
              📚 履歴
            </TabsTrigger>
          </TabsList>

          <TabsContent value="input" className="space-y-4">
            {/* 入力エリア */}
            <div className="space-y-4 p-4 border-2 border-gray-200 rounded-lg bg-gray-50">
              <div className="space-y-2">
                <Label className="text-sm font-semibold text-gray-700">種類</Label>
                <Select value={type} onValueChange={setType} disabled={!!analysisResult}>
                  <SelectTrigger className="border-2 border-gray-300 text-base font-medium bg-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="meeting" className="text-base">
                      📅 面談
                    </SelectItem>
                    <SelectItem value="line" className="text-base">
                      💬 LINE
                    </SelectItem>
                    <SelectItem value="note" className="text-base">
                      📝 その他
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-semibold text-gray-700">内容</Label>
                <Textarea
                  placeholder="面談の書き起こしやLINEのやり取りを貼り付けてください...&#10;&#10;AIが自動で要約し、次のアクションや面談日を抽出します。"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  rows={12}
                  disabled={!!analysisResult}
                  className="border-2 border-gray-300 text-base text-gray-800 font-medium resize-none bg-white disabled:opacity-50"
                />
              </div>

              {!analysisResult && (
                <Button
                  onClick={handleAnalyze}
                  disabled={!text.trim() || isAnalyzing}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-base h-12 gap-2"
                >
                  {isAnalyzing ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      AI解析中...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-5 w-5" />
                      AI解析を実行
                    </>
                  )}
                </Button>
              )}

              <p className="text-sm text-gray-700 font-medium">
                💡 面談記録やLINEの会話履歴を貼り付けると、AIが要約・分析し、次のアクションを提案します。
              </p>
            </div>

            {/* 解析結果表示・編集エリア */}
            {analysisResult && (
              <div className="space-y-4 p-4 border-2 border-emerald-300 rounded-lg bg-emerald-50">
                <div className="flex items-center gap-2 text-emerald-700 font-bold text-base">
                  <CheckCircle2 className="h-5 w-5" />
                  AI解析が完了しました
                </div>

                <div className="space-y-4 bg-white p-4 rounded-lg border border-gray-200">
                  {/* 要約 */}
                  <div className="space-y-2">
                    <Label className="text-sm font-bold text-gray-800">📝 要約</Label>
                    <Textarea
                      value={analysisResult.summary}
                      onChange={(e) => updateAnalysis("summary", e.target.value)}
                      rows={8}
                      className="border-2 border-gray-300 text-sm text-gray-800 font-medium"
                    />
                  </div>

                  {/* 感情 */}
                  <div className="space-y-2">
                    <Label className="text-sm font-bold text-gray-800">😊 感情分析</Label>
                    <Select
                      value={analysisResult.sentiment}
                      onValueChange={(value) => updateAnalysis("sentiment", value)}
                    >
                      <SelectTrigger className="border-2 border-gray-300 text-base font-medium">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="positive">✅ ポジティブ</SelectItem>
                        <SelectItem value="neutral">➖ 中立</SelectItem>
                        <SelectItem value="negative">❌ ネガティブ</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* 次のアクション */}
                  <div className="space-y-2">
                    <Label className="text-sm font-bold text-gray-800">🎯 次のアクション（提案）</Label>
                    <Textarea
                      value={analysisResult.suggested_next_action}
                      onChange={(e) => updateAnalysis("suggested_next_action", e.target.value)}
                      rows={3}
                      className="border-2 border-gray-300 text-sm text-gray-800 font-medium"
                    />
                  </div>

                  {/* 次回面談日 */}
                  <div className="space-y-2">
                    <Label className="text-sm font-bold text-gray-800">📅 次回面談日（提案）</Label>
                    <Input
                      type="date"
                      value={analysisResult.suggested_next_meeting || ""}
                      onChange={(e) => updateAnalysis("suggested_next_meeting", e.target.value || null)}
                      className="border-2 border-gray-300 text-base text-gray-800 font-medium"
                    />
                  </div>

                  {/* 会員情報更新オプション */}
                  <div className="flex items-center space-x-2 p-3 bg-amber-50 border border-amber-200 rounded-md">
                    <Checkbox
                      id="update-member"
                      checked={updateMemberFields}
                      onCheckedChange={(checked) => setUpdateMemberFields(checked as boolean)}
                      className="border-2 border-gray-400"
                    />
                    <label
                      htmlFor="update-member"
                      className="text-sm font-semibold text-gray-800 cursor-pointer"
                    >
                      会員の「次のアクション」と「次回面談日」も自動更新する
                    </label>
                  </div>
                </div>

                {/* アクションボタン */}
                <div className="flex gap-3">
                  <Button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-base h-12 gap-2"
                  >
                    {isSaving ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin" />
                        保存中...
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="h-5 w-5" />
                        保存する
                      </>
                    )}
                  </Button>
                  <Button
                    onClick={() => {
                      setAnalysisResult(null)
                      setText("")
                    }}
                    variant="outline"
                    className="px-6 border-2 border-gray-400 text-gray-700 hover:bg-gray-100 font-bold text-base h-12"
                  >
                    キャンセル
                  </Button>
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="history" className="space-y-4">
            {logs.length === 0 ? (
              <div className="flex h-64 items-center justify-center text-gray-700 text-base font-medium">
                まだアクティビティログがありません
              </div>
            ) : (
              <div className="space-y-3">
                {logs.map((log) => {
                  const Icon = typeIcons[log.type as keyof typeof typeIcons] || FileText
                  const typeLabel = typeLabels[log.type as keyof typeof typeLabels] || log.type

                  return (
                    <Card key={log.id} className="border-2 border-gray-200 rounded-lg bg-white">
                      <CardContent className="p-5">
                        <div className="flex items-start gap-4">
                          <div className="rounded-lg bg-gray-100 p-3 border border-gray-200">
                            <Icon className="h-5 w-5 text-gray-800" />
                          </div>
                          <div className="flex-1 space-y-3">
                            <div className="flex items-center gap-2 flex-wrap">
                              <Badge variant="outline" className="border-2 border-gray-400 text-gray-800 font-bold">
                                {typeLabel}
                              </Badge>
                              {log.sentiment && (
                                <Badge
                                  className={`${
                                    sentimentColors[log.sentiment as keyof typeof sentimentColors] ||
                                    sentimentColors.neutral
                                  } font-semibold border-2`}
                                >
                                  {sentimentLabels[log.sentiment as keyof typeof sentimentLabels] || log.sentiment}
                                </Badge>
                              )}
                              <span className="text-sm text-gray-800 font-semibold">
                                {new Date(log.created_at).toLocaleString("ja-JP", {
                                  year: "numeric",
                                  month: "short",
                                  day: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </span>
                            </div>

                            {log.summary ? (
                              <p className="text-base text-gray-800 font-medium leading-relaxed whitespace-pre-wrap">{log.summary}</p>
                            ) : (
                              <p className="text-base text-gray-800 font-medium leading-relaxed">
                                {log.content.substring(0, 100)}...
                              </p>
                            )}

                            <Accordion type="single" collapsible className="w-full">
                              <AccordionItem value="content" className="border-0">
                                <AccordionTrigger className="text-sm text-gray-700 hover:text-gray-800 py-2 font-semibold">
                                  全文を表示
                                </AccordionTrigger>
                                <AccordionContent className="text-base text-gray-800 whitespace-pre-wrap bg-white p-4 rounded-md border-2 border-gray-200 font-medium">
                                  {log.content}
                                </AccordionContent>
                              </AccordionItem>
                            </Accordion>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
