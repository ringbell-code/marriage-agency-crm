import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Type definitions
export type NextMeetingStatus = 'scheduled' | 'withdrawal' | 'not_needed' | 'unset'

export type Member = {
  id: string
  member_id: string
  name: string
  status: string
  assigned_staff: string
  enrollment_date: string
  last_meeting_date: string | null
  last_contact_date: string | null
  next_meeting_date: string | null
  next_meeting_status: NextMeetingStatus
  next_action: string | null
  created_at: string
  updated_at: string
}

export type ActivityLog = {
  id: string
  member_id: string
  type: string
  content: string
  summary: string | null
  sentiment: string | null
  created_at: string
}
