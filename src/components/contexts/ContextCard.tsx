import React from 'react';
import { Edit, Trash2, FileText } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { useDeleteContext } from '../../hooks/contexts/useDeleteContext';
import { useToast } from '../ui/use-toast';
import type { Context } from '../../types/context';
import { CONTEXT_CATEGORIES } from '../../types/context';

interface ContextCardProps {
  context: Context;
  onEdit: (context: Context) => void;
}

export default function ContextCard({ context, onEdit }: ContextCardProps) {
  const { toast } = useToast();
  const deleteContextMutation = useDeleteContext();

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this context?')) return;

    try {
      await deleteContextMutation.mutateAsync(context.id);
      toast({
        title: 'Success',
        description: 'Context deleted successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete context',
        variant: 'destructive',
      });
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks ago`;
    return date.toLocaleDateString();
  };

  const getWordCount = (text: string) => {
    return text.split(/\s+/).filter(word => word.length > 0).length;
  };

  const getCategoryLabel = (category: string) => {
    const categoryInfo = CONTEXT_CATEGORIES.find(cat => cat.value === category);
    return categoryInfo?.label || category;
  };

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div className="p-2 bg-muted rounded-lg flex-shrink-0">
              <FileText className="h-6 w-6 text-muted-foreground" />
            </div>
            <div className="flex-1 min-w-0">
              <CardTitle className="text-sm font-medium truncate max-w-full" title={context.title}>
                {context.title}
              </CardTitle>
              <CardDescription className="text-xs truncate">
                {getCategoryLabel(context.category)} • {getWordCount(context.content)} words
              </CardDescription>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground">
            Updated {formatDate(context.updated_at)}
          </p>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit(context)}
              className="h-8 w-8 p-0"
              title="Edit"
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDelete}
              disabled={deleteContextMutation.isPending}
              className="h-8 w-8 p-0 text-destructive hover:text-destructive"
              title="Delete"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}