import { useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../../lib/supabaseClient'
import { useAuth } from '../../context/AuthContext'
import { CoachFormData } from '../../types/coach'

export const useCreateCoach = () => {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (data: CoachFormData) => {
      const { data: coach, error } = await supabase
        .from('coaches')
        .insert({
          ...data,
          user_id: user?.id,
        })
        .select()
      
      if (error) throw error
      return coach[0]
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['coaches'] })
    }
  })
}