import React, { useState, useMemo } from 'react';
import { Plus, Search, Filter, BookOpen } from "lucide-react"
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { useToast } from "../components/ui/use-toast"
import PromptCard from "../components/prompts/PromptCard"
import PromptForm from "../components/prompts/PromptForm"
import { useGetPrompts } from "../hooks/prompts/useGetPrompts"
import { useAuth } from "../hooks/auth/useAuth"
import { Prompt } from "../types/prompt"

export default function PromptsPage() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingPrompt, setEditingPrompt] = useState<Prompt | null>(null);
  const { data: prompts = [], isLoading: loading, refetch } = useGetPrompts();

  const filteredPrompts = useMemo(() => {
    return prompts.filter(prompt =>
      (prompt.name?.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (prompt.title?.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (prompt.description?.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [prompts, searchTerm]);

  const handleEdit = (prompt: Prompt) => {
    setEditingPrompt(prompt);
    setIsFormOpen(true);
  };

  const handleDelete = (promptId: string) => {
    refetch();
  };

  const handleFormSuccess = () => {
    refetch();
    setEditingPrompt(null);
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    setEditingPrompt(null);
  };


  if (!user) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground mb-4">
          Please sign in to access your prompt library
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold text-foreground">Prompt Library</h2>
          <p className="text-muted-foreground">Manage and organize your AI prompts and templates</p>
        </div>
        <Button 
          onClick={() => setIsFormOpen(true)}
          className="bg-gradient-primary text-primary-foreground shadow-orange"
        >
          <Plus className="mr-2 h-4 w-4" />
          New Prompt
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input 
            placeholder="Search prompts..." 
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button variant="outline" className="gap-2">
          <Filter className="h-4 w-4" />
          Filter
        </Button>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Your Prompts</h3>
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-muted rounded-lg h-48"></div>
              </div>
            ))}
          </div>
        ) : filteredPrompts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-4 md:gap-6">
            {filteredPrompts.map((prompt) => (
              <div key={prompt.id} className="min-w-0">
                <PromptCard
                  prompt={prompt}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="mx-auto w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-4">
              <BookOpen className="h-10 w-10 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium mb-2">
              {searchTerm ? 'No prompts found' : 'No prompts yet'}
            </h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              {searchTerm 
                ? 'Try adjusting your search to find what you\'re looking for.'
                : 'Create your first AI prompt to start building your library.'
              }
            </p>
            {!searchTerm && (
              <Button onClick={() => setIsFormOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Prompt
              </Button>
            )}
          </div>
        )}
      </div>

      <PromptForm
        isOpen={isFormOpen}
        onClose={handleFormClose}
        onSuccess={handleFormSuccess}
        editingPrompt={editingPrompt}
      />
    </div>
  );
}