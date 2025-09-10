import { useState } from "react"
import { Button } from "../ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog"
import { Input } from "../ui/input"
import { Label } from "../ui/label"
import { Textarea } from "../ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select"
import { Switch } from "../ui/switch"
import { Plus } from "lucide-react"
import { useToast } from "../ui/use-toast"
import { supabase } from "../../lib/supabaseClient"

interface AutomationFormProps {
  onAutomationCreated: () => void
}

export default function AutomationForm({ onAutomationCreated }: AutomationFormProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()
  
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "",
    purpose: "",
    webhook_url: "",
    input_schema: "",
    active: true
  })

  const categories = [
    "Data Processing",
    "Notifications",
    "Reporting", 
    "Integration",
    "Monitoring",
    "Workflow",
    "Other"
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      let parsedSchema = null
      if (formData.input_schema.trim()) {
        try {
          parsedSchema = JSON.parse(formData.input_schema)
        } catch {
          toast({
            title: "Invalid JSON",
            description: "Input schema must be valid JSON",
            variant: "destructive"
          })
          setIsLoading(false)
          return
        }
      }

      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        throw new Error("Authentication required")
      }

      const { error } = await supabase
        .from('automations')
        .insert({
          user_id: user.id,
          name: formData.name,
          description: formData.description || null,
          category: formData.category || null,
          purpose: formData.purpose,
          webhook_url: formData.webhook_url,
          input_schema: parsedSchema,
          active: formData.active
        })

      if (error) throw error

      toast({
        title: "Success",
        description: "Automation created successfully"
      })

      setFormData({
        name: "",
        description: "",
        category: "",
        purpose: "",
        webhook_url: "",
        input_schema: "",
        active: true
      })
      setIsOpen(false)
      onAutomationCreated()

    } catch (error) {
      console.error('Error creating automation:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create automation",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="bg-gradient-primary text-primary-foreground shadow-orange">
          <Plus className="mr-2 h-4 w-4" />
          New Automation
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Automation</DialogTitle>
          <DialogDescription>
            Configure your n8n automation workflow
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Automation name"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select 
                value={formData.category} 
                onValueChange={(value) => setFormData({ ...formData, category: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Brief description of the automation"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="webhook_url">Webhook URL *</Label>
            <Input
              id="webhook_url"
              type="url"
              value={formData.webhook_url}
              onChange={(e) => setFormData({ ...formData, webhook_url: e.target.value })}
              placeholder="https://your-n8n-instance.com/webhook/your-webhook-id"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="purpose">Purpose & Instructions *</Label>
            <Textarea
              id="purpose"
              value={formData.purpose}
              onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
              placeholder="Describe what this automation does and how to use it..."
              className="min-h-[100px]"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="input_schema">Input Schema (JSON)</Label>
            <Textarea
              id="input_schema"
              value={formData.input_schema}
              onChange={(e) => setFormData({ ...formData, input_schema: e.target.value })}
              placeholder='{"field1": {"type": "string", "required": true}, "field2": {"type": "number"}}'
              className="min-h-[80px] font-mono text-sm"
            />
            <p className="text-xs text-muted-foreground">
              Optional JSON schema to define input fields. Leave empty for generic text input.
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="active"
              checked={formData.active}
              onCheckedChange={(checked) => setFormData({ ...formData, active: checked })}
            />
            <Label htmlFor="active">Active</Label>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Creating..." : "Create Automation"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}