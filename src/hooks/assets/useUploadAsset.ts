import { useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../../lib/supabaseClient'
import { useAuth } from '../../context/AuthContext'
import { AssetFormData } from '../../types/asset'

export const useUploadAsset = () => {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (data: AssetFormData) => {
      if (!user?.id) throw new Error('No user ID')
      if (!data.file) throw new Error('No file provided')
      
      const filePath = `${user.id}/${data.file.name}`
      
      const { data: uploadData, error } = await supabase.storage
        .from('user-assets')
        .upload(filePath, data.file)
      
      if (error) throw error
      return uploadData
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assets', user?.id] })
    }
  })
}