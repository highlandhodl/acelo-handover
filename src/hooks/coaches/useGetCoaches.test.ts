import { renderHook, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useGetCoaches } from './useGetCoaches'
import { createQueryWrapper, createTestQueryClient } from '../../test/utils/queryClient'
import { mockCoaches } from '../../test/mocks/data'

// Mock the auth context
vi.mock('../../context/AuthContext.tsx', () => ({
  useAuth: vi.fn(),
}))

// Mock the supabase client
vi.mock('../../lib/supabaseClient', () => ({
  supabase: {
    from: vi.fn(),
  },
}))

const { supabase } = vi.mocked(await import('../../lib/supabaseClient'))
const { useAuth } = vi.mocked(await import('../../context/AuthContext.tsx'))
const mockUseAuth = useAuth

describe('useGetCoaches', () => {
  const testUserId = 'test-user-id'
  let queryClient: ReturnType<typeof createTestQueryClient>
  
  beforeEach(() => {
    vi.clearAllMocks()
    queryClient = createTestQueryClient()
    
    // Setup default authenticated user
    mockUseAuth.mockReturnValue({
      user: { id: testUserId, email: 'test@example.com' },
      loading: false,
    })
  })

  it('should fetch coaches successfully for authenticated user', async () => {
    const mockCoachData = mockCoaches.createMany(3, { user_id: testUserId })
    
    supabase.from.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          order: vi.fn().mockResolvedValue({
            data: mockCoachData,
            error: null,
          }),
        }),
      }),
    })

    const { result } = renderHook(() => useGetCoaches(), {
      wrapper: createQueryWrapper(queryClient),
    })

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    expect(result.current.data).toEqual(mockCoachData)
    expect(supabase.from).toHaveBeenCalledWith('coaches')
  })

  it('should handle empty coaches list', async () => {
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

    const { result } = renderHook(() => useGetCoaches(), {
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

    const { result } = renderHook(() => useGetCoaches(), {
      wrapper: createQueryWrapper(queryClient),
    })

    await waitFor(() => {
      expect(result.current.isError).toBe(true)
    })

    expect(result.current.error).toEqual(mockError)
  })

  it('should not fetch coaches when user is not authenticated', async () => {
    mockUseAuth.mockReturnValue({
      user: null,
      loading: false,
    })

    const { result } = renderHook(() => useGetCoaches(), {
      wrapper: createQueryWrapper(queryClient),
    })

    expect(result.current.data).toBeUndefined()
    expect(result.current.isLoading).toBe(false)
    expect(supabase.from).not.toHaveBeenCalled()
  })

  it('should show loading state initially', () => {
    supabase.from.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          order: vi.fn().mockImplementation(() => new Promise(() => {})), // Never resolves
        }),
      }),
    })

    const { result } = renderHook(() => useGetCoaches(), {
      wrapper: createQueryWrapper(queryClient),
    })

    expect(result.current.isLoading).toBe(true)
    expect(result.current.data).toBeUndefined()
  })

  it('should filter coaches by user_id', async () => {
    const mockCoachData = mockCoaches.createMany(2, { user_id: testUserId })
    
    const mockSelect = vi.fn().mockReturnValue({
      eq: vi.fn().mockReturnValue({
        order: vi.fn().mockResolvedValue({
          data: mockCoachData,
          error: null,
        }),
      }),
    })
    
    supabase.from.mockReturnValue({
      select: mockSelect,
    })

    const { result } = renderHook(() => useGetCoaches(), {
      wrapper: createQueryWrapper(queryClient),
    })

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    expect(mockSelect).toHaveBeenCalledWith('*')
    expect(mockSelect().eq).toHaveBeenCalledWith('user_id', testUserId)
    expect(mockSelect().eq().order).toHaveBeenCalledWith('created_at', { ascending: false })
  })

  it('should refetch when user changes', async () => {
    const initialUser = { id: 'user-1', email: 'user1@test.com' }
    const newUser = { id: 'user-2', email: 'user2@test.com' }
    
    mockUseAuth.mockReturnValue({
      user: initialUser,
      loading: false,
    })

    const { result, rerender } = renderHook(() => useGetCoaches(), {
      wrapper: createQueryWrapper(),
    })

    // Change user
    mockUseAuth.mockReturnValue({
      user: newUser,
      loading: false,
    })

    rerender()

    // Should trigger a refetch with new user ID
    await waitFor(() => {
      expect(supabase.from).toHaveBeenCalled()
    })
  })
})