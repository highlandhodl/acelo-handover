import { useMutation } from '@tanstack/react-query'
import { supabase } from '../../lib/supabaseClient'

interface GeneratePromptData {
  prompt: string
}

interface GeneratePromptResult {
  generatedText: string
}

export const useGeneratePrompt = () => {
  return useMutation({
    mutationFn: async ({ prompt }: GeneratePromptData): Promise<GeneratePromptResult> => {
      const { data, error } = await supabase.functions.invoke('generate-prompt', {
        body: { prompt }
      })

      if (error) throw error
      return data
    }
  })
}