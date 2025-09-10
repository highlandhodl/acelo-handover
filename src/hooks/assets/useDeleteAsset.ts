import { useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../../lib/supabaseClient'
import { useAuth } from '../../context/AuthContext'

export const useDeleteAsset = () => {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (fileName: string) => {
      if (!user?.id) throw new Error('No user ID')
      
      // Handle both cases - if fileName already includes user path or not
      const filePath = fileName.includes(user.id) ? fileName : `${user.id}/${fileName}`
      
      const { error } = await supabase.storage
        .from('user-assets')
        .remove([filePath])
      
      if (error) {
        console.error('Delete error:', error)
        throw error
      }
      return { success: true, filePath }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assets', user?.id] })
    }
  })
}