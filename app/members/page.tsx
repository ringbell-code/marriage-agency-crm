"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { StatusBadge } from "@/components/status-badge"
import { EditableCell } from "@/components/editable-cell"
import { MemberFilters, FilterState } from "@/components/member-filters"
import Link from "next/link"
import { Users, ArrowUpDown, ArrowUp, ArrowDown, Plus } from "lucide-react"
import { supabase, Member, NextMeetingStatus } from "@/lib/supabase"
import { updateMemberField, updateMemberNextMeetingDate, addMember } from "@/lib/actions/members"

type SortField = "member_id" | "name" | "status" | "assigned_staff" | "enrollment_date" | "last_meeting_date" | "next_meeting_date"
type SortDirection = "asc" | "desc" | null

const statusOptions = [
  "公開前",
  "お見合い",
  "仮交際",
  "真剣交際",
  "成婚退会",
  "休会",
  "退会",
]

export default function Home() {
  const router = useRouter()
  const [members, setMembers] = useState<Member[]>([])
  const [filteredMembers, setFilteredMembers] = useState<Member[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [sortField, setSortField] = useState<SortField | null>(null)
  const [sortDirection, setSortDirection] = useState<SortDirection>(null)
  
  // 新規追加ダイアログ用
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isAdding, setIsAdding] = useState(false)
  const [newMember, setNewMember] = useState({
    member_id: "",
    name: "",
    status: "公開前",
    assigned_staff: "",
    enrollment_date: new Date().toISOString().split('T')[0]
  })

  useEffect(() => {
    fetchMembers()
  }, [])

  const fetchMembers = async () => {
    setIsLoading(true)
    const { data, error } = await supabase
      .from("members")
      .select("*")
      .order("updated_at", { ascending: false })

    if (!error && data) {
      setMembers(data)
      setFilteredMembers(data)
    }
    setIsLoading(false)
  }

  const handleFilterChange = (filters: FilterState) => {
    let filtered = [...members]

    // テストユーザー除外（担当者が「テスト」以外の場合）
    if (filters.assignedStaff !== "テスト") {
      filtered = filtered.filter((member) => member.assigned_staff !== "テスト")
    }

    // ステータスフィルター（複数選択）
    if (filters.statuses.length > 0) {
      filtered = filtered.filter((member) => filters.statuses.includes(member.status))
    }

    // 担当者フィルター
    if (filters.assignedStaff !== "all") {
      filtered = filtered.filter((member) => member.assigned_staff === filters.assignedStaff)
    }

    // 入会時期フィルター
    if (filters.enrollmentPeriod !== "all") {
      const now = new Date()
      const currentYear = now.getFullYear()
      const currentMonth = now.getMonth()

      filtered = filtered.filter((member) => {
        const enrollmentDate = new Date(member.enrollment_date)
        const enrollmentYear = enrollmentDate.getFullYear()
        const enrollmentMonth = enrollmentDate.getMonth()

        switch (filters.enrollmentPeriod) {
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

    // 最終面談日フィルター
    if (filters.lastMeetingDateFilter !== "all") {
      filtered = filtered.filter((member) => {
        if (filters.lastMeetingDateFilter === "set") {
          return member.last_meeting_date !== null
        } else if (filters.lastMeetingDateFilter === "unset") {
          return member.last_meeting_date === null
        }
        return true
      })
    }

    // 最終打診日フィルター
    if (filters.lastContactDateFilter !== "all") {
      filtered = filtered.filter((member) => {
        if (filters.lastContactDateFilter === "set") {
          return member.last_contact_date !== null
        } else if (filters.lastContactDateFilter === "unset") {
          return member.last_contact_date === null
        }
        return true
      })
    }

    // 次回面談日フィルター
    if (filters.nextMeetingDateFilter !== "all") {
      filtered = filtered.filter((member) => {
        if (filters.nextMeetingDateFilter === "set") {
          return member.next_meeting_date !== null
        } else if (filters.nextMeetingDateFilter === "unset") {
          return member.next_meeting_date === null
        }
        return true
      })
    }

    // キーワード検索
    if (filters.keyword) {
      const keyword = filters.keyword.toLowerCase()
      filtered = filtered.filter(
        (member) =>
          member.name.toLowerCase().includes(keyword) ||
          member.member_id.toLowerCase().includes(keyword)
      )
    }

    // ソート適用
    if (sortField && sortDirection) {
      filtered = sortMembers(filtered, sortField, sortDirection)
    }

    setFilteredMembers(filtered)
  }

  const sortMembers = (data: Member[], field: SortField, direction: SortDirection) => {
    if (!direction) return data

    return [...data].sort((a, b) => {
      let aValue: any = a[field]
      let bValue: any = b[field]

      // 日付フィールドの処理
      if (field === "enrollment_date" || field === "last_meeting_date" || field === "next_meeting_date") {
        aValue = aValue ? new Date(aValue).getTime() : 0
        bValue = bValue ? new Date(bValue).getTime() : 0
      }

      // nullの処理
      if (aValue === null) return 1
      if (bValue === null) return -1

      if (aValue < bValue) return direction === "asc" ? -1 : 1
      if (aValue > bValue) return direction === "asc" ? 1 : -1
      return 0
    })
  }

  const handleUpdateField = async (
    memberId: string, 
    field: string, 
    value: string | null, 
    status?: NextMeetingStatus
  ) => {
    let result
    
    if (field === 'next_meeting_date' && status) {
      result = await updateMemberNextMeetingDate(memberId, value, status)
    } else {
      result = await updateMemberField(memberId, field, value)
    }
    
    if (result.success) {
      // 更新後、データを再取得
      await fetchMembers()
    }
  }

  const handleAddMember = async () => {
    // バリデーション
    if (!newMember.member_id || !newMember.name || !newMember.assigned_staff) {
      alert("会員ID、名前、担当者は必須項目です")
      return
    }

    setIsAdding(true)
    const result = await addMember(newMember)
    
    if (result.success) {
      setIsDialogOpen(false)
      setNewMember({
        member_id: "",
        name: "",
        status: "公開前",
        assigned_staff: "",
        enrollment_date: new Date().toISOString().split('T')[0]
      })
      await fetchMembers()
    } else {
      alert(`エラー: ${result.error}`)
    }
    setIsAdding(false)
  }

  const handleSort = (field: SortField) => {
    let newDirection: SortDirection = "asc"

    if (sortField === field) {
      if (sortDirection === "asc") {
        newDirection = "desc"
      } else if (sortDirection === "desc") {
        newDirection = null
        setSortField(null)
        setSortDirection(null)
        // ソートをクリア（フィルターは維持）
        setFilteredMembers([...filteredMembers])
        return
      }
    }

    setSortField(field)
    setSortDirection(newDirection)

    const sorted = sortMembers(filteredMembers, field, newDirection)
    setFilteredMembers(sorted)
  }


  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-gray-500">読み込み中...</div>
      </div>
    )
  }

  // 担当者リストを動的に生成
  const staffList = Array.from(new Set(members.map(m => m.assigned_staff))).sort()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-800">会員管理</h1>
          <p className="text-gray-500 mt-1">
            全会員の一覧とステータスを確認できます
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* 新規追加ボタン */}
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-base h-11 gap-2">
                <Plus className="h-5 w-5" />
                新規会員追加
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px] bg-white">
              <DialogHeader>
                <DialogTitle className="text-xl font-bold text-gray-800">新規会員追加</DialogTitle>
                <DialogDescription className="text-sm text-gray-600">
                  新しい会員の情報を入力してください
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="member_id" className="text-sm font-semibold text-gray-700">
                    会員ID <span className="text-rose-600">*</span>
                  </Label>
                  <Input
                    id="member_id"
                    value={newMember.member_id}
                    onChange={(e) => setNewMember({ ...newMember, member_id: e.target.value })}
                    placeholder="F000000"
                    className="border-2 border-gray-300 text-gray-800 text-base font-medium"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-sm font-semibold text-gray-700">
                    名前 <span className="text-rose-600">*</span>
                  </Label>
                  <Input
                    id="name"
                    value={newMember.name}
                    onChange={(e) => setNewMember({ ...newMember, name: e.target.value })}
                    placeholder="山田 太郎"
                    className="border-2 border-gray-300 text-gray-800 text-base font-medium"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="status" className="text-sm font-semibold text-gray-700">
                    ステータス
                  </Label>
                  <Select 
                    value={newMember.status} 
                    onValueChange={(value) => setNewMember({ ...newMember, status: value })}
                  >
                    <SelectTrigger className="border-2 border-gray-300 text-gray-800 text-base font-medium">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {statusOptions.map((status) => (
                        <SelectItem key={status} value={status} className="text-base">
                          {status}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="assigned_staff" className="text-sm font-semibold text-gray-700">
                    担当者 <span className="text-rose-600">*</span>
                  </Label>
                  <Select 
                    value={newMember.assigned_staff} 
                    onValueChange={(value) => setNewMember({ ...newMember, assigned_staff: value })}
                  >
                    <SelectTrigger className="border-2 border-gray-300 text-gray-800 text-base font-medium">
                      <SelectValue placeholder="担当者を選択" />
                    </SelectTrigger>
                    <SelectContent>
                      {staffList.map((staff) => (
                        <SelectItem key={staff} value={staff} className="text-base">
                          {staff}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="enrollment_date" className="text-sm font-semibold text-gray-700">
                    入会日
                  </Label>
                  <Input
                    id="enrollment_date"
                    type="date"
                    value={newMember.enrollment_date}
                    onChange={(e) => setNewMember({ ...newMember, enrollment_date: e.target.value })}
                    className="border-2 border-gray-300 text-gray-800 text-base font-medium"
                  />
                </div>
              </div>
              
              <div className="flex gap-3 justify-end">
                <Button
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                  className="border-2 border-gray-300 text-gray-800 font-semibold hover:bg-gray-50"
                >
                  キャンセル
                </Button>
                <Button
                  onClick={handleAddMember}
                  disabled={isAdding}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold"
                >
                  {isAdding ? "追加中..." : "追加"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
          
          <div className="flex items-center gap-3 rounded-2xl border border-violet-100 bg-white px-5 py-3 shadow-sm shadow-violet-100">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-100 to-purple-100">
              <Users className="h-5 w-5 text-violet-600" />
            </div>
            <div className="text-sm">
              <div className="text-xs text-gray-500">総会員数</div>
              <span className="text-lg font-bold text-gray-800">{members.filter(m => m.assigned_staff !== "テスト").length}</span>
              <span className="text-gray-600 text-sm"> 名</span>
            </div>
          </div>
        </div>
      </div>

      <MemberFilters onFilterChange={handleFilterChange} staffList={staffList} />

      <Card className="border-gray-300 shadow-sm rounded-lg overflow-hidden">
        <CardHeader className="bg-white border-b-2 border-gray-300 py-4 px-6">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-bold text-gray-800">会員一覧</CardTitle>
            <CardDescription className="text-sm text-gray-700 font-medium">
              全 {filteredMembers.length} 件中 1 ～ {Math.min(20, filteredMembers.length)} 件を表示
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="bg-white p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50 border-b border-gray-300 hover:bg-gray-50">
                <TableHead 
                  className="text-sm font-bold text-gray-800 h-12 cursor-pointer hover:bg-gray-100 transition-colors w-[120px]"
                  onClick={() => handleSort("member_id")}
                >
                  <div className="flex items-center gap-1">
                    会員ID
                    {sortField === "member_id" ? (
                      sortDirection === "asc" ? (
                        <ArrowUp className="h-4 w-4" />
                      ) : (
                        <ArrowDown className="h-4 w-4" />
                      )
                    ) : (
                      <ArrowUpDown className="h-4 w-4 opacity-40" />
                    )}
                  </div>
                </TableHead>
                <TableHead 
                  className="text-sm font-bold text-gray-800 h-12 cursor-pointer hover:bg-gray-100 transition-colors w-[150px]"
                  onClick={() => handleSort("name")}
                >
                  <div className="flex items-center gap-1">
                    氏名
                    {sortField === "name" ? (
                      sortDirection === "asc" ? (
                        <ArrowUp className="h-4 w-4" />
                      ) : (
                        <ArrowDown className="h-4 w-4" />
                      )
                    ) : (
                      <ArrowUpDown className="h-4 w-4 opacity-40" />
                    )}
                  </div>
                </TableHead>
                <TableHead 
                  className="text-sm font-bold text-gray-800 h-12 cursor-pointer hover:bg-gray-100 transition-colors w-[120px]"
                  onClick={() => handleSort("status")}
                >
                  <div className="flex items-center gap-1">
                    ステータス
                    {sortField === "status" ? (
                      sortDirection === "asc" ? (
                        <ArrowUp className="h-4 w-4" />
                      ) : (
                        <ArrowDown className="h-4 w-4" />
                      )
                    ) : (
                      <ArrowUpDown className="h-4 w-4 opacity-40" />
                    )}
                  </div>
                </TableHead>
                <TableHead 
                  className="text-sm font-bold text-gray-800 h-12 cursor-pointer hover:bg-gray-100 transition-colors w-[100px]"
                  onClick={() => handleSort("assigned_staff")}
                >
                  <div className="flex items-center gap-1">
                    担当者
                    {sortField === "assigned_staff" ? (
                      sortDirection === "asc" ? (
                        <ArrowUp className="h-4 w-4" />
                      ) : (
                        <ArrowDown className="h-4 w-4" />
                      )
                    ) : (
                      <ArrowUpDown className="h-4 w-4 opacity-40" />
                    )}
                  </div>
                </TableHead>
                <TableHead 
                  className="text-sm font-bold text-gray-800 h-12 cursor-pointer hover:bg-gray-100 transition-colors w-[130px]"
                  onClick={() => handleSort("enrollment_date")}
                >
                  <div className="flex items-center gap-1">
                    入会日
                    {sortField === "enrollment_date" ? (
                      sortDirection === "asc" ? (
                        <ArrowUp className="h-4 w-4" />
                      ) : (
                        <ArrowDown className="h-4 w-4" />
                      )
                    ) : (
                      <ArrowUpDown className="h-4 w-4 opacity-40" />
                    )}
                  </div>
                </TableHead>
                <TableHead 
                  className="text-sm font-bold text-gray-800 h-12 cursor-pointer hover:bg-gray-100 transition-colors w-[130px]"
                  onClick={() => handleSort("last_meeting_date")}
                >
                  <div className="flex items-center gap-1">
                    最終面談日
                    {sortField === "last_meeting_date" ? (
                      sortDirection === "asc" ? (
                        <ArrowUp className="h-4 w-4" />
                      ) : (
                        <ArrowDown className="h-4 w-4" />
                      )
                    ) : (
                      <ArrowUpDown className="h-4 w-4 opacity-40" />
                    )}
                  </div>
                </TableHead>
                <TableHead className="text-sm font-bold text-gray-800 h-12 w-[130px]">最終打診日</TableHead>
                <TableHead 
                  className="text-sm font-bold text-gray-800 h-12 cursor-pointer hover:bg-gray-100 transition-colors w-[130px]"
                  onClick={() => handleSort("next_meeting_date")}
                >
                  <div className="flex items-center gap-1">
                    次回面談日
                    {sortField === "next_meeting_date" ? (
                      sortDirection === "asc" ? (
                        <ArrowUp className="h-4 w-4" />
                      ) : (
                        <ArrowDown className="h-4 w-4" />
                      )
                    ) : (
                      <ArrowUpDown className="h-4 w-4 opacity-40" />
                    )}
                  </div>
                </TableHead>
                <TableHead className="text-sm font-bold text-gray-800 h-12 min-w-[200px]">次のアクション</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredMembers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center text-gray-500">
                    {members.length === 0 
                      ? "会員データがありません。Supabaseの設定を確認してください。"
                      : "検索条件に一致する会員が見つかりませんでした。"}
                  </TableCell>
                </TableRow>
              ) : (
                filteredMembers.map((member) => (
                  <TableRow 
                    key={member.id} 
                    className="hover:bg-gray-50 transition-colors border-b border-gray-200 cursor-pointer"
                    onClick={() => router.push(`/members/${member.id}`)}
                  >
                    <TableCell className="font-mono text-sm text-gray-800 py-4 font-medium whitespace-nowrap">
                      {member.member_id}
                    </TableCell>
                    <TableCell className="py-4 whitespace-nowrap">
                      <Link
                        href={`/members/${member.id}`}
                        className="text-sm font-semibold text-gray-800 hover:text-blue-600 hover:underline transition-colors"
                      >
                        {member.name}
                      </Link>
                    </TableCell>
                    <TableCell className="py-4 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                      <EditableCell
                        value={member.status}
                        type="status"
                        options={["公開前", "お見合い", "仮交際", "真剣交際", "成婚退会", "休会", "退会"]}
                        onSave={(value) => handleUpdateField(member.id, "status", value)}
                      />
                    </TableCell>
                    <TableCell className="py-4 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                      <EditableCell
                        value={member.assigned_staff}
                        type="text"
                        onSave={(value) => handleUpdateField(member.id, "assigned_staff", value)}
                      />
                    </TableCell>
                    <TableCell className="text-sm text-gray-800 py-4 font-medium whitespace-nowrap">
                      {new Date(member.enrollment_date).toLocaleDateString('ja-JP', { year: 'numeric', month: '2-digit', day: '2-digit' }).replace(/\//g, '/')}
                    </TableCell>
                    <TableCell className="py-4" onClick={(e) => e.stopPropagation()}>
                      <EditableCell
                        value={member.last_meeting_date}
                        type="date"
                        onSave={(value) => handleUpdateField(member.id, "last_meeting_date", value)}
                      />
                    </TableCell>
                    <TableCell className="py-4" onClick={(e) => e.stopPropagation()}>
                      <EditableCell
                        value={member.last_contact_date}
                        type="date"
                        onSave={(value) => handleUpdateField(member.id, "last_contact_date", value)}
                      />
                    </TableCell>
                    <TableCell className="py-4" onClick={(e) => e.stopPropagation()}>
                      <EditableCell
                        value={member.next_meeting_date}
                        type="next_meeting_date"
                        meetingStatus={member.next_meeting_status}
                        onSave={(value, status) => handleUpdateField(member.id, "next_meeting_date", value, status)}
                      />
                    </TableCell>
                    <TableCell className="py-4" onClick={(e) => e.stopPropagation()}>
                      <EditableCell
                        value={member.next_action}
                        type="text"
                        onSave={(value) => handleUpdateField(member.id, "next_action", value)}
                      />
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
