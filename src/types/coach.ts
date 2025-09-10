export interface Coach {
  id: string
  name: string
  description: string | null
  voice_name?: string | null
  voice_id?: string | null
  category: string | null
  rating?: number
  available?: boolean
  agent_id?: string | null
  external_url?: string | null
  personality?: string
  created_at: string
  updated_at?: string
}

export interface CoachFormData {
  name: string
  description?: string
  category?: string
  personality?: string
}