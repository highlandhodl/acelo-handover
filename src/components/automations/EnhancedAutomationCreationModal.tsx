import { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Textarea } from '../ui/textarea'
import { Label } from '../ui/label'
import { useToast } from '../ui/use-toast'
import { useCreateEnhancedAutomation } from '../../hooks/automations/useCreateAutomation'
import { EnhancedAutomationFormData } from '../../types/automation'

interface EnhancedAutomationCreationModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

export default function EnhancedAutomationCreationModal({
  open,
  onOpenChange,
  onSuccess,
}: EnhancedAutomationCreationModalProps) {
  const { toast } = useToast()
  const { mutate: createAutomation, isPending } = useCreateEnhancedAutomation()
  
  const [formData, setFormData] = useState({
    name: '',
    purpose: '',
    webhook_url: '',
  })


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    const enhancedFormData: EnhancedAutomationFormData = {
      name: formData.name,
      purpose: formData.purpose,
      webhook_url: formData.webhook_url,
      requires_prompt: true, // Always allow prompts
      requires_context: true, // Always allow contexts
      default_prompt_id: undefined,
      default_context_ids: [],
    }

    createAutomation(enhancedFormData, {
      onSuccess: () => {
        toast({
          title: 'Success',
          description: 'Automation created successfully'
        })
        onOpenChange(false)
        setFormData({
          name: '',
          purpose: '',
          webhook_url: '',
        })
        onSuccess?.()
      },
      onError: (error) => {
        console.error('Error creating automation:', error)
        toast({
          title: 'Error',
          description: 'Failed to create automation',
          variant: 'destructive'
        })
      }
    })
  }


  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Automation</DialogTitle>
          <DialogDescription>
            Configure your automation workflow. You'll be able to select prompts and contexts when running the automation.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Automation Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Enter automation name"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="purpose">Purpose & Instructions *</Label>
              <Textarea
                id="purpose"
                value={formData.purpose}
                onChange={(e) => setFormData(prev => ({ ...prev, purpose: e.target.value }))}
                placeholder="Describe what this automation does and provide any specific instructions"
                rows={4}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="webhook_url">Webhook URL *</Label>
              <Input
                id="webhook_url"
                value={formData.webhook_url}
                onChange={(e) => setFormData(prev => ({ ...prev, webhook_url: e.target.value }))}
                placeholder="https://your-n8n-webhook-url"
                type="url"
                required
              />
            </div>


            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                💡 <strong>Note:</strong> You'll be able to select prompts and contexts when running this automation.
              </p>
            </div>

            <div className="flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? 'Creating...' : 'Create Automation'}
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}