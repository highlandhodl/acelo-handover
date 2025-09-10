import { useQuery } from '@tanstack/react-query'
import { supabase } from '../../lib/supabaseClient'
import { useAuth } from '../../context/AuthContext'

interface DashboardStats {
  totalAssets: number
  totalPrompts: number
  totalAutomations: number
  totalCoaches: number
  totalContexts: number
  activeAutomations: number
  recentActivity: number
}

export const useGetDashboardStats = () => {
  const { user } = useAuth()
  
  return useQuery({
    queryKey: ['dashboard-stats', user?.id],
    queryFn: async (): Promise<DashboardStats> => {
      if (!user?.id) throw new Error('No user ID')
      
      const [
        assetsCount,
        promptsCount, 
        automationsCount,
        coachesCount,
        contextsCount
      ] = await Promise.all([
        // Count assets
        supabase.storage
          .from('user-assets')
          .list(user.id, { limit: 1000 })
          .then(({ data }) => data?.length || 0),
          
        // Count prompts  
        supabase
          .from('prompts')
          .select('*', { count: 'exact' })
          .eq('user_id', user.id)
          .then(({ count }) => count || 0),
          
        // Count automations
        supabase
          .from('automations')
          .select('*', { count: 'exact' })
          .eq('user_id', user.id)
          .then(({ count }) => count || 0),
          
        // Count coaches
        supabase
          .from('coaches')
          .select('*', { count: 'exact' })
          .eq('user_id', user.id)
          .then(({ count }) => count || 0),
          
        // Count contexts
        supabase
          .from('contexts')
          .select('*', { count: 'exact' })
          .eq('user_id', user.id)
          .then(({ count }) => count || 0)
      ])

      // Count active automations
      const { count: activeAutomationsCount } = await supabase
        .from('automations')
        .select('*', { count: 'exact' })
        .eq('user_id', user.id)
        .eq('active', true)

      return {
        totalAssets: assetsCount,
        totalPrompts: promptsCount,
        totalAutomations: automationsCount,
        totalCoaches: coachesCount,
        totalContexts: contextsCount,
        activeAutomations: activeAutomationsCount || 0,
        recentActivity: 0, // Placeholder for recent activity count
      }
    },
    enabled: !!user
  })
}