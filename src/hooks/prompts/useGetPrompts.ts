import { useQuery } from '@tanstack/react-query'
import { supabase } from '../../lib/supabaseClient'
import { useAuth } from '../../context/AuthContext'
import { Prompt } from '../../types/prompt'

export const useGetPrompts = () => {
  const { user } = useAuth()
  
  return useQuery({
    queryKey: ['prompts', user?.id],
    queryFn: async (): Promise<Prompt[]> => {
      const { data, error } = await supabase
        .from('prompts')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false })
      
      if (error) throw error
      return data || []
    },
    enabled: !!user
  })
}