import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card"
import { Button } from "../ui/button"
import { Badge } from "../ui/badge"
import { Play, Trash2, Workflow, FileText, Database, History } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { useToast } from "../ui/use-toast"
import { EnhancedAutomation } from "../../types/automation"
import { useDeleteAutomation } from "../../hooks/automations/useDeleteAutomation"

interface AutomationCardProps {
  automation: EnhancedAutomation
  onDelete: () => void
  onExecute?: (automation: EnhancedAutomation) => void
  onViewHistory?: (automation: EnhancedAutomation) => void
}

export default function AutomationCard({ automation, onDelete, onExecute, onViewHistory }: AutomationCardProps) {
  const navigate = useNavigate()
  const { toast } = useToast()
  const { mutate: deleteAutomation } = useDeleteAutomation()

  const handleStart = () => {
    if (onExecute) {
      onExecute(automation)
    } else {
      navigate(`/automations/workflow/${automation.id}`)
    }
  }

  const handleViewHistory = () => {
    if (onViewHistory) {
      onViewHistory(automation)
    }
  }

  const handleDelete = async () => {
    deleteAutomation(automation.id, {
      onSuccess: () => {
        toast({ title: "Deleted", description: "Automation removed" })
        onDelete()
      },
      onError: (error) => {
        console.error('Error deleting automation:', error)
        toast({ title: "Error", description: "Failed to delete automation", variant: "destructive" })
      }
    })
  }

  const isEnhanced = automation.input_schema?.type === 'prompt_context_automation'

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div className="p-2 bg-muted rounded-lg flex-shrink-0">
              <Workflow className="h-6 w-6 text-muted-foreground" />
            </div>
            <div className="flex-1 min-w-0">
              <CardTitle className="text-sm font-medium truncate max-w-full mb-1" title={automation.name}>
                {automation.name}
              </CardTitle>
              <CardDescription className="text-xs truncate">
                {automation.category ? `${automation.category} • ` : ''}
                {automation.description || automation.purpose || 'Automation'}
              </CardDescription>
              
              {/* Enhanced metadata */}
              {isEnhanced && automation.input_schema && (
                <div className="flex items-center gap-2 mt-2">
                  {automation.input_schema.requires_prompt && (
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <FileText className="h-3 w-3" />
                      <span>Prompt</span>
                    </div>
                  )}
                  {automation.input_schema.requires_context && (
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Database className="h-3 w-3" />
                      <span>Context</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground">
            Created {new Date(automation.created_at).toLocaleDateString()}
          </p>
          <div className="flex items-center gap-1">
            {isEnhanced && onViewHistory && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleViewHistory}
                className="h-8 w-8 p-0"
                title="View History"
              >
                <History className="h-4 w-4" />
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleStart}
              className="h-8 w-8 p-0"
              title={isEnhanced ? "Execute" : "Start"}
            >
              <Play className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDelete}
              className="h-8 w-8 p-0 text-destructive hover:text-destructive"
              title="Delete"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}