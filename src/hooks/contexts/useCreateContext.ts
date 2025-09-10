import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../lib/supabaseClient';
import { useAuth } from '../../context/AuthContext';
import type { Context, ContextFormData } from '../../types/context';

/**
 * Custom hook for creating new contexts in Supabase
 * 
 * This hook provides a TanStack Query mutation for creating new context
 * entries associated with the authenticated user. It automatically
 * invalidates related queries on successful creation.
 * 
 * @returns TanStack Query mutation object with mutate function, loading state, and error
 * 
 * @example
 * ```typescript
 * const createContext = useCreateContext();
 * 
 * const handleSubmit = async (formData: ContextFormData) => {
 *   try {
 *     const newContext = await createContext.mutateAsync(formData);
 *     console.log('Created context:', newContext);
 *   } catch (error) {
 *     console.error('Failed to create context:', error);
 *   }
 * };
 * ```
 */
export const useCreateContext = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (formData: ContextFormData): Promise<Context> => {
      if (!user) throw new Error('User must be authenticated');

      const { data, error } = await supabase
        .from('contexts')
        .insert({
          user_id: user.id,
          title: formData.title,
          description: formData.description || null,
          category: formData.category,
          content: formData.content,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      // Invalidate all context-related queries to refetch data
      queryClient.invalidateQueries({ queryKey: ['contexts'] });
    },
  });
};