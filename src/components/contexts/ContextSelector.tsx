import React, { useState, useMemo } from 'react';
import { Search } from 'lucide-react';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Badge } from '../ui/badge';
import { ContextSelectionCard } from './ContextSelectionCard';
import { useGetContexts } from '../../hooks/contexts/useGetContexts';
import { useContextSearch } from '../../hooks/contexts/useContextSearch';
import type { Context, ContextCategory } from '../../types/context';
import { CONTEXT_CATEGORIES } from '../../types/context';

/**
 * Props for the ContextSelector component
 */
interface ContextSelectorProps {
  /** Array of currently selected contexts */
  selectedContexts: Context[];
  /** Callback function when a context is selected */
  onSelectContext: (context: Context) => void;
  /** Callback function when a context is deselected */
  onDeselectContext: (contextId: string) => void;
  /** Optional array of context IDs to highlight as suggested */
  suggestedContextIds?: string[];
}

/**
 * ContextSelector component provides an interface for selecting and managing contexts
 * in the Acelo application. It includes search functionality, category filtering,
 * and displays both selected and suggested contexts.
 * 
 * @param props - The component props
 * @param props.selectedContexts - Array of currently selected contexts
 * @param props.onSelectContext - Callback when a context is selected
 * @param props.onDeselectContext - Callback when a context is deselected  
 * @param props.suggestedContextIds - Optional array of suggested context IDs
 * @returns React functional component for context selection
 * 
 * @example
 * ```tsx
 * <ContextSelector
 *   selectedContexts={selectedContexts}
 *   onSelectContext={(context) => setSelectedContexts([...selected, context])}
 *   onDeselectContext={(id) => setSelectedContexts(selected.filter(c => c.id !== id))}
 *   suggestedContextIds={['context-1', 'context-2']}
 * />
 * ```
 */
export const ContextSelector: React.FC<ContextSelectorProps> = ({
  selectedContexts,
  onSelectContext,
  onDeselectContext,
  suggestedContextIds = [],
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<ContextCategory | undefined>();

  const { data: contexts = [], isLoading } = useGetContexts({
    searchTerm,
    category: selectedCategory,
  });

  const { filteredContexts, searchStats } = useContextSearch({
    contexts,
    searchTerm,
    selectedCategory,
  });

  const selectedContextIds = useMemo(() => 
    new Set(selectedContexts.map(c => c.id)), 
    [selectedContexts]
  );

  const categorizedContexts = useMemo(() => {
    const groups: Record<string, Context[]> = {};
    
    filteredContexts.forEach(context => {
      if (!groups[context.category]) {
        groups[context.category] = [];
      }
      groups[context.category].push(context);
    });
    
    return groups;
  }, [filteredContexts]);

  const suggestedContexts = useMemo(() => {
    // First, try to use analytics-based suggestions if available
    if (suggestedContextIds.length > 0) {
      return contexts
        .filter(context => 
          suggestedContextIds.includes(context.id) && 
          !selectedContextIds.has(context.id)
        )
        .slice(0, 3);
    }
    
    // If no analytics suggestions, show first 3 available contexts
    return contexts
      .filter(context => !selectedContextIds.has(context.id))
      .slice(0, 3);
  }, [contexts, suggestedContextIds, selectedContextIds]);

  const handleClearFilters = () => {
    setSearchTerm('');
    setSelectedCategory(undefined);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="text-center space-y-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-sm text-muted-foreground">Loading contexts...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <div className="space-y-4">
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search contexts by title, description, or content..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={selectedCategory || "all"} onValueChange={(value: string) => setSelectedCategory(value === "all" ? undefined : value as ContextCategory)}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="All categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All categories</SelectItem>
              {CONTEXT_CATEGORIES.map(category => (
                <SelectItem key={category.value} value={category.value}>
                  {category.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Filter Status */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground">
              {searchStats.filtered} of {searchStats.total} contexts
            </span>
            {searchStats.hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearFilters}
                className="h-6 px-2 text-xs"
              >
                Clear filters
              </Button>
            )}
          </div>
          {selectedContexts.length > 0 && (
            <Badge variant="default" className="gap-1">
              {selectedContexts.length} selected
            </Badge>
          )}
        </div>
      </div>

      {/* Suggested Contexts */}
      {suggestedContexts.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-medium">
              {suggestedContextIds.length > 0 ? 'Suggested based on usage' : 'Suggested contexts'}
            </h3>
            <Badge variant="secondary" className="text-xs">
              {suggestedContexts.length}
            </Badge>
          </div>
          <div className="grid gap-3 grid-cols-1">
            {suggestedContexts.map(context => (
              <ContextSelectionCard
                key={context.id}
                context={context}
                isSelected={selectedContextIds.has(context.id)}
                onSelect={onSelectContext}
                onDeselect={onDeselectContext}
              />
            ))}
          </div>
        </div>
      )}

      {/* Context List - Only show when filters are active */}
      {searchStats.hasActiveFilters && (
        <>
          {filteredContexts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No contexts found matching your filters.</p>
              <Button variant="outline" size="sm" onClick={handleClearFilters} className="mt-3">
                Clear filters
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-medium">All Contexts</h3>
              </div>
              {Object.entries(categorizedContexts).map(([category, categoryContexts]) => {
                const categoryInfo = CONTEXT_CATEGORIES.find(cat => cat.value === category);
                return (
                  <div key={category} className="space-y-3">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-medium text-muted-foreground">
                        {categoryInfo?.label || category}
                      </h4>
                      <Badge variant="secondary" className="text-xs">
                        {categoryContexts.length}
                      </Badge>
                    </div>
                    <div className="grid gap-3 grid-cols-1">
                      {categoryContexts.map(context => (
                        <ContextSelectionCard
                          key={context.id}
                          context={context}
                          isSelected={selectedContextIds.has(context.id)}
                          onSelect={onSelectContext}
                          onDeselect={onDeselectContext}
                        />
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* Show browse all option when no filters and no suggestions */}
      {!searchStats.hasActiveFilters && suggestedContexts.length === 0 && (
        <div className="text-center py-8">
          <p className="text-muted-foreground mb-4">No suggested contexts available</p>
          <p className="text-sm text-muted-foreground mb-4">Use the search or filters above to browse all contexts</p>
        </div>
      )}
    </div>
  );
};