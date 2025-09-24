import React from 'react';
import { Copy, Check, FileText } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { ScrollArea } from '../ui/scroll-area';
import { Badge } from '../ui/badge';
import ReactMarkdown from 'react-markdown';
import type { Prompt } from '../../types/prompt';

interface PromptPreviewModalProps {
  prompt: Prompt | null;
  isOpen: boolean;
  onClose: () => void;
  onCopy?: (text: string) => void;
  copied?: boolean;
}

export const PromptPreviewModal: React.FC<PromptPreviewModalProps> = ({
  prompt,
  isOpen,
  onClose,
  onCopy,
  copied = false,
}) => {
  const getWordCount = (text: string) => {
    return text.split(/\s+/).filter(word => word.length > 0).length;
  };

  const getCharCount = (text: string) => {
    if (!text) return 0;
    return text.trim().length;
  };

  const handleCopy = () => {
    if (prompt?.prompt_content && onCopy) {
      onCopy(prompt.prompt_content);
    }
  };

  if (!prompt) return null;

  const promptContent = prompt.prompt_content || '';
  const wordCount = getWordCount(promptContent);
  const charCount = getCharCount(promptContent);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <div className="flex items-start gap-3">
            <div className="bg-primary/10 rounded-lg p-2">
              <FileText className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <DialogTitle className="text-xl">{prompt.title}</DialogTitle>
              <DialogDescription className="mt-1">
                Preview of the complete prompt content
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4">
          {/* Stats Bar */}
          <div className="flex items-center gap-4 p-3 bg-muted/50 rounded-lg">
            <Badge variant="secondary" className="gap-1">
              <span className="text-xs">Words:</span>
              <span className="font-medium">{wordCount.toLocaleString()}</span>
            </Badge>
            <Badge variant="secondary" className="gap-1">
              <span className="text-xs">Characters:</span>
              <span className="font-medium">{charCount.toLocaleString()}</span>
            </Badge>
            {(prompt.estimated_tokens && prompt.estimated_tokens > 0) ? (
              <Badge variant="secondary" className="gap-1">
                <span className="text-xs">Est. Tokens:</span>
                <span className="font-medium">{prompt.estimated_tokens.toLocaleString()}</span>
              </Badge>
            ) : null}
          </div>

          {/* Prompt Content */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Prompt Content</h3>
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopy}
                className="gap-2"
              >
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                {copied ? 'Copied' : 'Copy Prompt'}
              </Button>
            </div>
            
            <ScrollArea className="h-96 w-full rounded-lg border bg-muted/20 p-4 overflow-auto">
              <div className="prose dark:prose-invert prose-sm max-w-none break-words [&>*]:min-w-0 prose-pre:whitespace-pre-wrap prose-code:break-all prose-table:block prose-table:overflow-x-auto prose-img:max-w-full">
                <ReactMarkdown
                  components={{
                    p: ({ children }) => <p className="mb-3 leading-relaxed text-foreground break-words">{children}</p>,
                    h1: ({ children }) => <h1 className="text-lg font-semibold mb-3 text-foreground">{children}</h1>,
                    h2: ({ children }) => <h2 className="text-base font-semibold mb-2 text-foreground">{children}</h2>,
                    h3: ({ children }) => <h3 className="text-sm font-medium mb-2 text-foreground">{children}</h3>,
                    ul: ({ children }) => <ul className="mb-3 space-y-1 list-disc list-inside">{children}</ul>,
                    ol: ({ children }) => <ol className="mb-3 space-y-1 list-decimal list-inside">{children}</ol>,
                    li: ({ children }) => <li className="text-foreground/90 leading-relaxed break-words">{children}</li>,
                    strong: ({ children }) => <strong className="font-medium text-foreground">{children}</strong>,
                    code: ({ children }) => (
                      <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono text-foreground break-all">
                        {children}
                      </code>
                    ),
                    pre: ({ children }) => (
                      <pre className="bg-muted p-3 rounded-lg overflow-x-auto whitespace-pre-wrap text-sm font-mono text-foreground mb-3">
                        {children}
                      </pre>
                    ),
                  }}
                >
                  {prompt.prompt_content || ''}
                </ReactMarkdown>
              </div>
            </ScrollArea>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={onClose}>
              Close Preview
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};