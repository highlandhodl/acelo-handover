import { useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../../lib/supabaseClient'
import { useAuth } from '../../context/AuthContext'
import { AutomationExecutionData, AutomationRunInputData, N8NWebhookPayload } from '../../types/automation'

interface RunAutomationData {
  automationId: string
  inputData: Record<string, unknown>
}

interface AutomationRunResult {
  runId: string
  status: string
  output?: Record<string, unknown> | string
  duration?: number
  success: boolean
}

export const useRunAutomation = () => {
  return useMutation({
    mutationFn: async ({ automationId, inputData }: RunAutomationData): Promise<AutomationRunResult> => {
      const { data, error } = await supabase.functions.invoke('invoke-automation', {
        body: {
          automationId,
          inputData
        }
      })

      if (error) throw error
      return data
    }
  })
}

export const useRunEnhancedAutomation = () => {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (executionData: AutomationExecutionData): Promise<AutomationRunResult> => {
      // Prepare the input data in the enhanced format
      const inputData: AutomationRunInputData = {
        automation_type: "prompt_context",
        email_address: executionData.email_address,
        timestamp: new Date().toISOString()
      }

      // Add prompt data if provided
      if (executionData.custom_prompt_content) {
        inputData.prompt = {
          id: executionData.prompt_id || 'custom',
          title: executionData.prompt_id ? 'Selected Prompt' : 'Custom Prompt',
          content: executionData.custom_prompt_content
        }
      }

      // Add context data if provided
      if (executionData.custom_context_content && Object.keys(executionData.custom_context_content).length > 0) {
        inputData.contexts = []
        
        Object.entries(executionData.custom_context_content).forEach(([contextId, content]) => {
          if (content.trim()) {
            inputData.contexts?.push({
              id: contextId,
              title: `Context ${contextId.slice(0, 8)}...`,
              content: content
            })
          }
        })
      }

      const { data, error } = await supabase.functions.invoke('invoke-automation', {
        body: {
          automationId: executionData.automation_id,
          inputData
        }
      })

      if (error) throw error
      return data
    },
    onSuccess: () => {
      // Invalidate automation runs to refresh the history
      queryClient.invalidateQueries({ queryKey: ['automation-runs'] })
    }
  })
}