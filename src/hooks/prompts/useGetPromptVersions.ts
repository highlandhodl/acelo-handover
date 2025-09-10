import { useQuery } from '@tanstack/react-query'
import { supabase } from '../../lib/supabaseClient'
import { useAuth } from '../../context/AuthContext'
import { PromptVersion } from '../../types/prompt'

export const useGetPromptVersions = (promptId?: string) => {
  const { user } = useAuth()
  
  return useQuery({
    queryKey: ['prompt-versions', promptId, user?.id],
    queryFn: async (): Promise<PromptVersion[]> => {
      if (!promptId) return []
      
      const { data, error } = await supabase
        .from('prompt_versions')
        .select('*')
        .eq('prompt_id', promptId)
        .eq('user_id', user?.id)
        .order('version_number', { ascending: false })
      
      if (error) throw error
      return data || []
    },
    enabled: !!user && !!promptId
  })
}