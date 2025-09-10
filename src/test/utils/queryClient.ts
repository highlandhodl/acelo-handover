import { createElement } from 'react'
import type React from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

// Create a new QueryClient instance for each test to ensure isolation
export const createTestQueryClient = () => {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: Infinity, // Prevent garbage collection during tests
        staleTime: Infinity, // Prevent automatic refetching
        refetchOnWindowFocus: false,
        refetchOnMount: false,
        refetchOnReconnect: false,
      },
      mutations: {
        retry: false,
      },
    },
    logger: {
      log: () => {}, // Suppress logs in tests
      warn: () => {},
      error: () => {},
    },
  })
}

// Wrapper component for testing hooks that use TanStack Query
export const createQueryWrapper = (queryClient?: QueryClient) => {
  const testQueryClient = queryClient || createTestQueryClient()
  
  return ({ children }: { children: React.ReactNode }) => 
    createElement(QueryClientProvider, { client: testQueryClient }, children)
}

// Hook for getting query client in tests
export const useTestQueryClient = () => {
  return createTestQueryClient()
}

// Utility function to wait for queries to settle
export const waitForQueries = (queryClient: QueryClient) => {
  return queryClient.getQueryCache().getAll().every(query => {
    const state = query.state
    return !state.isFetching && !state.isLoading
  })
}

// Clear all queries and mutations
export const clearAllQueries = (queryClient: QueryClient) => {
  queryClient.getQueryCache().clear()
  queryClient.getMutationCache().clear()
}

// Helper to manually trigger a query invalidation
export const invalidateQueries = (queryClient: QueryClient, queryKey: unknown[]) => {
  return queryClient.invalidateQueries({ queryKey })
}

// Helper to set query data manually for testing
export const setQueryData = <T>(queryClient: QueryClient, queryKey: unknown[], data: T) => {
  queryClient.setQueryData(queryKey, data)
}

// Helper to get query data for assertions
export const getQueryData = <T>(queryClient: QueryClient, queryKey: unknown[]): T | undefined => {
  return queryClient.getQueryData(queryKey)
}

// Helper to trigger a query manually
export const fetchQuery = <T>(queryClient: QueryClient, queryKey: unknown[], queryFn: () => Promise<T>) => {
  return queryClient.fetchQuery({ queryKey, queryFn })
}

// Common query client configurations for different test scenarios
export const queryClientConfigs = {
  // Default test configuration (already applied in createTestQueryClient)
  default: {
    retry: false,
    gcTime: Infinity,
    staleTime: Infinity,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
  },
  
  // Configuration for testing loading states
  loading: {
    retry: false,
    gcTime: 0,
    staleTime: 0,
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    refetchOnReconnect: false,
  },
  
  // Configuration for testing error scenarios
  error: {
    retry: 1, // Allow one retry for error testing
    gcTime: 0,
    staleTime: 0,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
  },
}