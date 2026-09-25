import { createClient } from '@supabase/supabase-js'
import type { Database } from "@/types/database"

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || ''
// Support both new publishable keys (sb_publishable_...) and legacy anon keys (eyJ...)
const supabaseKey =
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  ''

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
  supabaseKey &&
  !supabaseUrl.includes('your-project-ref') &&
  !supabaseKey.includes('your_key_here')
)

if (!isSupabaseConfigured && import.meta.env.DEV) {
  console.warn(
    '[Supabase] Missing or placeholder credentials. Please set VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY in your .env file.'
  )
}

export const supabase = createClient<Database>(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseKey || 'placeholder-key'
)

// TypeScript helper types for Habit Tracker
export interface Habit {
  id: string
  user_id?: string
  name: string
  description?: string
  frequency: 'daily' | 'weekly' | 'custom'
  target_days_per_week?: number
  color?: string
  icon?: string
  created_at: string
  archived?: boolean
}

export interface HabitLog {
  id: string
  habit_id: string
  completed_date: string // YYYY-MM-DD
  notes?: string
  created_at: string
}
