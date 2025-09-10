import React from 'react';
import { GripVertical, X, FileText, Plus } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Textarea } from '../ui/textarea';
import { ScrollArea } from '../ui/scroll-area';
import type { Context } from '../../types/context';
import type { TokenEstimate } from '../../types/enhanced-workflow';
import { CONTEXT_CATEGORIES } from '../../types/context';

interface ContextBuildingAreaProps {
  selectedContexts: Context[];
  customContext: string;
  onCustomContextChange: (value: string) => void;
  onRemoveContext: (contextId: string) => void;
  onReorderContexts: (contexts: Context[]) => void;
  tokenEstimate: TokenEstimate;
  showTokenWarning: boolean;
}

export const ContextBuildingArea: React.FC<ContextBuildingAreaProps> = ({
  selectedContexts,
  customContext,
  onCustomContextChange,
  onRemoveContext,
  onReorderContexts,
  tokenEstimate,
  showTokenWarning,
}) => {
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

  const getPreview = (text: string, length = 100) => {
    return text.length > length ? text.substring(0, length) + '...' : text;
  };

  const hasContent = selectedContexts.length > 0 || customContext.trim().length > 0;

  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base">Context Building Area</CardTitle>
            <CardDescription className="text-sm">
              Selected contexts and custom content
            </CardDescription>
          </div>
          <Badge variant={showTokenWarning ? "destructive" : "secondary"} className="gap-1 text-xs">
            <span>Tokens:</span>
            <span className="font-medium">{tokenEstimate.totalTokens.toLocaleString()}</span>
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent>
        {!hasContent ? (
          <div className="text-center py-8 text-muted-foreground">
            <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p className="text-sm">No contexts selected yet</p>
            <p className="text-xs mt-1">Select contexts from the library or add custom content below</p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Selected Contexts */}
            {selectedContexts.length > 0 && (
              <div className="space-y-3">
                <h4 className="text-sm font-medium flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Selected Contexts ({selectedContexts.length})
                </h4>
                <ScrollArea className="h-64 w-full">
                  <div className="space-y-2 pr-3">
                    {selectedContexts.map((context, index) => (
                      <div
                        key={context.id}
                        className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg border"
                      >
                        <div className="flex items-center gap-2">
                          <GripVertical className="h-4 w-4 text-muted-foreground cursor-move" />
                          <span className="text-xs bg-background rounded px-1.5 py-0.5 font-medium">
                            {index + 1}
                          </span>
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0 flex-1">
                              <h5 className="text-sm font-medium truncate" title={context.title}>
                                {context.title}
                              </h5>
                              <Badge className={`text-xs mt-1 ${getCategoryColor(context.category)}`}>
                                {getCategoryLabel(context.category)}
                              </Badge>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => onRemoveContext(context.id)}
                              className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                            {getPreview(context.content, 150)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            )}

            {/* Custom Context */}
            <div className="space-y-3">
              <h4 className="text-sm font-medium flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Custom Context
              </h4>
              <Textarea
                placeholder="Add any additional context that isn't in your Context Hub..."
                value={customContext}
                onChange={(e) => onCustomContextChange(e.target.value)}
                rows={4}
                className="resize-none"
              />
            </div>

            {/* Token Warning */}
            {showTokenWarning && (
              <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                <p className="text-sm text-destructive">
                  ⚠️ Token count is approaching limits. Consider reducing context to improve performance.
                </p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};