import { useMemo } from 'react';
import type { Context } from '../../types/context';
import type { TokenEstimate } from '../../types/enhanced-workflow';

// Rough token estimation: ~4 characters per token (OpenAI's approximation)
const CHARS_PER_TOKEN = 4;
const TOKEN_COST_PER_1K = 0.0015; // Approximate cost per 1K tokens for GPT-3.5

interface UsePromptTokenCountOptions {
  promptContent: string;
  selectedContexts: Context[];
  customContext: string;
}

export const usePromptTokenCount = ({ promptContent, selectedContexts, customContext }: UsePromptTokenCountOptions) => {
  const tokenEstimate: TokenEstimate = useMemo(() => {
    // Calculate prompt tokens
    const promptTokens = Math.ceil(promptContent.length / CHARS_PER_TOKEN);
    
    // Calculate context tokens from selected contexts
    const selectedContextTokens = selectedContexts.reduce((total, context) => {
      return total + Math.ceil(context.content.length / CHARS_PER_TOKEN);
    }, 0);
    
    // Calculate custom context tokens
    const customContextTokens = Math.ceil(customContext.length / CHARS_PER_TOKEN);
    
    // Total context tokens
    const contextTokens = selectedContextTokens + customContextTokens;
    
    // Total tokens
    const totalTokens = promptTokens + contextTokens;
    
    // Estimated cost
    const estimatedCost = (totalTokens / 1000) * TOKEN_COST_PER_1K;
    
    return {
      promptTokens,
      contextTokens,
      totalTokens,
      estimatedCost,
    };
  }, [promptContent, selectedContexts, customContext]);

  const isWithinLimits = useMemo(() => {
    const MAX_TOKENS = 4000; // Conservative limit for most models
    return tokenEstimate.totalTokens <= MAX_TOKENS;
  }, [tokenEstimate.totalTokens]);

  const warningThreshold = useMemo(() => {
    const WARNING_TOKENS = 3500; // Warn when approaching limit
    return tokenEstimate.totalTokens >= WARNING_TOKENS;
  }, [tokenEstimate.totalTokens]);

  return {
    tokenEstimate,
    isWithinLimits,
    warningThreshold,
  };
};