import { useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { ArrowLeft, Play, Check, Clock, AlertCircle, Sparkles, Zap, Settings } from "lucide-react"
import { Button } from "../components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card"
import { Textarea } from "../components/ui/textarea"
import { Input } from "../components/ui/input"
import { Label } from "../components/ui/label"
import { Badge } from "../components/ui/badge"
import { Skeleton } from "../components/ui/skeleton"
import { useToast } from "../components/ui/use-toast"
import { useGetAutomation } from "../hooks/automations/useGetAutomation"
import { useRunAutomation } from "../hooks/automations/useRunAutomation"
import { StepIndicator } from "../components/prompts/StepIndicator"
import ReactMarkdown from "react-markdown"

const AUTOMATION_STEPS = [
  { title: 'Purpose & Instructions', description: 'Learn how this automation works' },
  { title: 'Configure Input', description: 'Provide the required data' },
  { title: 'Results', description: 'View automation output and results' }
];

interface AutomationRun {
  id: string
  status: string
  output_data?: Record<string, unknown> | string
  error_message?: string
  duration_ms?: number
  created_at: string
}

export default function AutomationWorkflowPage() {
  const { automationId } = useParams()
  const navigate = useNavigate()
  const { toast } = useToast()
  
  const [currentStep, setCurrentStep] = useState(1)
  const [inputData, setInputData] = useState<Record<string, unknown>>({})
  const [run, setRun] = useState<AutomationRun | null>(null)

  const { data: automation, isLoading, error } = useGetAutomation(automationId)
  const { mutate: runAutomationMutation, isPending: isRunning } = useRunAutomation()

  // Handle error from automation fetch
  if (error) {
    toast({
      title: "Error",
      description: "Failed to load automation",
      variant: "destructive"
    })
    navigate('/automations')
  }

  const handleInputChange = (field: string, value: string | number) => {
    setInputData(prev => ({ ...prev, [field]: value }))
  }

  const runAutomation = () => {
    if (!automation) return

    runAutomationMutation({
      automationId: automation.id,
      inputData
    }, {
      onSuccess: (data) => {
        setRun({
          id: data.runId,
          status: data.status,
          output_data: data.output,
          duration_ms: data.duration,
          created_at: new Date().toISOString()
        })

        setCurrentStep(3)

        if (data.success) {
          toast({
            title: "Success",
            description: "Automation completed successfully"
          })
        } else {
          toast({
            title: "Warning", 
            description: "Automation completed with errors",
            variant: "destructive"
          })
        }
      },
      onError: (error) => {
        console.error('Error running automation:', error)
        toast({
          title: "Error",
          description: error instanceof Error ? error.message : "Failed to run automation",
          variant: "destructive"
        })
      }
    })
  }

  const renderInputForm = () => {
    if (!automation?.input_schema) {
      return (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="input">Input Data</Label>
            <Textarea
              id="input"
              value={inputData.input || ''}
              onChange={(e) => handleInputChange('input', e.target.value)}
              placeholder="Enter your input data here..."
              className="min-h-[200px]"
            />
          </div>
        </div>
      )
    }

    return (
      <div className="space-y-4">
        {Object.entries(automation.input_schema).map(([field, schema]: [string, { type: string; required?: boolean; multiline?: boolean; description?: string }]) => (
          <div key={field} className="space-y-2">
            <Label htmlFor={field}>
              {field.charAt(0).toUpperCase() + field.slice(1)}
              {schema.required && <span className="text-destructive ml-1">*</span>}
            </Label>
            {schema.type === 'string' && schema.multiline ? (
              <Textarea
                id={field}
                value={inputData[field] || ''}
                onChange={(e) => handleInputChange(field, e.target.value)}
                placeholder={schema.description || `Enter ${field}...`}
                required={schema.required}
              />
            ) : (
              <Input
                id={field}
                type={schema.type === 'number' ? 'number' : 'text'}
                value={inputData[field] || ''}
                onChange={(e) => handleInputChange(field, e.target.value)}
                placeholder={schema.description || `Enter ${field}...`}
                required={schema.required}
              />
            )}
          </div>
        ))}
      </div>
    )
  }

  const renderOutput = () => {
    if (!run) return null

    const isSuccess = run.status === 'completed'
    const isError = run.status === 'failed'

    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Badge variant={isSuccess ? "default" : isError ? "destructive" : "secondary"}>
            {isSuccess && <Check className="h-3 w-3 mr-1" />}
            {isError && <AlertCircle className="h-3 w-3 mr-1" />}
            {!isSuccess && !isError && <Clock className="h-3 w-3 mr-1" />}
            {run.status}
          </Badge>
          {run.duration_ms && (
            <span className="text-sm text-muted-foreground">
              {run.duration_ms}ms
            </span>
          )}
        </div>

        {run.error_message && (
          <Card className="border-destructive/50">
            <CardHeader>
              <CardTitle className="text-destructive">Error</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="text-sm whitespace-pre-wrap">{run.error_message}</pre>
            </CardContent>
          </Card>
        )}

        {run.output_data && (
          <Card>
            <CardHeader>
              <CardTitle>Output</CardTitle>
            </CardHeader>
            <CardContent>
              {typeof run.output_data === 'string' && run.output_data.includes('# ') ? (
                <div className="prose prose-sm max-w-none">
                  <ReactMarkdown>{run.output_data}</ReactMarkdown>
                </div>
              ) : typeof run.output_data === 'object' ? (
                <pre className="text-sm bg-muted p-4 rounded-md overflow-auto whitespace-pre-wrap break-words">
                  {JSON.stringify(run.output_data, null, 2)}
                </pre>
              ) : (
                <div className="text-sm whitespace-pre-wrap break-words">
                  {run.output_data}
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => navigate('/automations')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </div>
        <div className="space-y-4">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-96" />
        </div>
      </div>
    )
  }

  if (!automation) {
    return <div>Automation not found</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => navigate('/automations')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-foreground">{automation.name}</h1>
          {automation.description && (
            <p className="text-muted-foreground">{automation.description}</p>
          )}
        </div>
      </div>

      {/* Progress Steps */}
      <StepIndicator steps={AUTOMATION_STEPS} currentStep={currentStep - 1} />

      {/* Step Content */}
      <Card>
        <CardHeader>
          <CardTitle>{AUTOMATION_STEPS[currentStep - 1].title}</CardTitle>
          <CardDescription>{AUTOMATION_STEPS[currentStep - 1].description}</CardDescription>
        </CardHeader>
        <CardContent>
          {currentStep === 1 && (
            <div className="space-y-6">
              {/* Clean purpose display */}
              <div className="bg-gradient-to-br from-primary/5 to-secondary/5 rounded-lg p-6 border">
                <div className="flex items-start gap-3">
                  <div className="bg-primary/10 rounded-full p-2 shrink-0">
                    <Zap className="h-5 w-5 text-primary" />
                  </div>
                  <div className="space-y-3">
                    <h3 className="font-semibold text-lg">How this automation works</h3>
                    <div className="prose prose-sm dark:prose-invert max-w-none prose-headings:text-foreground prose-p:text-foreground/80 prose-strong:text-foreground prose-ul:text-foreground/80 prose-ol:text-foreground/80 prose-li:text-foreground/80">
                      <ReactMarkdown 
                        components={{
                          p: ({ children }) => <p className="mb-3 leading-relaxed">{children}</p>,
                          h1: ({ children }) => <h1 className="text-lg font-semibold mb-3 text-foreground">{children}</h1>,
                          h2: ({ children }) => <h2 className="text-base font-semibold mb-2 text-foreground">{children}</h2>,
                          h3: ({ children }) => <h3 className="text-sm font-medium mb-2 text-foreground">{children}</h3>,
                          ul: ({ children }) => <ul className="mb-3 space-y-1 list-disc list-inside">{children}</ul>,
                          ol: ({ children }) => <ol className="mb-3 space-y-1 list-decimal list-inside">{children}</ol>,
                          li: ({ children }) => <li className="text-foreground/80 leading-relaxed">{children}</li>,
                          strong: ({ children }) => <strong className="font-medium text-foreground">{children}</strong>,
                        }}
                      >
                        {automation.purpose}
                      </ReactMarkdown>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick start info */}
              <div className="grid gap-4 md:grid-cols-2">
                <div className="bg-muted/50 rounded-lg p-4">
                  <h4 className="font-medium mb-2 text-sm">⚙️ What you'll configure</h4>
                  <p className="text-sm text-muted-foreground">Provide the input data required for this automation to run successfully.</p>
                </div>
                <div className="bg-muted/50 rounded-lg p-4">
                  <h4 className="font-medium mb-2 text-sm">🚀 What you'll get</h4>
                  <p className="text-sm text-muted-foreground">Automated results and outputs generated based on your specific input data.</p>
                </div>
              </div>

              {/* Continue Button */}
              <Button 
                onClick={() => setCurrentStep(2)}
                className="w-full md:w-auto gap-2 bg-gradient-primary hover:bg-gradient-primary/90 text-white shadow-orange"
                size="lg"
              >
                <Settings className="h-4 w-4" />
                Continue to Configuration
              </Button>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-6">
              {renderInputForm()}
              <div className="flex flex-col sm:flex-row gap-3">
                <Button 
                  variant="outline" 
                  onClick={() => setCurrentStep(1)}
                  className="gap-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back to Instructions
                </Button>
                <Button 
                  onClick={runAutomation} 
                  disabled={isRunning}
                  className="gap-2 bg-gradient-primary hover:bg-gradient-primary/90 text-white shadow-orange flex-1 sm:flex-initial"
                  size="lg"
                >
                  {isRunning ? (
                    <>
                      <Clock className="h-4 w-4 animate-spin" />
                      Running Automation...
                    </>
                  ) : (
                    <>
                      <Play className="h-4 w-4" />
                      Run Automation
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-6">
              {renderOutput()}
              <div className="flex flex-col sm:flex-row gap-3">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setCurrentStep(1)
                    setRun(null)
                    setInputData({})
                  }}
                  className="gap-2"
                >
                  <Sparkles className="h-4 w-4" />
                  Start Over
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setCurrentStep(2)}
                  className="gap-2"
                >
                  <Settings className="h-4 w-4" />
                  Configure Again
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}