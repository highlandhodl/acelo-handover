import { useMutation } from '@tanstack/react-query'
import { supabase } from '../../lib/supabaseClient'

interface SignInData {
  email: string
  password: string
}

export const useSignIn = () => {
  return useMutation({
    mutationFn: async ({ email, password }: SignInData) => {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      
      if (error) throw error
      return data
    }
  })
}