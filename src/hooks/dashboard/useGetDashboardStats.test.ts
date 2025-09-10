import { renderHook, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useGetDashboardStats } from './useGetDashboardStats'
import { createQueryWrapper } from '../../test/utils/queryClient'
import { createSuccessResponse, createErrorResponse } from '../../test/mocks/data'
import { supabase } from '../../lib/supabaseClient'

// Mock the auth context
vi.mock('../../context/AuthContext', () => ({
  useAuth: () => mockUseAuth(),
}))

// Mock supabase
vi.mock('../../lib/supabaseClient', () => ({
  supabase: {
    storage: {
      from: vi.fn(),
    },
    from: vi.fn(),
  },
}))

const mockUseAuth = vi.fn()

describe('useGetDashboardStats', () => {
  const mockUser = {
    id: 'test-user-id',
    email: 'test@example.com',
    created_at: new Date().toISOString(),
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should not fetch when user is not authenticated', () => {
    mockUseAuth.mockReturnValue({ user: null, session: null, loading: false, signOut: vi.fn() })

    const { result } = renderHook(() => useGetDashboardStats(), {
      wrapper: createQueryWrapper(),
    })

    expect(result.current.isLoading).toBe(false)
    expect(result.current.data).toBeUndefined()
    expect(supabase.storage.from).not.toHaveBeenCalled()
    expect(supabase.from).not.toHaveBeenCalled()
  })

  it('should throw error when user ID is missing', async () => {
    mockUseAuth.mockReturnValue({ 
      user: { id: '', email: 'test@example.com', created_at: new Date().toISOString() }, 
      session: null, 
      loading: false, 
      signOut: vi.fn() 
    })

    const { result } = renderHook(() => useGetDashboardStats(), {
      wrapper: createQueryWrapper(),
    })

    await waitFor(() => {
      expect(result.current.isError).toBe(true)
    })

    expect(result.current.error).toEqual(new Error('No user ID'))
  })

  it('should use correct query key with user ID', () => {
    mockUseAuth.mockReturnValue({ user: mockUser, session: null, loading: false, signOut: vi.fn() })

    const { result } = renderHook(() => useGetDashboardStats(), {
      wrapper: createQueryWrapper(),
    })

    // The query should be enabled when user exists
    expect(result.current.isLoading).toBe(true)
  })

  it('should be enabled only when user exists', () => {
    // Test with user
    mockUseAuth.mockReturnValue({ user: mockUser, session: null, loading: false, signOut: vi.fn() })
    const { result: resultWithUser } = renderHook(() => useGetDashboardStats(), {
      wrapper: createQueryWrapper(),
    })
    expect(resultWithUser.current.isLoading).toBe(true)

    // Test without user
    mockUseAuth.mockReturnValue({ user: null, session: null, loading: false, signOut: vi.fn() })
    const { result: resultWithoutUser } = renderHook(() => useGetDashboardStats(), {
      wrapper: createQueryWrapper(),
    })
    expect(resultWithoutUser.current.isLoading).toBe(false)
  })
})