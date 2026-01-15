"use client"

import { useEffect, useState } from "react"
import { getMemberById } from "@/lib/actions/members"
import { getActivityLogsByMemberId } from "@/lib/actions/activity-logs"
import { MemberProfileCard } from "@/components/member-profile-card"
import { ActivitySection } from "@/components/activity-section"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { Member, ActivityLog } from "@/lib/supabase"
import { useParams } from "next/navigation"

export default function MemberPage() {
  const params = useParams()
  const id = params.id as string
  const [member, setMember] = useState<Member | null>(null)
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [refreshKey, setRefreshKey] = useState(0)

  const fetchData = async () => {
    setIsLoading(true)
    const memberData = await getMemberById(id)
    const logsData = await getActivityLogsByMemberId(id)
    
    setMember(memberData)
    setActivityLogs(logsData)
    setIsLoading(false)
  }

  useEffect(() => {
    fetchData()
  }, [id, refreshKey])

  const handleDataUpdate = () => {
    setRefreshKey(prev => prev + 1)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-600">読み込み中...</div>
      </div>
    )
  }

  if (!member) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-600">会員が見つかりませんでした</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild className="hover:bg-gray-100">
          <Link href="/members">
            <ArrowLeft className="h-5 w-5 text-gray-700" />
          </Link>
        </Button>
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-gray-800">{member.name}</h1>
          <p className="text-gray-700 mt-1 text-base font-medium">会員ID: {member.member_id}</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-1">
          <MemberProfileCard member={member} key={refreshKey} />
        </div>

        <div className="md:col-span-2">
          <ActivitySection memberId={id} logs={activityLogs} onUpdate={handleDataUpdate} />
        </div>
      </div>
    </div>
  )
}
