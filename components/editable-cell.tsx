"use client"

import { useState } from "react"
import { Check, X, Calendar, Edit2, Ban, UserX, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { StatusBadge } from "@/components/status-badge"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import { format } from "date-fns"
import { ja } from "date-fns/locale"
import { NextMeetingStatus } from "@/lib/supabase"

type EditableCellProps = {
  value: string | null
  type: "status" | "date" | "next_meeting_date" | "text" | "textarea"
  onSave: (value: string | null, status?: NextMeetingStatus) => Promise<void>
  options?: string[]
  meetingStatus?: NextMeetingStatus
}

export function EditableCell({ value, type, onSave, options = [], meetingStatus = 'unset' }: EditableCellProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editValue, setEditValue] = useState(value || "")
  const [editMeetingStatus, setEditMeetingStatus] = useState<NextMeetingStatus>(meetingStatus)
  const [isSaving, setIsSaving] = useState(false)

  const handleSave = async () => {
    setIsSaving(true)
    try {
      if (type === "next_meeting_date") {
        await onSave(editValue || null, editMeetingStatus)
      } else {
        await onSave(editValue || null)
      }
      setIsEditing(false)
    } catch (error) {
      console.error("保存に失敗しました:", error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancel = () => {
    setEditValue(value || "")
    setEditMeetingStatus(meetingStatus)
    setIsEditing(false)
  }

  if (!isEditing) {
    return (
      <div className="group flex items-center gap-2">
        {type === "status" ? (
          <StatusBadge status={value || ""} />
        ) : type === "date" ? (
          <div className={`px-3 py-1.5 rounded-md ${value ? 'bg-white' : 'bg-amber-100 border border-amber-300'}`}>
            <span className={`text-sm font-medium ${value ? 'text-gray-800' : 'text-amber-700'}`}>
              {value ? format(new Date(value), "yyyy/MM/dd", { locale: ja }) : "未設定"}
            </span>
          </div>
        ) : type === "next_meeting_date" ? (
          <div className={`px-3 py-1.5 rounded-md ${
            meetingStatus === 'scheduled' && value ? 'bg-white' : 
            meetingStatus === 'withdrawal' ? 'bg-rose-100 border border-rose-300' :
            meetingStatus === 'not_needed' ? 'bg-blue-100 border border-blue-300' :
            'bg-amber-100 border border-amber-300'
          }`}>
            <span className={`text-sm font-medium ${
              meetingStatus === 'scheduled' && value ? 'text-gray-800' :
              meetingStatus === 'withdrawal' ? 'text-rose-700' :
              meetingStatus === 'not_needed' ? 'text-blue-700' :
              'text-amber-700'
            }`}>
              {meetingStatus === 'scheduled' && value ? format(new Date(value), "yyyy/MM/dd", { locale: ja }) :
               meetingStatus === 'withdrawal' ? '退会予定' :
               meetingStatus === 'not_needed' ? '面談不要' :
               '未設定'}
            </span>
          </div>
        ) : (
          <span className="text-sm text-gray-800">{value || "-"}</span>
        )}
        <Button
          variant="ghost"
          size="sm"
          className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-gray-100"
          onClick={() => setIsEditing(true)}
        >
          <Edit2 className="h-3 w-3 text-gray-600" />
        </Button>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-1.5">
      {type === "status" ? (
        <Select value={editValue} onValueChange={setEditValue}>
          <SelectTrigger className="h-9 text-sm w-[140px] border-2 border-gray-600 bg-white font-medium text-gray-800">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {options.map((option) => (
              <SelectItem key={option} value={option} className="text-sm font-medium">
                {option}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ) : type === "date" ? (
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="h-9 text-sm w-[140px] justify-start border-2 border-gray-600 bg-white font-medium hover:bg-gray-50 text-gray-800">
              <Calendar className="mr-2 h-4 w-4 text-gray-700" />
              {editValue ? format(new Date(editValue), "yyyy/MM/dd", { locale: ja }) : "日付を選択"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <CalendarComponent
              mode="single"
              selected={editValue ? new Date(editValue) : undefined}
              onSelect={(date) => {
                if (date) {
                  setEditValue(format(date, "yyyy-MM-dd"))
                }
              }}
              locale={ja}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      ) : type === "next_meeting_date" ? (
        <div className="flex flex-col gap-2 p-3 bg-white border-2 border-gray-600 rounded-md shadow-lg">
          <div className="flex gap-2 flex-wrap">
            <Button
              size="sm"
              variant={editMeetingStatus === 'unset' ? 'default' : 'outline'}
              className={`h-8 text-xs font-bold ${
                editMeetingStatus === 'unset' 
                  ? 'bg-amber-600 text-white hover:bg-amber-700' 
                  : 'border-2 border-gray-300 text-gray-700'
              }`}
              onClick={() => {
                setEditMeetingStatus('unset')
                setEditValue('')
              }}
            >
              <Ban className="h-3 w-3 mr-1" />
              未設定
            </Button>
            <Button
              size="sm"
              variant={editMeetingStatus === 'withdrawal' ? 'default' : 'outline'}
              className={`h-8 text-xs font-bold ${
                editMeetingStatus === 'withdrawal' 
                  ? 'bg-rose-600 text-white hover:bg-rose-700' 
                  : 'border-2 border-gray-300 text-gray-700'
              }`}
              onClick={() => {
                setEditMeetingStatus('withdrawal')
                setEditValue('')
              }}
            >
              <UserX className="h-3 w-3 mr-1" />
              退会予定
            </Button>
            <Button
              size="sm"
              variant={editMeetingStatus === 'not_needed' ? 'default' : 'outline'}
              className={`h-8 text-xs font-bold ${
                editMeetingStatus === 'not_needed' 
                  ? 'bg-blue-600 text-white hover:bg-blue-700' 
                  : 'border-2 border-gray-300 text-gray-700'
              }`}
              onClick={() => {
                setEditMeetingStatus('not_needed')
                setEditValue('')
              }}
            >
              <Clock className="h-3 w-3 mr-1" />
              面談不要
            </Button>
          </div>
          <div className="pt-2 border-t border-gray-200">
            <Popover>
              <PopoverTrigger asChild>
                <Button 
                  variant="outline" 
                  className={`h-9 text-sm w-full justify-start border-2 font-medium hover:bg-gray-50 ${
                    editMeetingStatus === 'scheduled' 
                      ? 'border-gray-600 bg-white text-gray-800' 
                      : 'border-gray-300 bg-gray-50 text-gray-500'
                  }`}
                  onClick={() => setEditMeetingStatus('scheduled')}
                >
                  <Calendar className="mr-2 h-4 w-4" />
                  {editMeetingStatus === 'scheduled' && editValue 
                    ? format(new Date(editValue), "yyyy/MM/dd", { locale: ja }) 
                    : "日付を選択"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <CalendarComponent
                  mode="single"
                  selected={editValue && editMeetingStatus === 'scheduled' ? new Date(editValue) : undefined}
                  onSelect={(date) => {
                    if (date) {
                      setEditMeetingStatus('scheduled')
                      setEditValue(format(date, "yyyy-MM-dd"))
                    }
                  }}
                  locale={ja}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>
      ) : type === "textarea" ? (
        <Textarea
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          className="h-20 text-sm w-full border-2 border-gray-600 bg-white text-gray-800 font-medium"
          autoFocus
        />
      ) : (
        <Input
          type="text"
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          className="h-9 text-sm w-[200px] border-2 border-gray-600 bg-white text-gray-800 font-medium"
          autoFocus
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handleSave()
            } else if (e.key === "Escape") {
              handleCancel()
            }
          }}
        />
      )}
      <Button
        size="sm"
        className="h-9 w-9 p-0 bg-emerald-600 text-white hover:bg-emerald-700"
        onClick={handleSave}
        disabled={isSaving}
      >
        <Check className="h-4 w-4" />
      </Button>
      <Button
        size="sm"
        variant="outline"
        className="h-9 w-9 p-0 border-2 border-gray-400 text-gray-700 hover:bg-gray-100"
        onClick={handleCancel}
        disabled={isSaving}
      >
        <X className="h-4 w-4" />
      </Button>
    </div>
  )
}
