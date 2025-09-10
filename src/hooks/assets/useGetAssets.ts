import { useQuery } from '@tanstack/react-query'
import { supabase } from '../../lib/supabaseClient'
import { useAuth } from '../../context/AuthContext'
import { AssetFile } from '../../types/asset'

export const useGetAssets = () => {
  const { user } = useAuth()
  
  return useQuery({
    queryKey: ['assets', user?.id],
    queryFn: async (): Promise<AssetFile[]> => {
      if (!user?.id) throw new Error('No user ID')
      
      const { data, error } = await supabase.storage
        .from('user-assets')
        .list(user.id, {
          limit: 1000,
          sortBy: { column: 'created_at', order: 'desc' }
        })
      
      if (error) throw error
      return data || []
    },
    enabled: !!user
  })
}