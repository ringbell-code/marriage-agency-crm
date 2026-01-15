"use server"

import { supabase } from "@/lib/supabase"
import type { ActivityLog } from "@/lib/supabase"

export async function getActivityLogsByMemberId(
  memberId: string
): Promise<ActivityLog[]> {
  const { data, error } = await supabase
    .from("activity_logs")
    .select("*")
    .eq("member_id", memberId)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching activity logs:", error)
    return []
  }

  return data || []
}

export async function createActivityLog(
  memberId: string,
  type: string,
  content: string,
  sentiment: string | null = null
): Promise<{ success: boolean }> {
  const { error } = await supabase.from("activity_logs").insert({
    member_id: memberId,
    type,
    content,
    sentiment,
  })

  if (error) {
    console.error("Error creating activity log:", error)
    return { success: false }
  }

  return { success: true }
}
