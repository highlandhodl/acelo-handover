import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '../components/ui/button';
import ContextList from '../components/contexts/ContextList';
import ContextForm from '../components/contexts/ContextForm';
import type { Context } from '../types/context';

export default function ContextHubPage() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingContext, setEditingContext] = useState<Context | null>(null);

  const handleCreateNew = () => {
    setEditingContext(null);
    setIsFormOpen(true);
  };

  const handleEdit = (context: Context) => {
    setEditingContext(context);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingContext(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold text-foreground">Context Hub</h2>
          <p className="text-muted-foreground">
            Create and manage reusable context documents to enhance your AI prompts with relevant background information.
          </p>
        </div>
        <Button 
          onClick={handleCreateNew}
          className="bg-gradient-primary text-primary-foreground shadow-orange"
        >
          <Plus className="mr-2 h-4 w-4" />
          New Context
        </Button>
      </div>

      <ContextList 
        onCreateNew={handleCreateNew}
        onEdit={handleEdit}
      />

      <ContextForm
        isOpen={isFormOpen}
        onClose={handleCloseForm}
        editingContext={editingContext}
      />
    </div>
  );
}