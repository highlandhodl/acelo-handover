import React from 'react';
import { AlertTriangle, Info } from 'lucide-react';
import { Badge } from '../ui/badge';
import { Card, CardContent } from '../ui/card';
import { Progress } from '../ui/progress';
import type { TokenEstimate } from '../../types/enhanced-workflow';

interface TokenEstimateIndicatorProps {
  tokenEstimate: TokenEstimate;
  maxTokens?: number;
  warningThreshold?: number;
  className?: string;
  compact?: boolean;
}

export const TokenEstimateIndicator: React.FC<TokenEstimateIndicatorProps> = ({
  tokenEstimate,
  maxTokens = 4000,
  warningThreshold = 3500,
  className = '',
  compact = false,
}) => {
  const { promptTokens, contextTokens, totalTokens, estimatedCost } = tokenEstimate;
  
  const progressPercentage = Math.min((totalTokens / maxTokens) * 100, 100);
  const isWarning = totalTokens >= warningThreshold;
  const isOverLimit = totalTokens > maxTokens;
  
  const getStatusColor = () => {
    if (isOverLimit) return 'text-destructive';
    if (isWarning) return 'text-orange-600 dark:text-orange-400';
    return 'text-green-600 dark:text-green-400';
  };
  
  const getProgressColor = () => {
    if (isOverLimit) return 'bg-destructive';
    if (isWarning) return 'bg-orange-500';
    return 'bg-green-500';
  };

  if (compact) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <Badge variant={isOverLimit ? "destructive" : isWarning ? "secondary" : "outline"} className="gap-1">
          <span className="text-xs">Tokens:</span>
          <span className="font-medium">{totalTokens.toLocaleString()}</span>
        </Badge>
        {isOverLimit && <AlertTriangle className="h-4 w-4 text-destructive" />}
        {isWarning && !isOverLimit && <Info className="h-4 w-4 text-orange-500" />}
      </div>
    );
  }

  return (
    <Card className={className}>
      <CardContent className="p-4">
        <div className="space-y-3">
          {/* Header */}
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium flex items-center gap-2">
              Token Usage
              {isOverLimit && <AlertTriangle className="h-4 w-4 text-destructive" />}
              {isWarning && !isOverLimit && <Info className="h-4 w-4 text-orange-500" />}
            </h4>
            <span className={`text-sm font-medium ${getStatusColor()}`}>
              {totalTokens.toLocaleString()} / {maxTokens.toLocaleString()}
            </span>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <Progress value={progressPercentage} className="h-2" />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>0</span>
              <span className={progressPercentage > 50 ? 'font-medium' : ''}>
                {progressPercentage.toFixed(1)}%
              </span>
              <span>{maxTokens.toLocaleString()}</span>
            </div>
          </div>

          {/* Token Breakdown */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="space-y-1">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Prompt:</span>
                <span className="font-medium">{promptTokens.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Context:</span>
                <span className="font-medium">{contextTokens.toLocaleString()}</span>
              </div>
            </div>
            <div className="space-y-1">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total:</span>
                <span className={`font-medium ${getStatusColor()}`}>
                  {totalTokens.toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* Status Messages */}
          {isOverLimit && (
            <div className="p-2 bg-destructive/10 border border-destructive/20 rounded text-xs text-destructive">
              ⚠️ Token limit exceeded. Consider reducing context to improve performance.
            </div>
          )}
          {isWarning && !isOverLimit && (
            <div className="p-2 bg-orange-100 border border-orange-200 dark:bg-orange-900/20 dark:border-orange-800/30 rounded text-xs text-orange-600 dark:text-orange-400">
              ⚡ Approaching token limit. Large prompts may have slower response times.
            </div>
          )}
          {!isWarning && !isOverLimit && totalTokens > 1000 && (
            <div className="p-2 bg-green-100 border border-green-200 dark:bg-green-900/20 dark:border-green-800/30 rounded text-xs text-green-600 dark:text-green-400">
              ✅ Token usage is within optimal range.
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};