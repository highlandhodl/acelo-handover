import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Textarea } from '../ui/textarea'
import { Label } from '../ui/label'
import { useToast } from '../ui/use-toast'
import { Mail, Play } from 'lucide-react'
import { useRunEnhancedAutomation } from '../../hooks/automations/useRunAutomation'
import { useGetPrompts } from '../../hooks/prompts/useGetPrompts'
import { useGetContexts } from '../../hooks/contexts/useGetContexts'
import { EnhancedAutomation, AutomationExecutionData, AutomationRunInputData } from '../../types/automation'
import PromptSelector from './PromptSelector'
import ContextSelector from './ContextSelector'

interface AutomationExecutionModalProps {
  automation: EnhancedAutomation | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function AutomationExecutionModal({
  automation,
  open,
  onOpenChange,
}: AutomationExecutionModalProps) {
  const { toast } = useToast()
  const { mutate: runAutomation, isPending } = useRunEnhancedAutomation()
  const { data: prompts = [] } = useGetPrompts()
  const { data: contexts = [] } = useGetContexts()
  
  const [emailAddress, setEmailAddress] = useState('')
  const [selectedPromptId, setSelectedPromptId] = useState<string>('')
  const [selectedContextIds, setSelectedContextIds] = useState<string[]>([])
  const [customPromptContent, setCustomPromptContent] = useState('')
  const [customContextContent, setCustomContextContent] = useState<Record<string, string>>({})
  const [showPreview, setShowPreview] = useState(false)

  // Load prompt content when selected
  useEffect(() => {
    if (selectedPromptId && prompts.length > 0) {
      const prompt = prompts.find(p => p.id === selectedPromptId)
      if (prompt) {
        setCustomPromptContent(prompt.prompt_content || prompt.name || prompt.title || '')
      }
    }
  }, [selectedPromptId, prompts])

  // Load context content when selected
  useEffect(() => {
    if (selectedContextIds.length > 0 && contexts.length > 0) {
      const newContextContent: Record<string, string> = {}
      selectedContextIds.forEach(contextId => {
        const context = contexts.find(c => c.id === contextId)
        if (context) {
          newContextContent[contextId] = context.content
        }
      })
      setCustomContextContent(newContextContent)
    } else {
      setCustomContextContent({})
    }
  }, [selectedContextIds, contexts])
  
  // Initialize form when modal opens/closes
  useEffect(() => {
    if (open && automation) {
      // Pre-populate with automation's default email if available
      setEmailAddress(automation.default_email || '')
    } else if (!open) {
      setEmailAddress('')
      setSelectedPromptId('')
      setSelectedContextIds([])
      setCustomPromptContent('')
      setCustomContextContent({})
      setShowPreview(false)
    }
  }, [open, automation])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!automation) return
    
    if (!emailAddress.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Email address is required',
        variant: 'destructive'
      })
      return
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(emailAddress)) {
      toast({
        title: 'Validation Error',
        description: 'Please enter a valid email address',
        variant: 'destructive'
      })
      return
    }

    const executionData: AutomationExecutionData = {
      automation_id: automation.id,
      email_address: emailAddress,
      prompt_id: selectedPromptId || undefined,
      context_ids: selectedContextIds.length > 0 ? selectedContextIds : undefined,
      custom_prompt_content: customPromptContent || undefined,
      custom_context_content: Object.keys(customContextContent).length > 0 ? customContextContent : undefined,
    }

    runAutomation(executionData, {
      onSuccess: (result) => {
        toast({
          title: 'Success',
          description: `Automation started successfully. Run ID: ${result.runId}`
        })
        onOpenChange(false)
      },
      onError: (error) => {
        console.error('Error running automation:', error)
        toast({
          title: 'Error',
          description: 'Failed to start automation',
          variant: 'destructive'
        })
      }
    })
  }

  const generatePreviewData = (): AutomationRunInputData => {
    const previewData: AutomationRunInputData = {
      automation_type: "prompt_context",
      email_address: emailAddress,
      timestamp: new Date().toISOString()
    }

    if (selectedPromptId || customPromptContent) {
      const selectedPrompt = prompts.find(p => p.id === selectedPromptId)
      previewData.prompt = {
        id: selectedPromptId || 'custom',
        title: selectedPrompt?.name || selectedPrompt?.title || 'Custom Prompt',
        content: customPromptContent || selectedPrompt?.prompt_content || ''
      }
    }

    if (selectedContextIds.length > 0) {
      previewData.contexts = selectedContextIds.map(contextId => {
        const context = contexts.find(c => c.id === contextId)
        return {
          id: contextId,
          title: context?.title || 'Unknown Context',
          content: customContextContent[contextId] || context?.content || ''
        }
      })
    }

    return previewData
  }

  if (!automation) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Play className="h-5 w-5" />
            Run Automation: {automation.name}
          </DialogTitle>
          <DialogDescription>
            Configure and execute your automation workflow. Results will be sent to your email.
          </DialogDescription>
        </DialogHeader>

        {isPending ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center space-y-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
              <div className="space-y-2">
                <p className="text-lg font-medium">Running automation...</p>
                <p className="text-sm text-muted-foreground">This may take a few moments</p>
              </div>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Configuration */}
            <div className="space-y-2">
              <Label htmlFor="email" className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Email Address *
              </Label>
              <Input
                id="email"
                type="email"
                value={emailAddress}
                onChange={(e) => setEmailAddress(e.target.value)}
                placeholder="your-email@example.com"
                required
              />
              <p className="text-xs text-muted-foreground">
                Automation results will be sent to this email address
              </p>
            </div>

            {/* Prompt Selection */}
            <div className="space-y-2">
              <Label>Select Prompt (Optional)</Label>
              <PromptSelector
                selectedPromptId={selectedPromptId}
                onPromptSelect={(promptId) => setSelectedPromptId(promptId || '')}
                placeholder="Select a prompt to use..."
                allowClear
              />
            </div>

            {/* Context Selection */}
            <div className="space-y-2">
              <Label>Select Contexts (Optional)</Label>
              <ContextSelector
                selectedContextIds={selectedContextIds}
                onContextsSelect={setSelectedContextIds}
                placeholder="Select contexts to use..."
                allowClear
                multiple
              />
            </div>

            {/* Selected Items Display */}
            {selectedPromptId && (
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">
                  📝 <strong>Prompt:</strong> {prompts.find(p => p.id === selectedPromptId)?.name || prompts.find(p => p.id === selectedPromptId)?.title}
                </p>
              </div>
            )}

            {selectedContextIds.length > 0 && (
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm text-green-800 mb-2">
                  <strong>📁 Selected Contexts:</strong>
                </p>
                <ul className="text-sm text-green-700 space-y-1">
                  {selectedContextIds.map(contextId => {
                    const context = contexts.find(c => c.id === contextId)
                    return (
                      <li key={contextId}>• {context?.title || `Context ${contextId.slice(0, 8)}...`}</li>
                    )
                  })}
                </ul>
              </div>
            )}

            {/* Preview Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Input Data Preview</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowPreview(!showPreview)}
                >
                  {showPreview ? 'Hide' : 'Show'} JSON Preview
                </Button>
              </div>

              {showPreview && (
                <div className="p-4 bg-muted rounded-lg overflow-auto">
                  <pre className="text-xs whitespace-pre-wrap break-words">
                    {JSON.stringify(generatePreviewData(), null, 2)}
                  </pre>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isPending}>
                <Play className="mr-2 h-4 w-4" />
                Run Automation
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}