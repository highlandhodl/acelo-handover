import { useMemo } from 'react';
import type { Context, ContextCategory } from '../../types/context';

interface UseContextSearchOptions {
  contexts: Context[];
  searchTerm: string;
  selectedCategory?: ContextCategory;
}

export const useContextSearch = ({ contexts, searchTerm, selectedCategory }: UseContextSearchOptions) => {
  const filteredContexts = useMemo(() => {
    let filtered = contexts;

    // Filter by category if specified
    if (selectedCategory) {
      filtered = filtered.filter(context => context.category === selectedCategory);
    }

    // Filter by search term if specified
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase().trim();
      filtered = filtered.filter(context =>
        context.title.toLowerCase().includes(searchLower) ||
        context.description?.toLowerCase().includes(searchLower) ||
        context.content.toLowerCase().includes(searchLower)
      );
    }

    return filtered;
  }, [contexts, searchTerm, selectedCategory]);

  const searchStats = useMemo(() => ({
    total: contexts.length,
    filtered: filteredContexts.length,
    hasActiveFilters: !!selectedCategory || !!searchTerm.trim(),
  }), [contexts.length, filteredContexts.length, selectedCategory, searchTerm]);

  return {
    filteredContexts,
    searchStats,
  };
};