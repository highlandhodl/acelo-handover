import { useQuery } from '@tanstack/react-query';
import { supabase } from '../../lib/supabaseClient';
import { useAuth } from '../../context/AuthContext';
import type { Context, ContextCategory } from '../../types/context';

/**
 * Options for configuring the useGetContexts hook
 */
interface UseGetContextsOptions {
  /** Optional category filter */
  category?: ContextCategory;
  /** Optional search term for filtering contexts */
  searchTerm?: string;
  /** Optional limit for number of results */
  limit?: number;
  /** Whether to include word count calculation */
  includeWordCount?: boolean;
}

/**
 * Custom hook for fetching user contexts from Supabase
 * 
 * This hook provides a TanStack Query-powered interface for fetching
 * contexts with optional filtering by category and search term.
 * 
 * @param options - Configuration options for the query
 * @param options.category - Filter contexts by category
 * @param options.searchTerm - Search term for filtering context names/content
 * @param options.limit - Maximum number of contexts to return
 * @param options.includeWordCount - Whether to calculate word counts
 * 
 * @returns TanStack Query result object with contexts data, loading state, and error
 * 
 * @example
 * ```typescript
 * const { data: contexts, isLoading, error } = useGetContexts({
 *   category: 'sales',
 *   searchTerm: 'lead generation',
 *   limit: 10
 * });
 * ```
 */
export const useGetContexts = (options: UseGetContextsOptions = {}) => {
  const { user } = useAuth();
  const { category, searchTerm, limit } = options;

  return useQuery({
    queryKey: ['contexts', user?.id, category, searchTerm, limit],
    queryFn: async (): Promise<Context[]> => {
      let query = supabase
        .from('contexts')
        .select('*')
        .eq('user_id', user!.id)
        .order('created_at', { ascending: false });

      // Apply category filter if provided
      if (category) {
        query = query.eq('category', category);
      }

      // Apply search filter if provided
      if (searchTerm) {
        query = query.or(`title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%,content.ilike.%${searchTerm}%`);
      }

      // Apply limit if provided
      if (limit) {
        query = query.limit(limit);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
  });
};