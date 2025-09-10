import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../lib/supabaseClient';
import { useAuth } from '../../context/AuthContext';
import type { PromptUsageAnalytics } from '../../types/enhanced-workflow';

interface TrackUsageData {
  promptId: string;
  contextIds: string[];
}

export const useTrackPromptUsage = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: TrackUsageData): Promise<PromptUsageAnalytics> => {
      if (!user) throw new Error('User must be authenticated');

      const { data: analyticsData, error } = await supabase
        .from('prompt_usage_analytics')
        .insert({
          user_id: user.id,
          prompt_id: data.promptId,
          context_ids: data.contextIds,
        })
        .select()
        .single();

      if (error) throw error;
      return analyticsData as PromptUsageAnalytics;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['promptUsageAnalytics'] });
    },
  });
};

export const useGetPromptUsageAnalytics = (promptId?: string) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['promptUsageAnalytics', user?.id, promptId],
    queryFn: async (): Promise<PromptUsageAnalytics[]> => {
      let query = supabase
        .from('prompt_usage_analytics')
        .select('*')
        .eq('user_id', user!.id)
        .order('generated_at', { ascending: false })
        .limit(50); // Get recent usage

      if (promptId) {
        query = query.eq('prompt_id', promptId);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
  });
};

// Hook to get suggested contexts based on usage patterns
export const useContextSuggestions = (promptId: string) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['contextSuggestions', user?.id, promptId],
    queryFn: async (): Promise<string[]> => {
      // Get most frequently used contexts for this prompt
      const { data, error } = await supabase
        .from('prompt_usage_analytics')
        .select('context_ids')
        .eq('user_id', user!.id)
        .eq('prompt_id', promptId)
        .order('generated_at', { ascending: false })
        .limit(10);

      if (error) throw error;

      // Flatten and count context occurrences
      const contextCounts: Record<string, number> = {};
      
      data?.forEach(record => {
        const contextIds = record.context_ids as string[];
        contextIds.forEach(contextId => {
          contextCounts[contextId] = (contextCounts[contextId] || 0) + 1;
        });
      });

      // Return top 5 most used context IDs
      return Object.entries(contextCounts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5)
        .map(([contextId]) => contextId);
    },
    enabled: !!user && !!promptId,
  });
};