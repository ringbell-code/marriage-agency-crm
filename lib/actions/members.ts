"use server"

import { supabase } from "@/lib/supabase"
import type { Member, NextMeetingStatus } from "@/lib/supabase"

export async function getMembers(): Promise<Member[]> {
  const { data, error } = await supabase
    .from("members")
    .select("*")
    .order("updated_at", { ascending: false })

  if (error) {
    console.error("Error fetching members:", error)
    return []
  }

  return data || []
}

export async function getMemberById(id: string): Promise<Member | null> {
  const { data, error } = await supabase
    .from("members")
    .select("*")
    .eq("id", id)
    .single()

  if (error) {
    console.error("Error fetching member:", error)
    return null
  }

  return data
}

export async function updateMemberStatus(
  id: string,
  status: string
): Promise<{ success: boolean }> {
  const { error } = await supabase
    .from("members")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", id)

  if (error) {
    console.error("Error updating member status:", error)
    return { success: false }
  }

  return { success: true }
}

export async function updateMemberNextAction(
  id: string,
  nextAction: string
): Promise<{ success: boolean }> {
  const { error } = await supabase
    .from("members")
    .update({ next_action: nextAction, updated_at: new Date().toISOString() })
    .eq("id", id)

  if (error) {
    console.error("Error updating member next action:", error)
    return { success: false }
  }

  return { success: true }
}

export async function updateMemberField(
  id: string,
  field: string,
  value: string | null
): Promise<{ success: boolean }> {
  const { error } = await supabase
    .from("members")
    .update({ [field]: value, updated_at: new Date().toISOString() })
    .eq("id", id)

  if (error) {
    console.error(`Error updating member ${field}:`, error)
    return { success: false }
  }

  return { success: true }
}

export async function updateMemberNextMeetingDate(
  id: string,
  date: string | null,
  status: NextMeetingStatus
): Promise<{ success: boolean }> {
  const updateData: any = {
    next_meeting_status: status,
    updated_at: new Date().toISOString()
  }

  // scheduledの場合のみ日付を保存
  if (status === 'scheduled' && date) {
    updateData.next_meeting_date = date
  } else {
    updateData.next_meeting_date = null
  }

  const { error } = await supabase
    .from("members")
    .update(updateData)
    .eq("id", id)

  if (error) {
    console.error("Error updating member next meeting date:", error)
    return { success: false }
  }

  return { success: true }
}

export async function addMember(data: {
  member_id: string
  name: string
  status: string
  assigned_staff: string
  enrollment_date: string
}): Promise<{ success: boolean; error?: string }> {
  const { error } = await supabase
    .from("members")
    .insert({
      member_id: data.member_id,
      name: data.name,
      status: data.status,
      assigned_staff: data.assigned_staff,
      enrollment_date: data.enrollment_date,
      next_meeting_status: 'unset',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })

  if (error) {
    console.error("Error adding member:", error)
    return { success: false, error: error.message }
  }

  return { success: true }
}
