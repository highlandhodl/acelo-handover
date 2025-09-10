import { Check, Copy, Sparkles, RefreshCw, Download } from 'lucide-react'
import { Button } from '../ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog'
import { ScrollArea } from '../ui/scroll-area'
import { useToast } from '../ui/use-toast'
import ReactMarkdown from 'react-markdown'
import { useState } from 'react'

interface GenerateModalProps {
  isOpen: boolean
  onClose: () => void
  generatedResponse: string
  isGenerating: boolean
  onGenerate: () => void
  onRegenerate?: () => void
  onExport?: () => void
  canRegenerate?: boolean
}

export const GenerateModal = ({ 
  isOpen, 
  onClose, 
  generatedResponse, 
  isGenerating, 
  onGenerate,
  onRegenerate,
  onExport,
  canRegenerate = true,
}: GenerateModalProps) => {
  const { toast } = useToast()
  const [copied, setCopied] = useState(false)
  const [copyType, setCopyType] = useState<'formatted' | 'plain' | null>(null)

  const copyToClipboard = async (text: string, type: 'formatted' | 'plain' = 'formatted') => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setCopyType(type)
      setTimeout(() => {
        setCopied(false)
        setCopyType(null)
      }, 2000)
      toast({
        title: 'Copied',
        description: `${type === 'formatted' ? 'Formatted text' : 'Plain text'} copied to clipboard`,
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to copy text',
        variant: 'destructive',
      })
    }
  }

  const generatePlainText = (markdown: string) => {
    // Simple markdown to plain text conversion
    return markdown
      .replace(/#{1,6}\s+/g, '') // Remove headers
      .replace(/\*\*([^*]+)\*\*/g, '$1') // Remove bold
      .replace(/\*([^*]+)\*/g, '$1') // Remove italic
      .replace(/`([^`]+)`/g, '$1') // Remove inline code
      .replace(/```[\s\S]*?```/g, '[code block]') // Replace code blocks
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // Convert links to text
      .replace(/^\s*[-*+]\s+/gm, '• ') // Convert bullet points
      .replace(/^\s*\d+\.\s+/gm, '• ') // Convert numbered lists
      .trim()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            AI Generated Response
          </DialogTitle>
          <DialogDescription>
            AI-generated response based on your prompt and context
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex-1 overflow-hidden">
          {isGenerating ? (
            <div className="flex items-center justify-center h-full py-12">
              <div className="text-center space-y-4">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                <div className="space-y-2">
                  <p className="text-lg font-medium">Generating response...</p>
                  <p className="text-sm text-muted-foreground">This may take a few moments</p>
                </div>
              </div>
            </div>
          ) : generatedResponse ? (
            <div className="h-full flex flex-col space-y-4">
              {/* Action Bar */}
              <div className="flex items-center justify-between pb-2 border-b">
                <h4 className="font-medium">Generated Response</h4>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(generatedResponse, 'formatted')}
                    className="gap-2"
                  >
                    {copyType === 'formatted' && copied ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                    {copyType === 'formatted' && copied ? 'Copied' : 'Copy Formatted'}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(generatePlainText(generatedResponse), 'plain')}
                    className="gap-2"
                  >
                    {copyType === 'plain' && copied ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                    {copyType === 'plain' && copied ? 'Copied' : 'Copy Plain'}
                  </Button>
                  {onRegenerate && canRegenerate && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={onRegenerate}
                      className="gap-2"
                    >
                      <RefreshCw className="h-4 w-4" />
                      Regenerate
                    </Button>
                  )}
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
              </div>

              {/* Response Content */}
              <ScrollArea className="flex-1 rounded-lg border bg-background/50 p-4 max-h-[60vh] overflow-y-auto">
                <div className="prose dark:prose-invert max-w-none">
                  <ReactMarkdown
                    components={{
                      p: ({ children }) => (
                        <p className="mb-4 leading-relaxed text-foreground">
                          {children}
                        </p>
                      ),
                      h1: ({ children }) => (
                        <h1 className="text-2xl font-bold mb-4 text-foreground border-b pb-2">
                          {children}
                        </h1>
                      ),
                      h2: ({ children }) => (
                        <h2 className="text-xl font-semibold mb-3 text-foreground">
                          {children}
                        </h2>
                      ),
                      h3: ({ children }) => (
                        <h3 className="text-lg font-medium mb-2 text-foreground">
                          {children}
                        </h3>
                      ),
                      ul: ({ children }) => (
                        <ul className="mb-4 space-y-2 list-disc list-inside">
                          {children}
                        </ul>
                      ),
                      ol: ({ children }) => (
                        <ol className="mb-4 space-y-2 list-decimal list-inside">
                          {children}
                        </ol>
                      ),
                      li: ({ children }) => (
                        <li className="text-foreground/90 leading-relaxed ml-2">
                          {children}
                        </li>
                      ),
                      strong: ({ children }) => (
                        <strong className="font-semibold text-foreground">
                          {children}
                        </strong>
                      ),
                      em: ({ children }) => (
                        <em className="italic text-foreground/90">
                          {children}
                        </em>
                      ),
                      code: ({ children }) => (
                        <code className="bg-muted px-2 py-1 rounded text-sm font-mono text-foreground">
                          {children}
                        </code>
                      ),
                      pre: ({ children }) => (
                        <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm font-mono text-foreground mb-4 border">
                          {children}
                        </pre>
                      ),
                      blockquote: ({ children }) => (
                        <blockquote className="border-l-4 border-primary pl-4 italic text-foreground/80 mb-4">
                          {children}
                        </blockquote>
                      ),
                      table: ({ children }) => (
                        <div className="overflow-x-auto mb-4">
                          <table className="min-w-full border border-border">
                            {children}
                          </table>
                        </div>
                      ),
                      th: ({ children }) => (
                        <th className="border border-border px-3 py-2 bg-muted font-medium text-left">
                          {children}
                        </th>
                      ),
                      td: ({ children }) => (
                        <td className="border border-border px-3 py-2 text-foreground">
                          {children}
                        </td>
                      ),
                    }}
                  >
                    {generatedResponse}
                  </ReactMarkdown>
                </div>
              </ScrollArea>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full py-12">
              <Sparkles className="h-16 w-16 text-muted-foreground mb-6" />
              <div className="text-center space-y-2 mb-6">
                <h3 className="text-lg font-medium">Ready to generate your response</h3>
                <p className="text-sm text-muted-foreground">
                  Click the button below to generate an AI response based on your prompt and selected context
                </p>
              </div>
              <Button onClick={onGenerate} size="lg" className="gap-2 bg-gradient-primary hover:bg-gradient-primary/90 text-white shadow-orange">
                <Sparkles className="h-5 w-5" />
                Generate Response
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}