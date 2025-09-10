import { useQuery } from '@tanstack/react-query'
import { supabase } from '../../lib/supabaseClient'
import { Prompt } from '../../types/prompt'

export const useGetPrompt = (promptId?: string) => {
  return useQuery({
    queryKey: ['prompt', promptId],
    queryFn: async (): Promise<Prompt> => {
      if (!promptId) throw new Error('No prompt ID provided')
      
      const { data, error } = await supabase
        .from('prompts')
        .select('*')
        .eq('id', promptId)
        .single()

      if (error) throw error
      return data
    },
    enabled: !!promptId
  })
}