import { useState, useMemo } from "react"
import { Search, Filter, Plus, Workflow } from "lucide-react"
import { Card } from "../components/ui/card"
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { Skeleton } from "../components/ui/skeleton"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../components/ui/dialog"
import { useToast } from "../components/ui/use-toast"
import AutomationCard from "../components/automations/AutomationCard"
import EnhancedAutomationCreationModal from "../components/automations/EnhancedAutomationCreationModal"
import AutomationExecutionModal from "../components/automations/AutomationExecutionModal"
import AutomationRunHistory from "../components/automations/AutomationRunHistory"
import { useGetEnhancedAutomations } from "../hooks/automations/useGetEnhancedAutomations"
import { EnhancedAutomation } from "../types/automation"

export default function AutomationsPage() {
  const { toast } = useToast()
  const { data: automations = [], isLoading, refetch } = useGetEnhancedAutomations()
  const [searchTerm, setSearchTerm] = useState('')
  const [showEnhancedCreation, setShowEnhancedCreation] = useState(false)
  const [executionAutomation, setExecutionAutomation] = useState<EnhancedAutomation | null>(null)
  const [historyAutomation, setHistoryAutomation] = useState<EnhancedAutomation | null>(null)
  
  
  const filteredAutomations = useMemo(() => {
    return automations.filter(automation =>
      (automation.name?.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (automation.description?.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (automation.purpose?.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [automations, searchTerm]);

  const handleExecuteAutomation = (automation: EnhancedAutomation) => {
    setExecutionAutomation(automation)
  }

  const handleViewHistory = (automation: EnhancedAutomation) => {
    setHistoryAutomation(automation)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold text-foreground">Automation Hub</h2>
          <p className="text-muted-foreground">Create and manage automated workflows with AI prompts and contexts</p>
        </div>
        <Button 
          onClick={() => setShowEnhancedCreation(true)}
          className="bg-gradient-primary text-primary-foreground shadow-orange gap-2"
        >
          <Plus className="h-4 w-4" />
          New Automation
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input 
            placeholder="Search automations..." 
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button variant="outline" className="gap-2">
          <Filter className="h-4 w-4" />
          Filter
        </Button>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Your Automations</h3>
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="p-6">
                <div className="space-y-3">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </Card>
            ))}
          </div>
        ) : filteredAutomations.length === 0 ? (
          <div className="text-center py-12">
            <div className="mx-auto w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-4">
              <Workflow className="h-10 w-10 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium mb-2">
              {searchTerm ? 'No automations found' : 'No automations yet'}
            </h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              {searchTerm 
                ? 'Try adjusting your search to find what you\'re looking for.'
                : 'Create your first automation to get started with workflow automation.'
              }
            </p>
            {!searchTerm && (
              <Button onClick={() => setShowEnhancedCreation(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Automation
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredAutomations.map((automation) => (
              <AutomationCard
                key={automation.id}
                automation={automation}
                onDelete={() => refetch()}
                onExecute={handleExecuteAutomation}
                onViewHistory={handleViewHistory}
              />
            ))}
          </div>
        )}
      </div>

      {/* Modals */}
      <EnhancedAutomationCreationModal
        open={showEnhancedCreation}
        onOpenChange={setShowEnhancedCreation}
        onSuccess={refetch}
      />
      
      <AutomationExecutionModal
        automation={executionAutomation}
        open={!!executionAutomation}
        onOpenChange={(open) => !open && setExecutionAutomation(null)}
      />

      <Dialog open={!!historyAutomation} onOpenChange={(open) => !open && setHistoryAutomation(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Run History: {historyAutomation?.name}
            </DialogTitle>
          </DialogHeader>
          {historyAutomation && (
            <AutomationRunHistory 
              automationId={historyAutomation.id}
              limit={50}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}