import { useQuery } from '@tanstack/react-query'
import { supabase } from '../../lib/supabaseClient'
import { useAuth } from '../../context/AuthContext'
import { AutomationRun } from '../../types/automation'

interface GetAutomationRunsOptions {
  automationId?: string
  limit?: number
  offset?: number
}

export const useGetAutomationRuns = (options: GetAutomationRunsOptions = {}) => {
  const { user } = useAuth()
  const { automationId, limit = 50, offset = 0 } = options
  
  return useQuery({
    queryKey: ['automation-runs', user?.id, automationId, limit, offset],
    queryFn: async (): Promise<AutomationRun[]> => {
      let query = supabase
        .from('automation_runs')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1)
      
      if (automationId) {
        query = query.eq('automation_id', automationId)
      }
      
      const { data, error } = await query
      
      if (error) throw error
      return data || []
    },
    enabled: !!user
  })
}

export const useGetAutomationRun = (runId: string) => {
  const { user } = useAuth()
  
  return useQuery({
    queryKey: ['automation-run', runId, user?.id],
    queryFn: async (): Promise<AutomationRun | null> => {
      const { data, error } = await supabase
        .from('automation_runs')
        .select('*')
        .eq('id', runId)
        .eq('user_id', user?.id)
        .single()
      
      if (error) {
        if (error.code === 'PGRST116') {
          return null // No rows found
        }
        throw error
      }
      return data
    },
    enabled: !!user && !!runId
  })
}