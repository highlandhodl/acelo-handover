import { useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../../lib/supabaseClient'
import { useAuth } from '../../context/AuthContext'
import { PromptFormData } from '../../types/prompt'

export const useCreatePrompt = () => {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (data: PromptFormData) => {
      // First create the prompt
      const { data: prompt, error: promptError } = await supabase
        .from('prompts')
        .insert({
          name: data.name,
          description: data.description,
          category: data.category,
          current_version: 1,
          user_id: user?.id,
        })
        .select()
      
      if (promptError) throw promptError
      
      // Then create the first version
      const { data: version, error: versionError } = await supabase
        .from('prompt_versions')
        .insert({
          prompt_id: prompt[0].id,
          title: data.title,
          content: data.content,
          version_number: 1,
          user_id: user?.id,
        })
        .select()
      
      if (versionError) throw versionError
      
      return { prompt: prompt[0], version: version[0] }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['prompts'] })
    }
  })
}