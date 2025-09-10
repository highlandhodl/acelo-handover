import { useQuery } from '@tanstack/react-query'
import { supabase } from '../../lib/supabaseClient'
import { Automation } from '../../types/automation'

export const useGetAutomation = (automationId?: string) => {
  return useQuery({
    queryKey: ['automation', automationId],
    queryFn: async (): Promise<Automation> => {
      if (!automationId) throw new Error('No automation ID provided')
      
      const { data, error } = await supabase
        .from('automations')
        .select('*')
        .eq('id', automationId)
        .single()

      if (error) throw error
      return data
    },
    enabled: !!automationId
  })
}