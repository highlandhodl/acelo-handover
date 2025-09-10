import { useQuery } from '@tanstack/react-query'
import { supabase } from '../../lib/supabaseClient'
import { useAuth } from '../../context/AuthContext'
import { Coach } from '../../types/coach'

export const useGetCoaches = () => {
  const { user } = useAuth()
  
  return useQuery({
    queryKey: ['coaches', user?.id],
    queryFn: async (): Promise<Coach[]> => {
      const { data, error } = await supabase
        .from('coaches')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false })
      
      if (error) throw error
      return data || []
    },
    enabled: !!user
  })
}