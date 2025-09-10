import React, { useState } from 'react';
import { Check, Eye, FileText, Plus } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { ScrollArea } from '../ui/scroll-area';
import ReactMarkdown from 'react-markdown';
import type { Context } from '../../types/context';
import { CONTEXT_CATEGORIES } from '../../types/context';

interface ContextSelectionCardProps {
  context: Context;
  isSelected: boolean;
  onSelect: (context: Context) => void;
  onDeselect: (contextId: string) => void;
  showPreview?: boolean;
}

export const ContextSelectionCard: React.FC<ContextSelectionCardProps> = ({
  context,
  isSelected,
  onSelect,
  onDeselect,
  showPreview = true,
}) => {
  const [previewOpen, setPreviewOpen] = useState(false);

  const getCategoryLabel = (category: string) => {
    const categoryInfo = CONTEXT_CATEGORIES.find(cat => cat.value === category);
    return categoryInfo?.label || category;
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      client_profiles: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
      product_service_info: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
      competitor_analysis: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
      industry_knowledge: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
      brand_voice_guidelines: 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-300',
      technical_documentation: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300',
      creative_frameworks: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
      communication_templates: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300',
      process_documentation: 'bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-300',
      market_research: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
    };
    return colors[category] || 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
  };

  const getWordCount = (text: string) => {
    return text.split(/\s+/).filter(word => word.length > 0).length;
  };

  const getPreview = (text: string, length = 100) => {
    return text.length > length ? text.substring(0, length) + '...' : text;
  };

  const handleToggleSelect = () => {
    if (isSelected) {
      onDeselect(context.id);
    } else {
      onSelect(context);
    }
  };

  return (
    <>
      <Card className={`hover:shadow-md transition-all cursor-pointer ${isSelected ? 'ring-2 ring-primary shadow-md' : ''}`}>
        <CardHeader className="pb-2 p-3">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-start gap-2 min-w-0 flex-1">
              <div className={`p-1.5 rounded-sm flex-shrink-0 ${isSelected ? 'bg-primary/20' : 'bg-muted'}`}>
                <FileText className={`h-3.5 w-3.5 ${isSelected ? 'text-primary' : 'text-muted-foreground'}`} />
              </div>
              <div className="flex-1 min-w-0">
                <CardTitle className="text-sm font-medium truncate mb-1" title={context.title}>
                  {context.title}
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Badge className={`text-xs px-2 py-0.5 ${getCategoryColor(context.category)}`}>
                    {getCategoryLabel(context.category)}
                  </Badge>
                  <span className="text-xs text-muted-foreground whitespace-nowrap">
                    {getWordCount(context.content)}w
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1">
              {showPreview && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    setPreviewOpen(true);
                  }}
                  className="h-8 w-8 p-0"
                  title="Preview full content"
                >
                  <Eye className="h-3 w-3" />
                </Button>
              )}
              <Button
                variant={isSelected ? "default" : "ghost"}
                size="sm"
                onClick={handleToggleSelect}
                className={`h-8 w-8 p-0 ${isSelected ? 'bg-primary hover:bg-primary/90' : ''}`}
                title={isSelected ? "Remove from selection" : "Add to selection"}
              >
                {isSelected ? <Check className="h-3 w-3" /> : <Plus className="h-3 w-3" />}
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="pt-0 px-3 pb-3" onClick={handleToggleSelect}>
          <CardDescription className="text-xs text-muted-foreground line-clamp-2 leading-normal">
            {context.description ? (
              <span className="block font-medium text-foreground/80 mb-1">{getPreview(context.description, 60)}</span>
            ) : null}
            <span>{getPreview(context.content, 100)}</span>
          </CardDescription>
        </CardContent>
      </Card>

      {/* Preview Modal */}
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh]">
          <DialogHeader>
            <div className="flex items-start gap-3">
              <div className="bg-primary/10 rounded-lg p-2">
                <FileText className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <DialogTitle className="text-lg">{context.title}</DialogTitle>
                <div className="flex items-center gap-2 mt-1">
                  <Badge className={`text-xs ${getCategoryColor(context.category)}`}>
                    {getCategoryLabel(context.category)}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {getWordCount(context.content)} words
                  </span>
                </div>
              </div>
            </div>
          </DialogHeader>
          
          <ScrollArea className="h-96 w-full">
            <div className="space-y-4">
              {context.description && (
                <div>
                  <h4 className="text-sm font-medium mb-2">Description</h4>
                  <p className="text-sm text-muted-foreground">{context.description}</p>
                </div>
              )}
              
              <div>
                <h4 className="text-sm font-medium mb-2">Content</h4>
                <div className="prose dark:prose-invert prose-sm max-w-none">
                  <ReactMarkdown
                    components={{
                      p: ({ children }) => <p className="mb-2 text-sm leading-relaxed text-foreground">{children}</p>,
                      ul: ({ children }) => <ul className="mb-2 space-y-1 list-disc list-inside text-sm">{children}</ul>,
                      ol: ({ children }) => <ol className="mb-2 space-y-1 list-decimal list-inside text-sm">{children}</ol>,
                      li: ({ children }) => <li className="text-foreground/90">{children}</li>,
                    }}
                  >
                    {context.content}
                  </ReactMarkdown>
                </div>
              </div>
            </div>
          </ScrollArea>
          
          <div className="flex justify-end gap-2 pt-4">
            <Button
              variant={isSelected ? "default" : "outline"}
              onClick={handleToggleSelect}
              className="gap-2"
            >
              {isSelected ? <Check className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
              {isSelected ? 'Selected' : 'Select Context'}
            </Button>
            <Button variant="outline" onClick={() => setPreviewOpen(false)}>
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};