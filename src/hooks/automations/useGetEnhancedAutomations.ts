import { useQuery } from '@tanstack/react-query'
import { supabase } from '../../lib/supabaseClient'
import { useAuth } from '../../context/AuthContext'
import { EnhancedAutomation } from '../../types/automation'

export const useGetEnhancedAutomations = () => {
  const { user } = useAuth()
  
  return useQuery({
    queryKey: ['enhanced-automations', user?.id],
    queryFn: async (): Promise<EnhancedAutomation[]> => {
      const { data, error } = await supabase
        .from('automations')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false })
      
      if (error) throw error
      return data || []
    },
    enabled: !!user
  })
}