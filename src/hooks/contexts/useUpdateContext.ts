import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../lib/supabaseClient';
import { useAuth } from '../../context/AuthContext';
import type { Context, ContextFormData } from '../../types/context';

interface UpdateContextParams {
  id: string;
  data: ContextFormData;
}

export const useUpdateContext = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: UpdateContextParams): Promise<Context> => {
      if (!user) throw new Error('User must be authenticated');

      const { data: updatedContext, error } = await supabase
        .from('contexts')
        .update({
          title: data.title,
          description: data.description || null,
          category: data.category,
          content: data.content,
        })
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;
      return updatedContext;
    },
    onSuccess: () => {
      // Invalidate all context-related queries to refetch data
      queryClient.invalidateQueries({ queryKey: ['contexts'] });
    },
  });
};