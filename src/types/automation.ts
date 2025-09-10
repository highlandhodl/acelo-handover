export interface Automation {
  id: string
  user_id: string
  name: string
  description?: string
  category?: string
  purpose?: string
  webhook_url?: string
  input_schema?: AutomationInputSchema
  default_email?: string
  active: boolean
  created_at: string
  updated_at?: string
}

export interface AutomationFormData {
  name: string
  description?: string
  category?: string
  purpose?: string
  webhook_url?: string
  active?: boolean
}

// Enhanced automation interface (extends existing)
export interface EnhancedAutomation extends Automation {
  purpose?: string
  webhook_url?: string
  input_schema?: AutomationInputSchema
}

// New interfaces for enhanced functionality
export interface AutomationInputSchema {
  type: "prompt_context_automation"
  requires_prompt: boolean
  requires_context: boolean
  default_prompt_id?: string
  default_context_ids?: string[]
}

export interface AutomationRunInputData {
  automation_type: "prompt_context"
  prompt?: {
    id: string
    title: string
    content: string
  }
  contexts?: Array<{
    id: string
    title: string
    content: string
  }>
  email_address: string
  timestamp: string
}

export interface EnhancedAutomationFormData {
  name: string
  description?: string
  purpose?: string
  webhook_url: string
  requires_prompt: boolean
  requires_context: boolean
  default_prompt_id?: string
  default_context_ids?: string[]
}

export interface AutomationExecutionData {
  automation_id: string
  prompt_id?: string
  context_ids?: string[]
  email_address: string
  custom_prompt_content?: string
  custom_context_content?: Record<string, string>
}

// Automation run interface
export interface AutomationRun {
  id: string
  automation_id: string
  user_id: string
  input_data?: AutomationRunInputData
  output_data?: Record<string, unknown>
  status: string
  error_message?: string
  duration_ms?: number
  created_at: string
  updated_at?: string
}

// N8N Webhook Payload Format
export interface N8NWebhookPayload {
  automation_id: string
  user_id: string
  timestamp: string
  email_address: string
  prompt?: {
    id: string
    title: string
    content: string
  }
  contexts?: Array<{
    id: string
    title: string
    content: string
  }>
}