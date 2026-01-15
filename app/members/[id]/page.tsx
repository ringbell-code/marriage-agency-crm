import { getMemberById } from "@/lib/actions/members"
import { getActivityLogsByMemberId } from "@/lib/actions/activity-logs"
import { notFound } from "next/navigation"
import { MemberProfileCard } from "@/components/member-profile-card"
import { ActivitySection } from "@/components/activity-section"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

interface MemberPageProps {
  params: Promise<{ id: string }>
}

export default async function MemberPage({ params }: MemberPageProps) {
  const { id } = await params
  const member = await getMemberById(id)

  if (!member) {
    notFound()
  }

  const activityLogs = await getActivityLogsByMemberId(id)

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild className="hover:bg-gray-100">
          <Link href="/">
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
          <MemberProfileCard member={member} />
        </div>

        <div className="md:col-span-2">
          <ActivitySection memberId={id} logs={activityLogs} />
        </div>
      </div>
    </div>
  )
}
