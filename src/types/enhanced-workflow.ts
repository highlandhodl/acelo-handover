import type { Context, ContextCategory } from './context';
import type { Prompt } from './prompt';

// Enhanced context selection state
export interface ContextSelectionState {
  selectedContexts: Context[];
  customContext: string;
  searchTerm: string;
  selectedCategory?: ContextCategory;
}


// Usage analytics for context suggestions
export interface PromptUsageAnalytics {
  id: string;
  user_id: string;
  prompt_id: string;
  context_ids: string[];
  generated_at: string;
}

// Token estimation data
export interface TokenEstimate {
  promptTokens: number;
  contextTokens: number;
  totalTokens: number;
  estimatedCost?: number;
}

// Enhanced workflow state management
export interface WorkflowState {
  currentStep: number;
  prompt: Prompt | null;
  contextSelection: ContextSelectionState;
  finalPrompt: string;
  generatedResponse: string;
  tokenEstimate: TokenEstimate;
}

// Context selection with preview
export interface ContextWithPreview extends Context {
  preview: string; // First 100 characters of content
  wordCount: number;
  isSelected?: boolean;
}

// Context drag and drop ordering
export interface ContextOrderItem {
  contextId: string;
  order: number;
}

// Export functionality data
export interface PromptExportData {
  prompt: Prompt;
  selectedContexts: Context[];
  customContext: string;
  finalPrompt: string;
  generatedResponse?: string;
  exportedAt: string;
}