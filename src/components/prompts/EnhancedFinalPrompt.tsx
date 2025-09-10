import React, { useState } from 'react';
import { Copy, Check, FileText, Download } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { ScrollArea } from '../ui/scroll-area';
import { Separator } from '../ui/separator';
import ReactMarkdown from 'react-markdown';
import type { Context } from '../../types/context';
import type { TokenEstimate } from '../../types/enhanced-workflow';
import { CONTEXT_CATEGORIES } from '../../types/context';

interface EnhancedFinalPromptProps {
  promptContent: string;
  selectedContexts: Context[];
  customContext: string;
  finalPrompt: string;
  tokenEstimate: TokenEstimate;
  onCopy: (text: string, type: 'prompt' | 'plain') => void;
  onExport?: () => void;
  copied?: boolean;
}

export const EnhancedFinalPrompt: React.FC<EnhancedFinalPromptProps> = ({
  promptContent,
  selectedContexts,
  customContext,
  finalPrompt,
  tokenEstimate,
  onCopy,
  onExport,
  copied = false,
}) => {
  const [copyType, setCopyType] = useState<'prompt' | 'plain' | null>(null);

  const getCategoryLabel = (category: string) => {
    const categoryInfo = CONTEXT_CATEGORIES.find(cat => cat.value === category);
    return categoryInfo?.label || category;
  };

  const handleCopy = (type: 'prompt' | 'plain') => {
    onCopy(finalPrompt, type);
    setCopyType(type);
    setTimeout(() => setCopyType(null), 2000);
  };

  const generatePlainTextPrompt = () => {
    let plainText = promptContent;
    
    if (selectedContexts.length > 0 || customContext.trim()) {
      plainText += '\n\n--- CONTEXT ---\n';
      
      selectedContexts.forEach((context, index) => {
        plainText += `\n${index + 1}. ${context.title} (${getCategoryLabel(context.category)}):\n`;
        plainText += context.content + '\n';
      });
      
      if (customContext.trim()) {
        plainText += `\n${selectedContexts.length + 1}. Custom Context:\n`;
        plainText += customContext + '\n';
      }
    }
    
    return plainText;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Final Prompt & Context
            </CardTitle>
            <CardDescription>
              Review your complete prompt before generating the AI response
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="gap-1">
              <span className="text-xs">Tokens:</span>
              <span className="font-medium">{tokenEstimate.totalTokens.toLocaleString()}</span>
            </Badge>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <ScrollArea className="h-96 w-full rounded-lg border bg-background/50 p-4">
          <div className="space-y-6">
            {/* Base Prompt */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="h-1 w-12 bg-primary rounded"></div>
                <h3 className="text-sm font-semibold text-primary">BASE PROMPT</h3>
              </div>
              <div className="prose dark:prose-invert prose-sm max-w-none">
                <ReactMarkdown
                  components={{
                    p: ({ children }) => <p className="mb-3 leading-relaxed text-foreground">{children}</p>,
                    h1: ({ children }) => <h1 className="text-lg font-semibold mb-3 text-foreground">{children}</h1>,
                    h2: ({ children }) => <h2 className="text-base font-semibold mb-2 text-foreground">{children}</h2>,
                    h3: ({ children }) => <h3 className="text-sm font-medium mb-2 text-foreground">{children}</h3>,
                    ul: ({ children }) => <ul className="mb-3 space-y-1 list-disc list-inside">{children}</ul>,
                    ol: ({ children }) => <ol className="mb-3 space-y-1 list-decimal list-inside">{children}</ol>,
                    li: ({ children }) => <li className="text-foreground/90 leading-relaxed">{children}</li>,
                    strong: ({ children }) => <strong className="font-medium text-foreground">{children}</strong>,
                    code: ({ children }) => (
                      <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono text-foreground">
                        {children}
                      </code>
                    ),
                    pre: ({ children }) => (
                      <pre className="bg-muted p-3 rounded-lg overflow-x-auto text-sm font-mono text-foreground mb-3">
                        {children}
                      </pre>
                    ),
                  }}
                >
                  {promptContent}
                </ReactMarkdown>
              </div>
            </div>

            {/* Context Sections */}
            {(selectedContexts.length > 0 || customContext.trim()) && (
              <>
                <Separator />
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <div className="h-1 w-12 bg-orange-500 rounded"></div>
                    <h3 className="text-sm font-semibold text-orange-600 dark:text-orange-400">CONTEXT</h3>
                  </div>
                  
                  <div className="space-y-4">
                    {/* Selected Contexts */}
                    {selectedContexts.map((context, index) => (
                      <div key={context.id} className="border-l-2 border-muted pl-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="outline" className="text-xs">
                            {index + 1}
                          </Badge>
                          <h4 className="text-sm font-medium">{context.title}</h4>
                          <Badge variant="secondary" className="text-xs">
                            {getCategoryLabel(context.category)}
                          </Badge>
                        </div>
                        <div className="prose dark:prose-invert prose-sm max-w-none">
                          <ReactMarkdown
                            components={{
                              p: ({ children }) => <p className="mb-2 text-sm leading-relaxed text-foreground/90">{children}</p>,
                              ul: ({ children }) => <ul className="mb-2 space-y-1 list-disc list-inside text-sm">{children}</ul>,
                              ol: ({ children }) => <ol className="mb-2 space-y-1 list-decimal list-inside text-sm">{children}</ol>,
                              li: ({ children }) => <li className="text-foreground/80">{children}</li>,
                              strong: ({ children }) => <strong className="font-medium text-foreground">{children}</strong>,
                            }}
                          >
                            {context.content}
                          </ReactMarkdown>
                        </div>
                      </div>
                    ))}

                    {/* Custom Context */}
                    {customContext.trim() && (
                      <div className="border-l-2 border-muted pl-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="outline" className="text-xs">
                            {selectedContexts.length + 1}
                          </Badge>
                          <h4 className="text-sm font-medium">Custom Context</h4>
                        </div>
                        <div className="prose dark:prose-invert prose-sm max-w-none">
                          <ReactMarkdown
                            components={{
                              p: ({ children }) => <p className="mb-2 text-sm leading-relaxed text-foreground/90">{children}</p>,
                              ul: ({ children }) => <ul className="mb-2 space-y-1 list-disc list-inside text-sm">{children}</ul>,
                              ol: ({ children }) => <ol className="mb-2 space-y-1 list-decimal list-inside text-sm">{children}</ol>,
                              li: ({ children }) => <li className="text-foreground/80">{children}</li>,
                              strong: ({ children }) => <strong className="font-medium text-foreground">{children}</strong>,
                            }}
                          >
                            {customContext}
                          </ReactMarkdown>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        </ScrollArea>

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-4">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleCopy('prompt')}
              className="gap-2"
            >
              {copyType === 'prompt' && copied ? (
                <Check className="h-4 w-4" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
              {copyType === 'prompt' && copied ? 'Copied' : 'Copy Formatted'}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleCopy('plain')}
              className="gap-2"
            >
              {copyType === 'plain' && copied ? (
                <Check className="h-4 w-4" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
              {copyType === 'plain' && copied ? 'Copied' : 'Copy Plain Text'}
            </Button>
          </div>
          
          {onExport && (
            <Button
              variant="outline"
              size="sm"
              onClick={onExport}
              className="gap-2"
            >
              <Download className="h-4 w-4" />
              Export
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};