"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Search } from "lucide-react"
import { cn } from "@/lib/utils"

interface MemberFiltersProps {
  onFilterChange: (filters: FilterState) => void
  staffList: string[]
}

export interface FilterState {
  statuses: string[]
  assignedStaff: string
  enrollmentPeriod: string
  keyword: string
  lastMeetingDateFilter: string
  lastContactDateFilter: string
  nextMeetingDateFilter: string
}

const statusTabs = [
  { value: "all", label: "すべて" },
  { value: "公開前", label: "公開前" },
  { value: "お見合い", label: "お見合い" },
  { value: "仮交際", label: "仮交際" },
  { value: "真剣交際", label: "真剣交際" },
  { value: "成婚退会", label: "成婚退会" },
  { value: "休会", label: "休会" },
  { value: "退会", label: "退会" },
]

// staffOptionsは動的に生成されるため削除

const periodOptions = [
  { value: "all", label: "すべて" },
  { value: "thisMonth", label: "今月" },
  { value: "thisYear", label: "今年" },
  { value: "lastYear", label: "昨年" },
]

const dateFilterOptions = [
  { value: "all", label: "すべて" },
  { value: "set", label: "設定済み" },
  { value: "unset", label: "未設定" },
]

export function MemberFilters({ onFilterChange, staffList }: MemberFiltersProps) {
  const [filters, setFilters] = useState<FilterState>({
    statuses: [],
    assignedStaff: "all",
    enrollmentPeriod: "all",
    keyword: "",
    lastMeetingDateFilter: "all",
    lastContactDateFilter: "all",
    nextMeetingDateFilter: "all",
  })

  const handleFilterChange = (key: keyof FilterState, value: string | string[]) => {
    const newFilters = { ...filters, [key]: value }
    setFilters(newFilters)
    onFilterChange(newFilters)
  }

  const handleStatusToggle = (status: string) => {
    const currentStatuses = filters.statuses
    const newStatuses = currentStatuses.includes(status)
      ? currentStatuses.filter(s => s !== status)
      : [...currentStatuses, status]
    handleFilterChange("statuses", newStatuses)
  }

  return (
    <div className="space-y-4 mb-6">
      {/* ステータスチェックボックス（複数選択） */}
      <div className="space-y-2">
        <span className="text-base font-bold text-gray-800">状態（複数選択可）:</span>
        <div className="flex items-center gap-4 flex-wrap">
          {statusTabs.filter(tab => tab.value !== "all").map((tab) => (
            <div key={tab.value} className="flex items-center space-x-2">
              <Checkbox
                id={`status-${tab.value}`}
                checked={filters.statuses.includes(tab.value)}
                onCheckedChange={() => handleStatusToggle(tab.value)}
                className="border-2 border-gray-300 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
              />
              <label
                htmlFor={`status-${tab.value}`}
                className="text-sm font-medium text-gray-800 cursor-pointer"
              >
                {tab.label}
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* 検索フィールド */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* 担当者 */}
        <div className="space-y-1.5">
          <label className="text-sm font-semibold text-gray-700">担当者</label>
          <Select
            value={filters.assignedStaff}
            onValueChange={(value) => handleFilterChange("assignedStaff", value)}
          >
            <SelectTrigger className="h-10 border-2 border-gray-300 focus:border-gray-500 focus:ring-gray-500 rounded-md text-sm font-medium">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all" className="text-sm font-medium">すべて</SelectItem>
              {staffList.map((staff) => (
                <SelectItem key={staff} value={staff} className="text-sm font-medium">
                  {staff}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* 入会時期 */}
        <div className="space-y-1.5">
          <label className="text-sm font-semibold text-gray-700">入会時期</label>
          <Select
            value={filters.enrollmentPeriod}
            onValueChange={(value) => handleFilterChange("enrollmentPeriod", value)}
          >
            <SelectTrigger className="h-10 border-2 border-gray-300 focus:border-gray-500 focus:ring-gray-500 rounded-md text-sm font-medium">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {periodOptions.map((option) => (
                <SelectItem key={option.value} value={option.value} className="text-sm font-medium">
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* 最終面談日 */}
        <div className="space-y-1.5">
          <label className="text-sm font-semibold text-gray-700">最終面談日</label>
          <Select
            value={filters.lastMeetingDateFilter}
            onValueChange={(value) => handleFilterChange("lastMeetingDateFilter", value)}
          >
            <SelectTrigger className="h-10 border-2 border-gray-300 focus:border-gray-500 focus:ring-gray-500 rounded-md text-sm font-medium">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {dateFilterOptions.map((option) => (
                <SelectItem key={option.value} value={option.value} className="text-sm font-medium">
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* 最終打診日 */}
        <div className="space-y-1.5">
          <label className="text-sm font-semibold text-gray-700">最終打診日</label>
          <Select
            value={filters.lastContactDateFilter}
            onValueChange={(value) => handleFilterChange("lastContactDateFilter", value)}
          >
            <SelectTrigger className="h-10 border-2 border-gray-300 focus:border-gray-500 focus:ring-gray-500 rounded-md text-sm font-medium">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {dateFilterOptions.map((option) => (
                <SelectItem key={option.value} value={option.value} className="text-sm font-medium">
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* 次回面談日 */}
        <div className="space-y-1.5">
          <label className="text-sm font-semibold text-gray-700">次回面談日</label>
          <Select
            value={filters.nextMeetingDateFilter}
            onValueChange={(value) => handleFilterChange("nextMeetingDateFilter", value)}
          >
            <SelectTrigger className="h-10 border-2 border-gray-300 focus:border-gray-500 focus:ring-gray-500 rounded-md text-sm font-medium">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {dateFilterOptions.map((option) => (
                <SelectItem key={option.value} value={option.value} className="text-sm font-medium">
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* キーワード検索 */}
        <div className="space-y-1.5">
          <label className="text-sm font-semibold text-gray-700">キーワード</label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
            <Input
              type="text"
              placeholder="会員名、IDで検索"
              value={filters.keyword}
              onChange={(e) => handleFilterChange("keyword", e.target.value)}
              className="h-10 pl-10 border-2 border-gray-300 focus:border-gray-500 focus:ring-gray-500 rounded-md text-sm font-medium"
            />
          </div>
        </div>
      </div>
    </div>
  )
}
