import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Eye, Sparkles, Zap } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { useToast } from '../components/ui/use-toast';
import { useGetPrompt } from '../hooks/prompts/useGetPrompt';
import { useGeneratePrompt } from '../hooks/prompts/useGeneratePrompt';
import { useGetContexts } from '../hooks/contexts/useGetContexts';
import { useContextSuggestions, useTrackPromptUsage } from '../hooks/prompts/usePromptUsageAnalytics';
import { usePromptTokenCount } from '../hooks/prompts/usePromptTokenCount';
import { StepIndicator } from '../components/prompts/StepIndicator';
import { GenerateModal } from '../components/prompts/GenerateModal';
import { PromptPreviewModal } from '../components/prompts/PromptPreviewModal';
import { ContextSelector } from '../components/contexts/ContextSelector';
import { ContextBuildingArea } from '../components/contexts/ContextBuildingArea';
import { EnhancedFinalPrompt } from '../components/prompts/EnhancedFinalPrompt';
import { TokenEstimateIndicator } from '../components/prompts/TokenEstimateIndicator';
import ReactMarkdown from 'react-markdown';
import { useKeyboardShortcuts } from '../hooks/ui/useKeyboardShortcuts';
import { useResponsive } from '../hooks/ui/useResponsive';
import type { Context } from '../types/context';
import type { ContextSelectionState } from '../types/enhanced-workflow';


const WORKFLOW_STEPS = [
  { title: 'Prompt Preview', description: 'Review and understand the prompt content' },
  { title: 'Context Selection', description: 'Choose contexts from your library or add custom content' },
  { title: 'Generate Response', description: 'Review final prompt and generate AI response' }
];

export default function PromptWorkflowPage() {
  const { promptId } = useParams<{ promptId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Workflow state
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedContexts, setSelectedContexts] = useState<Context[]>([]);
  const [customContext, setCustomContext] = useState('');
  const [generatedResponse, setGeneratedResponse] = useState('');
  const [copied, setCopied] = useState(false);
  
  // Modal states
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false);

  // Data fetching hooks
  const { data: prompt, isLoading: loading, error } = useGetPrompt(promptId);
  const { mutate: generatePrompt, isPending: isGenerating } = useGeneratePrompt();
  const { data: contexts = [] } = useGetContexts();
  const { data: suggestedContextIds = [] } = useContextSuggestions(promptId || '');
  const trackUsageMutation = useTrackPromptUsage();

  // Computed values
  const finalPrompt = useMemo(() => {
    if (!prompt?.prompt_content) return '';
    
    let combined = prompt.prompt_content;
    
    if (selectedContexts.length > 0 || customContext.trim()) {
      combined += '\n\n--- CONTEXT ---\n';
      
      selectedContexts.forEach((context, index) => {
        combined += `\n${index + 1}. ${context.title}:\n${context.content}\n`;
      });
      
      if (customContext.trim()) {
        combined += `\n${selectedContexts.length + 1}. Custom Context:\n${customContext}\n`;
      }
    }
    
    return combined;
  }, [prompt?.prompt_content, selectedContexts, customContext]);

  // Token estimation
  const { tokenEstimate, isWithinLimits, warningThreshold } = usePromptTokenCount({
    promptContent: prompt?.prompt_content || '',
    selectedContexts,
    customContext,
  });

  // Responsive design
  const { isMobile, isTablet } = useResponsive();

  // Keyboard shortcuts
  useKeyboardShortcuts([
    {
      key: 'ArrowRight',
      callback: () => {
        if (currentStep < WORKFLOW_STEPS.length - 1) {
          setCurrentStep(currentStep + 1);
        }
      },
      enabled: !isPreviewModalOpen && !isGenerateModalOpen,
    },
    {
      key: 'ArrowLeft',
      callback: () => {
        if (currentStep > 0) {
          setCurrentStep(currentStep - 1);
        }
      },
      enabled: !isPreviewModalOpen && !isGenerateModalOpen,
    },
    {
      key: 'Escape',
      callback: () => {
        if (isPreviewModalOpen) {
          setIsPreviewModalOpen(false);
        } else if (isGenerateModalOpen) {
          setIsGenerateModalOpen(false);
        }
      },
    },
    {
      key: 'Enter',
      ctrl: true,
      callback: () => {
        if (currentStep === 2 && finalPrompt.trim() && isWithinLimits) {
          handleGenerate();
        }
      },
      enabled: !isPreviewModalOpen && !isGenerateModalOpen,
    },
    {
      key: 'p',
      ctrl: true,
      callback: () => {
        if (currentStep === 0) {
          setIsPreviewModalOpen(true);
        }
      },
      enabled: currentStep === 0,
    },
  ]);

  // Event handlers
  const handleContextSelect = (context: Context) => {
    if (!selectedContexts.find(c => c.id === context.id)) {
      setSelectedContexts(prev => [...prev, context]);
    }
  };

  const handleContextDeselect = (contextId: string) => {
    setSelectedContexts(prev => prev.filter(c => c.id !== contextId));
  };

  const handleContextReorder = (reorderedContexts: Context[]) => {
    setSelectedContexts(reorderedContexts);
  };


  const handleGenerate = () => {
    setIsGenerateModalOpen(true);
    generateResponse();
  };

  const generateResponse = () => {
    if (!finalPrompt.trim()) return;

    generatePrompt({ prompt: finalPrompt }, {
      onSuccess: (data) => {
        setGeneratedResponse(data.generatedText);
        
        // Track usage analytics
        if (promptId) {
          trackUsageMutation.mutate({
            promptId,
            contextIds: selectedContexts.map(c => c.id),
          });
        }
        
        toast({
          title: 'Success',
          description: 'Response generated successfully',
        });
      },
      onError: (error) => {
        console.error('Error generating response:', error);
        toast({
          title: 'Error',
          description: 'Failed to generate response',
          variant: 'destructive',
        });
      }
    });
  };

  const handleRegenerate = () => {
    generateResponse();
  };

  const handleCopy = async (text: string, type: 'prompt' | 'plain') => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast({
        title: 'Copied',
        description: `${type === 'prompt' ? 'Formatted' : 'Plain'} text copied to clipboard`,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to copy text',
        variant: 'destructive',
      });
    }
  };

  const handleExport = () => {
    const exportData = {
      prompt: prompt?.title || 'Untitled Prompt',
      content: finalPrompt,
      response: generatedResponse,
      contexts: selectedContexts.map(c => c.title),
      timestamp: new Date().toISOString(),
    };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { 
      type: 'application/json' 
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `prompt-export-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: 'Exported',
      description: 'Prompt and response exported successfully',
    });
  };

  // Handle error from prompt fetch
  if (error) {
    toast({
      title: 'Error',
      description: 'Failed to load prompt',
      variant: 'destructive',
    });
    navigate('/prompts');
    return null;
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading prompt...</p>
        </div>
      </div>
    );
  }

  if (!prompt) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Prompt not found</p>
        <Button onClick={() => navigate('/prompts')} className="mt-4">
          Back to Prompts
        </Button>
      </div>
    );
  }

  return (
    <div className={`${isMobile ? 'max-w-full px-4' : 'max-w-6xl'} mx-auto space-y-6`}>
      {/* Header */}
      <div className={`flex items-center gap-4 ${isMobile ? 'flex-col' : 'flex-row'}`}>
        <Button 
          variant="ghost" 
          onClick={() => navigate('/prompts')}
          className="gap-2 self-start"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Prompts
        </Button>
        <div className={`${isMobile ? 'w-full text-center' : 'flex-1'}`}>
          <h1 className={`${isMobile ? 'text-xl' : 'text-2xl'} font-bold`}>{prompt.title}</h1>
          <p className="text-muted-foreground">{prompt.description}</p>
        </div>
        {!isMobile && (
          <TokenEstimateIndicator 
            tokenEstimate={tokenEstimate} 
            compact 
            className="ml-auto"
          />
        )}
      </div>

      {/* Mobile Token Indicator */}
      {isMobile && (
        <div className="flex justify-center">
          <TokenEstimateIndicator 
            tokenEstimate={tokenEstimate} 
            compact 
          />
        </div>
      )}

      {/* Progress Steps */}
      <StepIndicator steps={WORKFLOW_STEPS} currentStep={currentStep} />

      {/* Step Content */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>{WORKFLOW_STEPS[currentStep].title}</CardTitle>
              <CardDescription>{WORKFLOW_STEPS[currentStep].description}</CardDescription>
            </div>
            {/* Preview button only on step 1 */}
            {currentStep === 0 && (
              <Button
                onClick={() => setIsPreviewModalOpen(true)}
                variant="outline"
                className="gap-2"
              >
                <Eye className="h-5 w-5" />
                Preview Full Prompt
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Step 1: Prompt Preview */}
          {currentStep === 0 && (
            <div className="space-y-6">
              {/* Purpose display */}
              <div className="bg-gradient-to-br from-primary/5 to-secondary/5 rounded-lg p-6 border">
                <div className="flex items-start gap-3">
                  <div className="bg-primary/10 rounded-full p-2 shrink-0">
                    <Sparkles className="h-5 w-5 text-primary" />
                  </div>
                  <div className="space-y-3 flex-1">
                    <h3 className="font-semibold text-lg">How this prompt works</h3>
                    <div className="prose prose-sm dark:prose-invert max-w-none">
                      <ReactMarkdown 
                        components={{
                          p: ({ children }) => <p className="mb-3 leading-relaxed text-foreground/80">{children}</p>,
                          h1: ({ children }) => <h1 className="text-lg font-semibold mb-3 text-foreground">{children}</h1>,
                          h2: ({ children }) => <h2 className="text-base font-semibold mb-2 text-foreground">{children}</h2>,
                          h3: ({ children }) => <h3 className="text-sm font-medium mb-2 text-foreground">{children}</h3>,
                          ul: ({ children }) => <ul className="mb-3 space-y-1 list-disc list-inside">{children}</ul>,
                          ol: ({ children }) => <ol className="mb-3 space-y-1 list-decimal list-inside">{children}</ol>,
                          li: ({ children }) => <li className="text-foreground/80 leading-relaxed">{children}</li>,
                          strong: ({ children }) => <strong className="font-medium text-foreground">{children}</strong>,
                        }}
                      >
                        {prompt.purpose}
                      </ReactMarkdown>
                    </div>
                  </div>
                </div>
              </div>


              {/* Quick start info */}
              <div className="grid gap-4 md:grid-cols-2">
                <div className="bg-muted/50 rounded-lg p-4">
                  <h4 className="font-medium mb-2 text-sm">📝 Next Step</h4>
                  <p className="text-sm text-muted-foreground">
                    Choose contexts from your library or add custom content to personalize this prompt.
                  </p>
                </div>
                <div className="bg-muted/50 rounded-lg p-4">
                  <h4 className="font-medium mb-2 text-sm">✨ Final Step</h4>
                  <p className="text-sm text-muted-foreground">
                    Generate an AI response based on your prompt and selected context.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Context Selection */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div className={`grid ${isMobile ? 'grid-cols-1' : isTablet ? 'grid-cols-1' : 'grid-cols-1 lg:grid-cols-2'} gap-6`}>
                <div className="w-full">
                  <ContextSelector
                    selectedContexts={selectedContexts}
                    onSelectContext={handleContextSelect}
                    onDeselectContext={handleContextDeselect}
                    suggestedContextIds={suggestedContextIds}
                  />
                </div>
                <div className="space-y-4">
                  <ContextBuildingArea
                    selectedContexts={selectedContexts}
                    customContext={customContext}
                    onCustomContextChange={setCustomContext}
                    onRemoveContext={handleContextDeselect}
                    onReorderContexts={handleContextReorder}
                    tokenEstimate={tokenEstimate}
                    showTokenWarning={warningThreshold}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Final Prompt & Generate */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <EnhancedFinalPrompt
                promptContent={prompt.prompt_content || ''}
                selectedContexts={selectedContexts}
                customContext={customContext}
                finalPrompt={finalPrompt}
                tokenEstimate={tokenEstimate}
                onCopy={handleCopy}
                onExport={handleExport}
                copied={copied}
              />

              <div className="flex items-center justify-center">
                <Button 
                  onClick={handleGenerate}
                  disabled={!finalPrompt.trim() || !isWithinLimits}
                  size="lg"
                  className="gap-2 bg-gradient-primary hover:bg-gradient-primary/90 text-white shadow-orange px-8"
                >
                  <Sparkles className="h-5 w-5" />
                  Generate AI Response
                  <Zap className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modals */}
      <PromptPreviewModal
        prompt={prompt}
        isOpen={isPreviewModalOpen}
        onClose={() => setIsPreviewModalOpen(false)}
        onCopy={handleCopy}
        copied={copied}
      />

      <GenerateModal
        isOpen={isGenerateModalOpen}
        onClose={() => setIsGenerateModalOpen(false)}
        generatedResponse={generatedResponse}
        isGenerating={isGenerating}
        onGenerate={generateResponse}
        onRegenerate={handleRegenerate}
        onExport={handleExport}
        canRegenerate={true}
      />

      {/* Navigation */}
      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
          disabled={currentStep === 0}
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Previous
        </Button>
        
        <Button
          onClick={() => setCurrentStep(Math.min(WORKFLOW_STEPS.length - 1, currentStep + 1))}
          disabled={currentStep === WORKFLOW_STEPS.length - 1}
          className="gap-2"
        >
          Next
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}