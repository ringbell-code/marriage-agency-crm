"use client"

import { Member, NextMeetingStatus } from "@/lib/supabase"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { StatusBadge } from "@/components/status-badge"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { Calendar as CalendarIcon, Ban, UserX, Clock } from "lucide-react"
import { useState } from "react"
import { updateMemberStatus, updateMemberNextAction, updateMemberField, updateMemberNextMeetingDate } from "@/lib/actions/members"
import { useRouter } from "next/navigation"
import { format } from "date-fns"
import { ja } from "date-fns/locale"

interface MemberProfileCardProps {
  member: Member
}

const statusOptions = [
  "公開前",
  "お見合い",
  "仮交際",
  "真剣交際",
  "成婚退会",
  "休会",
  "退会",
]

export function MemberProfileCard({ member }: MemberProfileCardProps) {
  const router = useRouter()
  const [status, setStatus] = useState(member.status)
  const [assignedStaff, setAssignedStaff] = useState(member.assigned_staff)
  const [lastMeetingDate, setLastMeetingDate] = useState(member.last_meeting_date || "")
  const [lastContactDate, setLastContactDate] = useState(member.last_contact_date || "")
  const [nextMeetingDate, setNextMeetingDate] = useState(member.next_meeting_date || "")
  const [nextMeetingStatus, setNextMeetingStatus] = useState<NextMeetingStatus>(member.next_meeting_status || 'unset')
  const [nextAction, setNextAction] = useState(member.next_action || "")
  const [isUpdating, setIsUpdating] = useState(false)

  const handleStatusUpdate = async (newStatus: string) => {
    setStatus(newStatus)
    setIsUpdating(true)
    await updateMemberStatus(member.id, newStatus)
    setIsUpdating(false)
    router.refresh()
  }

  const handleDateUpdate = async (field: string, value: string) => {
    setIsUpdating(true)
    if (field === 'last_meeting_date' || field === 'last_contact_date') {
      await updateMemberField(member.id, field, value)
    }
    setIsUpdating(false)
    router.refresh()
  }

  const handleNextMeetingDateUpdate = async () => {
    setIsUpdating(true)
    await updateMemberNextMeetingDate(member.id, nextMeetingDate, nextMeetingStatus)
    setIsUpdating(false)
    router.refresh()
  }

  const handleAssignedStaffUpdate = async () => {
    setIsUpdating(true)
    await updateMemberField(member.id, "assigned_staff", assignedStaff)
    setIsUpdating(false)
    router.refresh()
  }

  const handleNextActionUpdate = async () => {
    setIsUpdating(true)
    await updateMemberNextAction(member.id, nextAction)
    setIsUpdating(false)
    router.refresh()
  }

  return (
    <div className="space-y-4">
      <Card className="border-gray-200 rounded-lg overflow-hidden">
        <CardHeader className="bg-white border-b border-gray-200">
          <CardTitle className="text-gray-800 text-base font-semibold">基本情報</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 bg-white pt-6">
          <div className="space-y-2">
            <Label className="text-gray-700 text-sm font-semibold">会員ID</Label>
            <p className="font-mono text-base text-gray-800 font-medium">{member.member_id}</p>
          </div>
          <div className="space-y-2">
            <Label className="text-gray-700 text-sm font-semibold">氏名</Label>
            <p className="text-xl font-bold text-gray-800">{member.name}</p>
          </div>
          <div className="space-y-2">
            <Label className="text-gray-700 text-sm font-semibold">ステータス</Label>
            <Select value={status} onValueChange={handleStatusUpdate} disabled={isUpdating}>
              <SelectTrigger className="border-2 border-gray-300 text-base font-semibold text-gray-800">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map((option) => (
                  <SelectItem key={option} value={option} className="text-base font-medium">
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-3">
            <Label className="text-gray-700 text-sm font-semibold">担当者</Label>
            <Input
              type="text"
              value={assignedStaff}
              onChange={(e) => setAssignedStaff(e.target.value)}
              className="border-2 border-gray-300 focus:border-blue-600 focus:ring-blue-600 text-base text-gray-800 font-medium"
            />
            <Button
              onClick={handleAssignedStaffUpdate}
              disabled={isUpdating || assignedStaff === member.assigned_staff}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold text-base h-11"
            >
              {isUpdating ? "更新中..." : "担当者を更新"}
            </Button>
          </div>
          <div className="space-y-2">
            <Label className="text-gray-700 text-sm font-semibold">入会日</Label>
            <p className="text-base text-gray-800 font-medium">
              {new Date(member.enrollment_date).toLocaleDateString('ja-JP')}
            </p>
          </div>
          <div className="space-y-2">
            <Label className="text-gray-700 text-sm font-semibold">最終面談日</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={`w-full justify-start text-left font-semibold bg-white border-2 hover:bg-gray-50 hover:border-gray-400 text-base ${lastMeetingDate ? 'border-gray-300 text-gray-800' : 'border-amber-400 bg-amber-50 text-amber-700'}`}
                  disabled={isUpdating}
                >
                  <CalendarIcon className={`mr-2 h-5 w-5 ${lastMeetingDate ? 'text-gray-700' : 'text-amber-600'}`} />
                  {lastMeetingDate
                    ? format(new Date(lastMeetingDate), "yyyy年MM月dd日", { locale: ja })
                    : <span className="font-semibold">未設定</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={lastMeetingDate ? new Date(lastMeetingDate) : undefined}
                  onSelect={(date) => {
                    if (date) {
                      const formatted = format(date, "yyyy-MM-dd")
                      setLastMeetingDate(formatted)
                      handleDateUpdate("last_meeting_date", formatted)
                    }
                  }}
                  locale={ja}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
          <div className="space-y-2">
            <Label className="text-gray-700 text-sm font-semibold">最終打診日</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={`w-full justify-start text-left font-semibold bg-white border-2 hover:bg-gray-50 hover:border-gray-400 text-base ${lastContactDate ? 'border-gray-300 text-gray-800' : 'border-amber-400 bg-amber-50 text-amber-700'}`}
                  disabled={isUpdating}
                >
                  <CalendarIcon className={`mr-2 h-5 w-5 ${lastContactDate ? 'text-gray-700' : 'text-amber-600'}`} />
                  {lastContactDate
                    ? format(new Date(lastContactDate), "yyyy年MM月dd日", { locale: ja })
                    : <span className="font-semibold">未設定</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={lastContactDate ? new Date(lastContactDate) : undefined}
                  onSelect={(date) => {
                    if (date) {
                      const formatted = format(date, "yyyy-MM-dd")
                      setLastContactDate(formatted)
                      handleDateUpdate("last_contact_date", formatted)
                    }
                  }}
                  locale={ja}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
          <div className="space-y-3">
            <Label className="text-gray-700 text-sm font-semibold">次回面談日</Label>
            
            <div className="flex gap-2 flex-wrap">
              <Button
                size="sm"
                variant={nextMeetingStatus === 'unset' ? 'default' : 'outline'}
                className={`h-9 text-xs font-bold ${
                  nextMeetingStatus === 'unset' 
                    ? 'bg-amber-600 text-white hover:bg-amber-700' 
                    : 'border-2 border-gray-300 text-gray-700'
                }`}
                onClick={() => {
                  setNextMeetingStatus('unset')
                  setNextMeetingDate('')
                }}
                disabled={isUpdating}
              >
                <Ban className="h-3 w-3 mr-1" />
                未設定
              </Button>
              <Button
                size="sm"
                variant={nextMeetingStatus === 'withdrawal' ? 'default' : 'outline'}
                className={`h-9 text-xs font-bold ${
                  nextMeetingStatus === 'withdrawal' 
                    ? 'bg-rose-600 text-white hover:bg-rose-700' 
                    : 'border-2 border-gray-300 text-gray-700'
                }`}
                onClick={() => {
                  setNextMeetingStatus('withdrawal')
                  setNextMeetingDate('')
                }}
                disabled={isUpdating}
              >
                <UserX className="h-3 w-3 mr-1" />
                退会予定
              </Button>
              <Button
                size="sm"
                variant={nextMeetingStatus === 'not_needed' ? 'default' : 'outline'}
                className={`h-9 text-xs font-bold ${
                  nextMeetingStatus === 'not_needed' 
                    ? 'bg-blue-600 text-white hover:bg-blue-700' 
                    : 'border-2 border-gray-300 text-gray-700'
                }`}
                onClick={() => {
                  setNextMeetingStatus('not_needed')
                  setNextMeetingDate('')
                }}
                disabled={isUpdating}
              >
                <Clock className="h-3 w-3 mr-1" />
                面談不要
              </Button>
            </div>

            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={`w-full justify-start text-left font-semibold bg-white border-2 hover:bg-gray-50 hover:border-gray-400 text-base ${
                    nextMeetingStatus === 'scheduled' && nextMeetingDate 
                      ? 'border-gray-300 text-gray-800' 
                      : 'border-gray-300 text-gray-500'
                  }`}
                  disabled={isUpdating}
                  onClick={() => setNextMeetingStatus('scheduled')}
                >
                  <CalendarIcon className="mr-2 h-5 w-5 text-gray-700" />
                  {nextMeetingStatus === 'scheduled' && nextMeetingDate
                    ? format(new Date(nextMeetingDate), "yyyy年MM月dd日", { locale: ja })
                    : <span className="font-semibold">日付を選択</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={nextMeetingStatus === 'scheduled' && nextMeetingDate ? new Date(nextMeetingDate) : undefined}
                  onSelect={(date) => {
                    if (date) {
                      const formatted = format(date, "yyyy-MM-dd")
                      setNextMeetingStatus('scheduled')
                      setNextMeetingDate(formatted)
                    }
                  }}
                  locale={ja}
                  initialFocus
                />
              </PopoverContent>
            </Popover>

            <Button
              onClick={handleNextMeetingDateUpdate}
              disabled={isUpdating}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold text-base h-11"
            >
              {isUpdating ? "更新中..." : "次回面談日を更新"}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="border-gray-200 rounded-lg overflow-hidden">
        <CardHeader className="bg-white border-b border-gray-200">
          <CardTitle className="text-gray-800 text-lg font-bold">次のアクション</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 bg-white pt-6">
          <Textarea
            value={nextAction}
            onChange={(e) => setNextAction(e.target.value)}
            placeholder="次回の対応内容を入力..."
            rows={4}
            className="border-2 border-gray-300 focus:border-blue-600 focus:ring-blue-600 text-base text-gray-800 font-medium"
          />
          <Button onClick={handleNextActionUpdate} disabled={isUpdating} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold text-base h-11">
            {isUpdating ? "更新中..." : "アクションを更新"}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
