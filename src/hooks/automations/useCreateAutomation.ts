import { useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../../lib/supabaseClient'
import { useAuth } from '../../context/AuthContext'
import { AutomationFormData, EnhancedAutomationFormData, AutomationInputSchema } from '../../types/automation'

export const useCreateAutomation = () => {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (data: AutomationFormData) => {
      const { data: automation, error } = await supabase
        .from('automations')
        .insert({
          ...data,
          user_id: user?.id,
        })
        .select()
      
      if (error) throw error
      return automation[0]
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['automations'] })
    }
  })
}

export const useCreateEnhancedAutomation = () => {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (data: EnhancedAutomationFormData) => {
      const inputSchema: AutomationInputSchema = {
        type: "prompt_context_automation",
        requires_prompt: data.requires_prompt,
        requires_context: data.requires_context,
        default_prompt_id: data.default_prompt_id,
        default_context_ids: data.default_context_ids
      }

      const { data: automation, error } = await supabase
        .from('automations')
        .insert({
          name: data.name,
          description: data.description,
          purpose: data.purpose,
          webhook_url: data.webhook_url,
          input_schema: inputSchema,
          active: true,
          user_id: user?.id,
        })
        .select()
      
      if (error) throw error
      return automation[0]
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['automations'] })
    }
  })
}