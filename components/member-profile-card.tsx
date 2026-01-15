"use client"

import { Member } from "@/lib/supabase"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { StatusBadge } from "@/components/status-badge"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { Calendar as CalendarIcon, Ban, UserX, Clock } from "lucide-react"
import { useState } from "react"
import { updateMemberStatus, updateMemberField } from "@/lib/actions/members"
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
  const [lastMeetingDate, setLastMeetingDate] = useState(member.last_meeting_date || "")
  const [lastContactDate, setLastContactDate] = useState(member.last_contact_date || "")
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
          <div className="space-y-2">
            <Label className="text-gray-700 text-sm font-semibold">担当者</Label>
            <div className="p-3 border-2 border-gray-200 rounded-lg bg-gray-50">
              <p className="text-gray-800 font-semibold">{member.assigned_staff}</p>
            </div>
            <p className="text-xs text-gray-500">※ アクティビティログから更新できます</p>
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
          <div className="space-y-2">
            <Label className="text-gray-700 text-sm font-semibold">次回面談日</Label>
            <div className="p-3 border-2 border-gray-200 rounded-lg bg-gray-50">
              {member.next_meeting_status === 'scheduled' && member.next_meeting_date ? (
                <div className="flex items-center gap-2 text-gray-800 font-semibold">
                  <CalendarIcon className="h-4 w-4 text-blue-600" />
                  {format(new Date(member.next_meeting_date), "yyyy年MM月dd日", { locale: ja })}
                </div>
              ) : member.next_meeting_status === 'withdrawal' ? (
                <div className="flex items-center gap-2 text-rose-700 font-semibold">
                  <UserX className="h-4 w-4" />
                  退会予定
                </div>
              ) : member.next_meeting_status === 'not_needed' ? (
                <div className="flex items-center gap-2 text-blue-700 font-semibold">
                  <Clock className="h-4 w-4" />
                  面談不要
                </div>
              ) : (
                <div className="flex items-center gap-2 text-amber-700 font-semibold">
                  <Ban className="h-4 w-4" />
                  未設定
                </div>
              )}
            </div>
            <p className="text-xs text-gray-500">※ アクティビティログから更新できます</p>
          </div>
        </CardContent>
      </Card>

      <Card className="border-gray-200 rounded-lg overflow-hidden">
        <CardHeader className="bg-white border-b border-gray-200">
          <CardTitle className="text-gray-800 text-lg font-bold">次のアクション</CardTitle>
        </CardHeader>
        <CardContent className="bg-white pt-6">
          <div className="p-4 border-2 border-gray-200 rounded-lg bg-gray-50 min-h-[100px]">
            {member.next_action ? (
              <p className="text-gray-800 font-medium whitespace-pre-wrap">{member.next_action}</p>
            ) : (
              <p className="text-gray-400 font-medium">未設定</p>
            )}
          </div>
          <p className="text-xs text-gray-500 mt-2">※ アクティビティログから更新できます</p>
        </CardContent>
      </Card>
    </div>
  )
}
