import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { Badge } from '../ui/badge'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '../ui/collapsible'
import { 
  ChevronDown, 
  ChevronRight, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Mail,
  FileText,
  Database
} from 'lucide-react'
import { useGetAutomationRuns } from '../../hooks/automations/useGetAutomationRuns'
import { AutomationRun, AutomationRunInputData } from '../../types/automation'

interface AutomationRunHistoryProps {
  automationId?: string
  limit?: number
}

interface RunDetailsProps {
  run: AutomationRun
}

function RunDetails({ run }: RunDetailsProps) {
  const [inputExpanded, setInputExpanded] = useState(false)
  const [outputExpanded, setOutputExpanded] = useState(false)

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />
      case 'running':
        return <Clock className="h-4 w-4 text-blue-500" />
      default:
        return <AlertCircle className="h-4 w-4 text-yellow-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'failed':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'running':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      default:
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
    }
  }

  const formatDuration = (durationMs?: number) => {
    if (!durationMs) return 'N/A'
    
    if (durationMs < 1000) {
      return `${durationMs}ms`
    }
    
    const seconds = Math.floor(durationMs / 1000)
    if (seconds < 60) {
      return `${seconds}s`
    }
    
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}m ${remainingSeconds}s`
  }

  const inputData = run.input_data as AutomationRunInputData
  
  return (
    <Card className="mb-4">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {getStatusIcon(run.status)}
            <div>
              <CardTitle className="text-sm">
                Run {run.id.slice(0, 8)}...
              </CardTitle>
              <CardDescription className="text-xs">
                {new Date(run.created_at).toLocaleString()}
              </CardDescription>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge className={getStatusColor(run.status)}>
              {run.status}
            </Badge>
            {run.duration_ms && (
              <Badge variant="outline" className="text-xs">
                {formatDuration(run.duration_ms)}
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Email Address */}
        {inputData?.email_address && (
          <div className="flex items-center gap-2 text-sm">
            <Mail className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Sent to:</span>
            <span>{inputData.email_address}</span>
          </div>
        )}

        {/* Error Message */}
        {run.error_message && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center gap-2 text-sm text-red-800 font-medium mb-1">
              <XCircle className="h-4 w-4" />
              Error
            </div>
            <p className="text-sm text-red-700">{run.error_message}</p>
          </div>
        )}

        {/* Input Data */}
        <Collapsible open={inputExpanded} onOpenChange={setInputExpanded}>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="sm" className="w-full justify-start p-0">
              {inputExpanded ? (
                <ChevronDown className="h-4 w-4 mr-2" />
              ) : (
                <ChevronRight className="h-4 w-4 mr-2" />
              )}
              <FileText className="h-4 w-4 mr-2" />
              Input Data
              {inputData?.prompt && (
                <Badge variant="outline" className="ml-2 text-xs">
                  Prompt
                </Badge>
              )}
              {inputData?.contexts && (
                <Badge variant="outline" className="ml-1 text-xs">
                  {inputData.contexts.length} Context{inputData.contexts.length !== 1 ? 's' : ''}
                </Badge>
              )}
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="mt-2">
            <div className="p-3 bg-muted rounded-lg">
              <pre className="text-xs overflow-auto max-h-64 whitespace-pre-wrap break-words">
                {JSON.stringify(run.input_data, null, 2)}
              </pre>
            </div>
          </CollapsibleContent>
        </Collapsible>

        {/* Output Data */}
        {run.output_data && (
          <Collapsible open={outputExpanded} onOpenChange={setOutputExpanded}>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm" className="w-full justify-start p-0">
                {outputExpanded ? (
                  <ChevronDown className="h-4 w-4 mr-2" />
                ) : (
                  <ChevronRight className="h-4 w-4 mr-2" />
                )}
                <Database className="h-4 w-4 mr-2" />
                Output Data
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-2">
              <div className="p-3 bg-muted rounded-lg">
                <pre className="text-xs overflow-auto max-h-64 whitespace-pre-wrap break-words">
                  {JSON.stringify(run.output_data, null, 2)}
                </pre>
              </div>
            </CollapsibleContent>
          </Collapsible>
        )}
      </CardContent>
    </Card>
  )
}

export default function AutomationRunHistory({ 
  automationId, 
  limit = 20 
}: AutomationRunHistoryProps) {
  const { data: runs = [], isLoading, error } = useGetAutomationRuns({ 
    automationId, 
    limit 
  })

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-32 bg-muted animate-pulse rounded-lg" />
        <div className="h-32 bg-muted animate-pulse rounded-lg" />
        <div className="h-32 bg-muted animate-pulse rounded-lg" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
        <div className="flex items-center gap-2 text-red-800 font-medium">
          <XCircle className="h-4 w-4" />
          Error loading run history
        </div>
        <p className="text-sm text-red-700 mt-1">
          {error instanceof Error ? error.message : 'Unknown error occurred'}
        </p>
      </div>
    )
  }

  if (runs.length === 0) {
    return (
      <div className="text-center py-8">
        <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-medium text-muted-foreground mb-2">
          No runs yet
        </h3>
        <p className="text-sm text-muted-foreground">
          {automationId 
            ? 'This automation hasn\'t been executed yet.'
            : 'No automation runs found.'
          }
        </p>
      </div>
    )
  }

  const completedRuns = runs.filter(r => r.status === 'completed').length
  const failedRuns = runs.filter(r => r.status === 'failed').length
  const runningRuns = runs.filter(r => r.status === 'running').length

  return (
    <div className="space-y-4">
      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="text-center p-3 bg-green-50 border border-green-200 rounded-lg">
          <div className="text-2xl font-bold text-green-700">{completedRuns}</div>
          <div className="text-xs text-green-600">Completed</div>
        </div>
        <div className="text-center p-3 bg-red-50 border border-red-200 rounded-lg">
          <div className="text-2xl font-bold text-red-700">{failedRuns}</div>
          <div className="text-xs text-red-600">Failed</div>
        </div>
        <div className="text-center p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="text-2xl font-bold text-blue-700">{runningRuns}</div>
          <div className="text-xs text-blue-600">Running</div>
        </div>
      </div>

      {/* Run History */}
      <div className="space-y-2">
        {runs.map((run) => (
          <RunDetails key={run.id} run={run} />
        ))}
      </div>

      {runs.length >= limit && (
        <div className="text-center py-4">
          <p className="text-sm text-muted-foreground">
            Showing latest {limit} runs. 
          </p>
        </div>
      )}
    </div>
  )
}