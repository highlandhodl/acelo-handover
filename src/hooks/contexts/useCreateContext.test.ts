import { renderHook, act } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createElement } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useCreateContext } from './useCreateContext'
import { AuthContext } from '../../context/AuthContext'

// Mock supabase client
const mockInsert = vi.fn(() => ({
  select: vi.fn(() => ({
    single: vi.fn(() => ({
      data: {
        id: 'new-context-id',
        user_id: 'test-user',
        title: 'Test Context',
        description: 'Test description',
        category: 'client_profiles',
        content: 'Test content',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z'
      },
      error: null
    }))
  }))
}))

vi.mock('../../lib/supabaseClient', () => ({
  supabase: {
    from: vi.fn(() => ({
      insert: mockInsert
    }))
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

describe('useCreateContext', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should create a new context', async () => {
    const { result } = renderHook(() => useCreateContext(), {
      wrapper: createWrapper()
    })

    const contextData = {
      title: 'Test Context',
      description: 'Test description',
      category: 'client_profiles' as const,
      content: 'Test content'
    }

    await act(async () => {
      const result_promise = result.current.mutateAsync(contextData)
      await expect(result_promise).resolves.toBeDefined()
    })

    expect(mockInsert).toHaveBeenCalledWith({
      user_id: 'test-user',
      title: 'Test Context',
      description: 'Test description',
      category: 'client_profiles',
      content: 'Test content'
    })
  })

  it('should throw error when user is not authenticated', async () => {
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

    const { result } = renderHook(() => useCreateContext(), {
      wrapper: createWrapperNoUser()
    })

    const contextData = {
      title: 'Test Context',
      description: 'Test description',
      category: 'client_profiles' as const,
      content: 'Test content'
    }

    await act(async () => {
      await expect(result.current.mutateAsync(contextData)).rejects.toThrow('User must be authenticated')
    })
  })
});