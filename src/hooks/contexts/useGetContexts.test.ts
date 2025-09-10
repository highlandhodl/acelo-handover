import { renderHook, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createElement } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useGetContexts } from './useGetContexts'
import { AuthContext } from '../../context/AuthContext'

// Mock supabase client
const mockData = [
  {
    id: 'test-context-1',
    user_id: 'test-user',
    title: 'Test Context',
    description: 'Test description',
    category: 'client_profiles',
    content: 'Test content',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  }
]

const mockQuery = {
  select: vi.fn(() => mockQuery),
  eq: vi.fn(() => mockQuery),
  order: vi.fn(() => mockQuery),
  or: vi.fn(() => ({ data: mockData, error: null })),
  then: vi.fn((callback) => callback({ data: mockData, error: null }))
}

// Set up the chain to return data properly
mockQuery.select.mockReturnValue(mockQuery)
mockQuery.eq.mockReturnValue(mockQuery)
mockQuery.order.mockReturnValue(mockQuery)

vi.mock('../../lib/supabaseClient', () => ({
  supabase: {
    from: vi.fn(() => mockQuery)
  }
}))

// Mock auth context value
const mockAuthValue = {
  user: { id: 'test-user', email: 'test@example.com' },
  session: null,
  loading: false,
  signOut: vi.fn()
}

// Create wrapper with React Query and Auth
const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false }
    }
  })
  
  return ({ children }: { children: React.ReactNode }) =>
    createElement(
      QueryClientProvider,
      { client: queryClient },
      createElement(AuthContext.Provider, { value: mockAuthValue }, children)
    )
}

describe('useGetContexts', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should fetch contexts for authenticated user', async () => {
    const { result } = renderHook(() => useGetContexts(), {
      wrapper: createWrapper()
    })

    expect(result.current.isLoading).toBe(true)

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.data).toBeDefined()
    expect(Array.isArray(result.current.data)).toBe(true)
  })

  it('should not fetch when user is not authenticated', () => {
    const mockAuthValueNoUser = {
      user: null,
      session: null,
      loading: false,
      signOut: vi.fn()
    }

    const createWrapperNoUser = () => {
      const queryClient = new QueryClient({
        defaultOptions: {
          queries: { retry: false },
          mutations: { retry: false }
        }
      })
      
      return ({ children }: { children: React.ReactNode }) =>
        createElement(
          QueryClientProvider,
          { client: queryClient },
          createElement(AuthContext.Provider, { value: mockAuthValueNoUser }, children)
        )
    }

    const { result } = renderHook(() => useGetContexts(), {
      wrapper: createWrapperNoUser()
    })

    expect(result.current.data).toBeUndefined()
    expect(result.current.isLoading).toBe(false)
  })

  it('should apply category filter when provided', async () => {
    const { result } = renderHook(() => useGetContexts({ category: 'client_profiles' }), {
      wrapper: createWrapper()
    })

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.data).toBeDefined()
  })

  it('should apply search filter when provided', async () => {
    const { result } = renderHook(() => useGetContexts({ searchTerm: 'test' }), {
      wrapper: createWrapper()
    })

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.data).toBeDefined()
  })
});