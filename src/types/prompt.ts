export interface Prompt {
  id: string
  name?: string
  title?: string
  description?: string
  category?: string
  purpose?: string
  prompt_content?: string
  status?: string
  current_version?: number
  created_at: string
  updated_at?: string
}

export interface PromptVersion {
  id: string
  prompt_id: string
  title: string
  content: string
  version_number: number
  created_at: string
}

export interface PromptFormData {
  name: string
  description?: string
  category?: string
  title: string
  content: string
}