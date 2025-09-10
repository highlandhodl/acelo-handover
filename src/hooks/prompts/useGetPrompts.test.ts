import { renderHook, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useGetPrompts } from './useGetPrompts'
import { createQueryWrapper, createTestQueryClient } from '../../test/utils/queryClient'
import { mockPrompts } from '../../test/mocks/data'

// Mock the auth context
vi.mock('../../context/AuthContext.tsx', () => ({
  useAuth: vi.fn(),
}))

// Mock supabase
vi.mock('../../lib/supabaseClient', () => ({
  supabase: {
    from: vi.fn(),
  },
}))

const mockUseAuth = vi.mocked(await import('../../context/AuthContext.tsx')).useAuth
const { supabase } = vi.mocked(await import('../../lib/supabaseClient'))

describe('useGetPrompts', () => {
  const testUserId = 'test-user-id'
  let queryClient: ReturnType<typeof createTestQueryClient>
  
  beforeEach(() => {
    vi.clearAllMocks()
    queryClient = createTestQueryClient()
    
    mockUseAuth.mockReturnValue({
      user: { id: testUserId, email: 'test@example.com' },
      loading: false,
    })
  })

  it('should fetch prompts successfully for authenticated user', async () => {
    const mockPromptData = mockPrompts.createMany(3)
    
    supabase.from.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          order: vi.fn().mockResolvedValue({
            data: mockPromptData,
            error: null,
          }),
        }),
      }),
    })

    const { result } = renderHook(() => useGetPrompts(), {
      wrapper: createQueryWrapper(queryClient),
    })

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    expect(result.current.data).toEqual(mockPromptData)
    expect(supabase.from).toHaveBeenCalledWith('prompts')
  })

  it('should handle empty prompts list', async () => {
    supabase.from.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          order: vi.fn().mockResolvedValue({
            data: null,
            error: null,
          }),
        }),
      }),
    })

    const { result } = renderHook(() => useGetPrompts(), {
      wrapper: createQueryWrapper(queryClient),
    })

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    expect(result.current.data).toEqual([])
  })

  it('should handle database errors gracefully', async () => {
    const mockError = new Error('Database connection failed')
    
    supabase.from.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          order: vi.fn().mockResolvedValue({
            data: null,
            error: mockError,
          }),
        }),
      }),
    })

    const { result } = renderHook(() => useGetPrompts(), {
      wrapper: createQueryWrapper(queryClient),
    })

    await waitFor(() => {
      expect(result.current.isError).toBe(true)
    })

    expect(result.current.error).toEqual(mockError)
  })

  it('should not fetch prompts when user is not authenticated', async () => {
    mockUseAuth.mockReturnValue({
      user: null,
      loading: false,
    })

    const { result } = renderHook(() => useGetPrompts(), {
      wrapper: createQueryWrapper(queryClient),
    })

    expect(result.current.data).toBeUndefined()
    expect(result.current.isLoading).toBe(false)
    expect(supabase.from).not.toHaveBeenCalled()
  })
})