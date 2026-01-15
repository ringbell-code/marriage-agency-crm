"use client"

import { useEffect, useState } from "react"
import { getMembers } from "@/lib/actions/members"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, TrendingUp, Heart, Calendar, AlertCircle, Activity, Filter } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { StatusBadge } from "@/components/status-badge"
import { format } from "date-fns"
import { ja } from "date-fns/locale"
import type { Member } from "@/lib/supabase"

export default function DashboardPage() {
  const [members, setMembers] = useState<Member[]>([])
  const [filteredMembers, setFilteredMembers] = useState<Member[]>([])
  const [enrollmentPeriod, setEnrollmentPeriod] = useState("all")
  const [assignedStaff, setAssignedStaff] = useState("all")
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchMembers()
  }, [])

  useEffect(() => {
    applyFilters()
  }, [members, enrollmentPeriod, assignedStaff])

  const fetchMembers = async () => {
    setIsLoading(true)
    const data = await getMembers()
    setMembers(data)
    setIsLoading(false)
  }

  const applyFilters = () => {
    let filtered = [...members]

    // テストユーザーを除外（担当者が「テスト」以外の場合）
    if (assignedStaff !== "テスト") {
      filtered = filtered.filter((member) => member.assigned_staff !== "テスト")
    }

    // 入会時期フィルター
    if (enrollmentPeriod !== "all") {
      const now = new Date()
      const currentYear = now.getFullYear()
      const currentMonth = now.getMonth()

      filtered = filtered.filter((member) => {
        const enrollmentDate = new Date(member.enrollment_date)
        const enrollmentYear = enrollmentDate.getFullYear()
        const enrollmentMonth = enrollmentDate.getMonth()

        switch (enrollmentPeriod) {
          case "thisMonth":
            return enrollmentYear === currentYear && enrollmentMonth === currentMonth
          case "thisYear":
            return enrollmentYear === currentYear
          case "lastYear":
            return enrollmentYear === currentYear - 1
          default:
            return true
        }
      })
    }

    // 担当者フィルター
    if (assignedStaff !== "all") {
      filtered = filtered.filter((member) => member.assigned_staff === assignedStaff)
    }

    setFilteredMembers(filtered)
  }

  const displayMembers = filteredMembers

  // KPI計算
  const totalMembers = displayMembers.length
  const activeMembers = displayMembers.filter(m => 
    ['お見合い', '仮交際', '真剣交際'].includes(m.status)
  ).length
  const successfulMembers = displayMembers.filter(m => m.status === '成婚退会').length
  const successRate = totalMembers > 0 ? Math.round((successfulMembers / totalMembers) * 100) : 0

  // ステータス別集計
  const statusCounts = displayMembers.reduce((acc, member) => {
    acc[member.status] = (acc[member.status] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  // 今日の面談
  const today = new Date().toISOString().split('T')[0]
  const todaysMeetings = displayMembers.filter(m => m.next_meeting_date === today)

  // 今週の面談
  const weekFromNow = new Date()
  weekFromNow.setDate(weekFromNow.getDate() + 7)
  const thisWeeksMeetings = displayMembers.filter(m => {
    if (!m.next_meeting_date) return false
    const meetingDate = new Date(m.next_meeting_date)
    return meetingDate >= new Date() && meetingDate <= weekFromNow
  })

  // 面談未設定の会員（公開前、退会、休会、成婚退会を除く）
  const unscheduledMembers = displayMembers.filter(m => {
    // 除外するステータス
    const excludedStatuses = ['公開前', '退会', '休会', '成婚退会']
    if (excludedStatuses.includes(m.status)) return false
    
    // 面談が未設定（next_meeting_status が 'unset'）
    return m.next_meeting_status === 'unset'
  }).slice(0, 10)

  // 30日以上連絡がない会員（最終面談日 or 最終打診日から30日以上経過）
  const inactiveMembers = displayMembers.filter(m => {
    // 除外するステータス
    const excludedStatuses = ['公開前', '退会', '休会', '成婚退会']
    if (excludedStatuses.includes(m.status)) return false
    
    // 最終面談日と最終打診日のどちらか新しい方を取得
    const dates = [m.last_meeting_date, m.last_contact_date].filter(d => d !== null)
    if (dates.length === 0) return false
    
    const latestDate = new Date(Math.max(...dates.map(d => new Date(d!).getTime())))
    const daysSinceContact = Math.ceil((new Date().getTime() - latestDate.getTime()) / (1000 * 60 * 60 * 24))
    
    return daysSinceContact >= 30
  })
  .sort((a, b) => {
    // 最後の連絡日が古い順にソート
    const aDate = new Date(Math.max(
      ...[a.last_meeting_date, a.last_contact_date].filter(d => d).map(d => new Date(d!).getTime())
    ))
    const bDate = new Date(Math.max(
      ...[b.last_meeting_date, b.last_contact_date].filter(d => d).map(d => new Date(d!).getTime())
    ))
    return aDate.getTime() - bDate.getTime()
  })
  .slice(0, 10)

  // 担当者リスト
  const staffList = Array.from(new Set(members.map(m => m.assigned_staff))).sort()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-600">読み込み中...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl font-bold tracking-tight text-gray-800">ダッシュボード</h1>
        <p className="text-gray-600 mt-2 text-base">会員管理の概要と最新情報</p>
      </div>

      {/* フィルター */}
      <Card className="border-2 border-gray-200 bg-white">
        <CardHeader className="bg-gray-50 border-b-2 border-gray-200 py-4">
          <CardTitle className="text-base font-bold text-gray-800 flex items-center gap-2">
            <Filter className="h-5 w-5" />
            絞り込み
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4 bg-white">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <label className="text-sm font-semibold text-gray-700 mb-2 block">利用開始月</label>
              <Select value={enrollmentPeriod} onValueChange={setEnrollmentPeriod}>
                <SelectTrigger className="border-2 border-gray-300 text-base font-medium">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">すべて</SelectItem>
                  <SelectItem value="thisMonth">今月</SelectItem>
                  <SelectItem value="thisYear">今年</SelectItem>
                  <SelectItem value="lastYear">昨年</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex-1 min-w-[200px]">
              <label className="text-sm font-semibold text-gray-700 mb-2 block">担当</label>
              <Select value={assignedStaff} onValueChange={setAssignedStaff}>
                <SelectTrigger className="border-2 border-gray-300 text-base font-medium">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">すべて</SelectItem>
                  {staffList.map((staff) => (
                    <SelectItem key={staff} value={staff}>
                      {staff}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* KPIカード */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-2 border-gray-200 bg-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-white">
            <CardTitle className="text-sm font-bold text-gray-700">総会員数</CardTitle>
            <Users className="h-5 w-5 text-gray-600" />
          </CardHeader>
          <CardContent className="bg-white">
            <div className="text-3xl font-bold text-gray-800">{totalMembers}</div>
            <p className="text-xs text-gray-600 mt-1">全ステータス合計</p>
          </CardContent>
        </Card>

        <Card className="border-2 border-blue-200 bg-blue-50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-blue-50">
            <CardTitle className="text-sm font-bold text-blue-700">活動中</CardTitle>
            <TrendingUp className="h-5 w-5 text-blue-600" />
          </CardHeader>
          <CardContent className="bg-blue-50">
            <div className="text-3xl font-bold text-blue-700">{activeMembers}</div>
            <p className="text-xs text-blue-700 mt-1">お見合い・交際中</p>
          </CardContent>
        </Card>

        <Card className="border-2 border-emerald-200 bg-emerald-50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-emerald-50">
            <CardTitle className="text-sm font-bold text-emerald-700">成婚退会</CardTitle>
            <Heart className="h-5 w-5 text-emerald-600" />
          </CardHeader>
          <CardContent className="bg-emerald-50">
            <div className="text-3xl font-bold text-emerald-700">{successfulMembers}</div>
            <p className="text-xs text-emerald-700 mt-1">成婚率 {successRate}%</p>
          </CardContent>
        </Card>

        <Card className="border-2 border-amber-200 bg-amber-50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-amber-50">
            <CardTitle className="text-sm font-bold text-amber-700">今週の面談</CardTitle>
            <Calendar className="h-5 w-5 text-amber-600" />
          </CardHeader>
          <CardContent className="bg-amber-50">
            <div className="text-3xl font-bold text-amber-700">{thisWeeksMeetings.length}</div>
            <p className="text-xs text-amber-700 mt-1">本日 {todaysMeetings.length}件</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* ステータス別会員数 */}
        <Card className="border-2 border-gray-200 bg-white">
          <CardHeader className="bg-gray-50 border-b-2 border-gray-200">
            <CardTitle className="text-lg font-bold text-gray-800 flex items-center gap-2">
              <Activity className="h-5 w-5" />
              ステータス別会員数
            </CardTitle>
            <CardDescription className="text-sm font-medium text-gray-600">
              各ステータスの内訳
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6 bg-white">
            <div className="space-y-3">
              {Object.entries(statusCounts).length === 0 ? (
                <div className="text-center py-8 text-gray-600 font-medium">
                  該当する会員がいません
                </div>
              ) : (
                Object.entries(statusCounts)
                  .sort((a, b) => b[1] - a[1])
                  .map(([status, count]) => (
                    <div key={status} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="flex items-center gap-3">
                        <StatusBadge status={status} />
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-2xl font-bold text-gray-800">{count}</span>
                        <span className="text-sm font-medium text-gray-600">名</span>
                      </div>
                    </div>
                  ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* 面談未設定の会員 */}
        <Card className="border-2 border-amber-200 bg-amber-50">
          <CardHeader className="bg-amber-100 border-b-2 border-amber-200">
            <CardTitle className="text-lg font-bold text-amber-800 flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              面談未設定の会員
            </CardTitle>
            <CardDescription className="text-sm font-medium text-amber-700">
              活動中で次回面談が未設定
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6 bg-amber-50">
            {unscheduledMembers.length === 0 ? (
              <div className="text-center py-8 text-gray-600 font-medium">
                面談未設定の会員はいません
              </div>
            ) : (
              <div className="space-y-3">
                {unscheduledMembers.map((member) => (
                  <Link
                    key={member.id}
                    href={`/members/${member.id}`}
                    className="block p-3 bg-white rounded-lg border-2 border-amber-300 hover:border-amber-500 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="space-y-1 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-gray-800">{member.name}</span>
                          <StatusBadge status={member.status} />
                        </div>
                        {member.last_meeting_date && (
                          <div className="flex items-center gap-1 text-xs text-gray-600 font-medium">
                            <Calendar className="h-3 w-3" />
                            最終面談: {format(new Date(member.last_meeting_date), "MM/dd", { locale: ja })}
                          </div>
                        )}
                        {member.next_action && (
                          <p className="text-sm text-gray-700 font-medium line-clamp-1">
                            {member.next_action}
                          </p>
                        )}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* 30日以上連絡がない会員 */}
        <Card className="border-2 border-rose-200 bg-rose-50">
          <CardHeader className="bg-rose-100 border-b-2 border-rose-200">
            <CardTitle className="text-lg font-bold text-rose-800 flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              30日以上連絡なし
            </CardTitle>
            <CardDescription className="text-sm font-medium text-rose-700">
              最終面談・打診日から30日以上経過
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6 bg-rose-50">
            {inactiveMembers.length === 0 ? (
              <div className="text-center py-8 text-gray-600 font-medium">
                該当する会員はいません
              </div>
            ) : (
              <div className="space-y-3">
                {inactiveMembers.map((member) => {
                  const dates = [member.last_meeting_date, member.last_contact_date].filter(d => d !== null)
                  const latestDate = new Date(Math.max(...dates.map(d => new Date(d!).getTime())))
                  const daysSinceContact = Math.ceil((new Date().getTime() - latestDate.getTime()) / (1000 * 60 * 60 * 24))
                  
                  return (
                    <Link
                      key={member.id}
                      href={`/members/${member.id}`}
                      className="block p-3 bg-white rounded-lg border-2 border-rose-200 hover:border-rose-400 transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div className="space-y-1 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-gray-800">{member.name}</span>
                            <StatusBadge status={member.status} />
                          </div>
                          <div className="flex items-center gap-1 text-xs text-rose-700 font-semibold">
                            <Calendar className="h-3 w-3" />
                            最終連絡: {format(latestDate, "MM/dd", { locale: ja })} ({daysSinceContact}日前)
                          </div>
                          {member.next_action && (
                            <p className="text-sm text-gray-700 font-medium line-clamp-1">
                              {member.next_action}
                            </p>
                          )}
                        </div>
                      </div>
                    </Link>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* 今週の面談予定 */}
      <Card className="border-2 border-gray-200 bg-white">
        <CardHeader className="bg-gray-50 border-b-2 border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg font-bold text-gray-800 flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                今週の面談予定
              </CardTitle>
              <CardDescription className="text-sm font-medium text-gray-600 mt-1">
                {format(new Date(), "M月d日", { locale: ja })} 〜 {format(weekFromNow, "M月d日", { locale: ja })}
              </CardDescription>
            </div>
            <Button asChild variant="outline" className="border-2 border-gray-300 font-bold">
              <Link href="/members">
                全会員を見る
              </Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent className="pt-6 bg-white">
          {thisWeeksMeetings.length === 0 ? (
            <div className="text-center py-8 text-gray-600 font-medium">
              今週の面談予定はありません
            </div>
          ) : (
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              {thisWeeksMeetings.map((member) => (
                <Link
                  key={member.id}
                  href={`/members/${member.id}`}
                  className="block p-4 bg-white rounded-lg border-2 border-gray-200 hover:border-gray-400 transition-colors"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-gray-800">{member.name}</span>
                      <StatusBadge status={member.status} />
                    </div>
                    <div className="text-sm font-bold text-blue-700">
                      {member.next_meeting_date && 
                        format(new Date(member.next_meeting_date), "M月d日 (E)", { locale: ja })}
                    </div>
                    {member.next_action && (
                      <p className="text-xs text-gray-600 font-medium line-clamp-2">
                        {member.next_action}
                      </p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
