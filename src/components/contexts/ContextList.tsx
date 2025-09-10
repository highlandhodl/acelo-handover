import React, { useState } from 'react';
import { useGetContexts } from '../../hooks/contexts/useGetContexts';
import ContextCard from './ContextCard';
import ContextSearch from './ContextSearch';
import CategoryFilter from './CategoryFilter';
import { Button } from '../ui/button';
import { Plus, FileText } from 'lucide-react';
import type { Context, ContextCategory } from '../../types/context';

interface ContextListProps {
  onCreateNew: () => void;
  onEdit: (context: Context) => void;
}

export default function ContextList({ onCreateNew, onEdit }: ContextListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<ContextCategory | 'all'>('all');

  const { 
    data: contexts = [], 
    isLoading, 
    error 
  } = useGetContexts({
    category: selectedCategory === 'all' ? undefined : selectedCategory,
    searchTerm: searchTerm.trim() || undefined,
  });

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-destructive">Failed to load contexts. Please try again.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <ContextSearch 
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder="Search contexts by title, description, or content..."
          />
        </div>
        <CategoryFilter
          value={selectedCategory}
          onValueChange={(value) => setSelectedCategory(value as ContextCategory | 'all')}
        />
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Your Contexts</h3>
        
        {/* Loading State */}
        {isLoading && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Loading contexts...</p>
          </div>
        )}

      {/* Empty State */}
      {!isLoading && contexts.length === 0 && (
        <div className="text-center py-12">
          <div className="mx-auto w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-4">
            <FileText className="h-10 w-10 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium mb-2">
            {searchTerm || selectedCategory !== 'all' ? 'No contexts found' : 'No contexts yet'}
          </h3>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            {searchTerm || selectedCategory !== 'all' 
              ? 'Try adjusting your search or filter to find what you\'re looking for.'
              : 'Create your first context document to start building your knowledge base.'
            }
          </p>
          {!searchTerm && selectedCategory === 'all' && (
            <Button onClick={onCreateNew}>
              <Plus className="h-4 w-4 mr-2" />
              Create Your First Context
            </Button>
          )}
        </div>
      )}

        {/* Context Grid */}
        {!isLoading && contexts.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {contexts.map((context) => (
              <div key={context.id} className="min-w-0">
                <ContextCard
                  context={context}
                  onEdit={onEdit}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}