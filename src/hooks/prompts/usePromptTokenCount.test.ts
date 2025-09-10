import { renderHook } from '@testing-library/react';
import { usePromptTokenCount } from './usePromptTokenCount';
import type { Context } from '../../types/context';

const mockContext: Context = {
  id: '1',
  user_id: 'user1',
  title: 'Test Context',
  description: 'Test description',
  category: 'client_profiles',
  content: 'This is a test context with some content that should be counted for tokens.',
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
};

describe('usePromptTokenCount', () => {
  it('should calculate token count for prompt only', () => {
    const { result } = renderHook(() =>
      usePromptTokenCount({
        promptContent: 'This is a test prompt.',
        selectedContexts: [],
        customContext: '',
      })
    );

    expect(result.current.tokenEstimate.promptTokens).toBeGreaterThan(0);
    expect(result.current.tokenEstimate.contextTokens).toBe(0);
    expect(result.current.tokenEstimate.totalTokens).toBe(result.current.tokenEstimate.promptTokens);
  });

  it('should calculate token count for prompt with selected contexts', () => {
    const { result } = renderHook(() =>
      usePromptTokenCount({
        promptContent: 'This is a test prompt.',
        selectedContexts: [mockContext],
        customContext: '',
      })
    );

    expect(result.current.tokenEstimate.promptTokens).toBeGreaterThan(0);
    expect(result.current.tokenEstimate.contextTokens).toBeGreaterThan(0);
    expect(result.current.tokenEstimate.totalTokens).toBe(
      result.current.tokenEstimate.promptTokens + result.current.tokenEstimate.contextTokens
    );
  });

  it('should calculate token count for prompt with custom context', () => {
    const { result } = renderHook(() =>
      usePromptTokenCount({
        promptContent: 'This is a test prompt.',
        selectedContexts: [],
        customContext: 'This is custom context content.',
      })
    );

    expect(result.current.tokenEstimate.promptTokens).toBeGreaterThan(0);
    expect(result.current.tokenEstimate.contextTokens).toBeGreaterThan(0);
    expect(result.current.tokenEstimate.totalTokens).toBe(
      result.current.tokenEstimate.promptTokens + result.current.tokenEstimate.contextTokens
    );
  });

  it('should calculate token count for prompt with both selected and custom contexts', () => {
    const { result } = renderHook(() =>
      usePromptTokenCount({
        promptContent: 'This is a test prompt.',
        selectedContexts: [mockContext],
        customContext: 'This is custom context content.',
      })
    );

    expect(result.current.tokenEstimate.promptTokens).toBeGreaterThan(0);
    expect(result.current.tokenEstimate.contextTokens).toBeGreaterThan(0);
    expect(result.current.tokenEstimate.totalTokens).toBe(
      result.current.tokenEstimate.promptTokens + result.current.tokenEstimate.contextTokens
    );
  });

  it('should calculate estimated cost', () => {
    const { result } = renderHook(() =>
      usePromptTokenCount({
        promptContent: 'This is a test prompt.',
        selectedContexts: [mockContext],
        customContext: '',
      })
    );

    expect(result.current.tokenEstimate.estimatedCost).toBeGreaterThan(0);
    expect(typeof result.current.tokenEstimate.estimatedCost).toBe('number');
  });

  it('should determine if within limits', () => {
    const { result } = renderHook(() =>
      usePromptTokenCount({
        promptContent: 'Short prompt.',
        selectedContexts: [],
        customContext: '',
      })
    );

    expect(result.current.isWithinLimits).toBe(true);
    expect(result.current.warningThreshold).toBe(false);
  });

  it('should handle empty inputs', () => {
    const { result } = renderHook(() =>
      usePromptTokenCount({
        promptContent: '',
        selectedContexts: [],
        customContext: '',
      })
    );

    expect(result.current.tokenEstimate.promptTokens).toBe(0);
    expect(result.current.tokenEstimate.contextTokens).toBe(0);
    expect(result.current.tokenEstimate.totalTokens).toBe(0);
    expect(result.current.tokenEstimate.estimatedCost).toBe(0);
  });

  it('should handle multiple contexts', () => {
    const mockContext2: Context = {
      ...mockContext,
      id: '2',
      content: 'Another context with different content for testing purposes.',
    };

    const { result } = renderHook(() =>
      usePromptTokenCount({
        promptContent: 'This is a test prompt.',
        selectedContexts: [mockContext, mockContext2],
        customContext: '',
      })
    );

    expect(result.current.tokenEstimate.contextTokens).toBeGreaterThan(0);
    expect(result.current.tokenEstimate.totalTokens).toBeGreaterThan(result.current.tokenEstimate.promptTokens);
  });

  it('should update when inputs change', () => {
    const { result, rerender } = renderHook(
      ({ promptContent, selectedContexts, customContext }) =>
        usePromptTokenCount({ promptContent, selectedContexts, customContext }),
      {
        initialProps: {
          promptContent: 'Short prompt.',
          selectedContexts: [] as Context[],
          customContext: '',
        },
      }
    );

    const initialTotal = result.current.tokenEstimate.totalTokens;

    rerender({
      promptContent: 'This is a much longer prompt with more content.',
      selectedContexts: [],
      customContext: '',
    });

    expect(result.current.tokenEstimate.totalTokens).toBeGreaterThan(initialTotal);
  });
});