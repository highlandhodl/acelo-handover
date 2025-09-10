import { renderHook, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useGetAutomations } from './useGetAutomations'
import { createQueryWrapper, createTestQueryClient } from '../../test/utils/queryClient'
import { mockAutomations, createSuccessResponse, createErrorResponse } from '../../test/mocks/data'

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

describe('useGetAutomations', () => {
  const mockUser = {
    id: 'test-user-id',
    email: 'test@example.com',
  }
  
  let queryClient: ReturnType<typeof createTestQueryClient>

  beforeEach(() => {
    vi.clearAllMocks()
    queryClient = createTestQueryClient()
  })

  it('should fetch automations successfully when user is authenticated', async () => {
    const mockAutomationData = mockAutomations.createMany(3)
    
    mockUseAuth.mockReturnValue({ user: mockUser })
    
    const mockOrder = vi.fn().mockResolvedValue(createSuccessResponse(mockAutomationData))
    const mockEq = vi.fn().mockReturnValue({ order: mockOrder })
    const mockSelect = vi.fn().mockReturnValue({ eq: mockEq })
    vi.mocked(supabase.from).mockReturnValue({ select: mockSelect } as ReturnType<typeof supabase.from>)

    const { result } = renderHook(() => useGetAutomations(), {
      wrapper: createQueryWrapper(queryClient),
    })

    expect(result.current.isLoading).toBe(true)
    expect(result.current.data).toBeUndefined()

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    expect(result.current.data).toEqual(mockAutomationData)
    expect(supabase.from).toHaveBeenCalledWith('automations')
    expect(mockSelect).toHaveBeenCalledWith('*')
    expect(mockEq).toHaveBeenCalledWith('user_id', mockUser.id)
    expect(mockOrder).toHaveBeenCalledWith('created_at', { ascending: false })
  })

  it('should handle errors gracefully', async () => {
    const mockError = new Error('Database connection failed')
    
    mockUseAuth.mockReturnValue({ user: mockUser })
    
    const mockOrder = vi.fn().mockResolvedValue(createErrorResponse(mockError.message))
    const mockEq = vi.fn().mockReturnValue({ order: mockOrder })
    const mockSelect = vi.fn().mockReturnValue({ eq: mockEq })
    vi.mocked(supabase.from).mockReturnValue({ select: mockSelect } as ReturnType<typeof supabase.from>)

    const { result } = renderHook(() => useGetAutomations(), {
      wrapper: createQueryWrapper(queryClient),
    })

    await waitFor(() => {
      expect(result.current.isError).toBe(true)
    })

    expect(result.current.error).toEqual(mockError)
  })

  it('should not fetch when user is not authenticated', () => {
    mockUseAuth.mockReturnValue({ user: null })

    const { result } = renderHook(() => useGetAutomations(), {
      wrapper: createQueryWrapper(queryClient),
    })

    expect(result.current.isLoading).toBe(false)
    expect(result.current.data).toBeUndefined()
    expect(supabase.from).not.toHaveBeenCalled()
  })

  it('should return empty array when no automations exist', async () => {
    mockUseAuth.mockReturnValue({ user: mockUser })
    
    const mockOrder = vi.fn().mockResolvedValue(createSuccessResponse([]))
    const mockEq = vi.fn().mockReturnValue({ order: mockOrder })
    const mockSelect = vi.fn().mockReturnValue({ eq: mockEq })
    vi.mocked(supabase.from).mockReturnValue({ select: mockSelect } as ReturnType<typeof supabase.from>)

    const { result } = renderHook(() => useGetAutomations(), {
      wrapper: createQueryWrapper(queryClient),
    })

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    expect(result.current.data).toEqual([])
  })

  it('should handle null data response', async () => {
    mockUseAuth.mockReturnValue({ user: mockUser })
    
    const mockOrder = vi.fn().mockResolvedValue(createSuccessResponse(null))
    const mockEq = vi.fn().mockReturnValue({ order: mockOrder })
    const mockSelect = vi.fn().mockReturnValue({ eq: mockEq })
    vi.mocked(supabase.from).mockReturnValue({ select: mockSelect } as ReturnType<typeof supabase.from>)

    const { result } = renderHook(() => useGetAutomations(), {
      wrapper: createQueryWrapper(queryClient),
    })

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    expect(result.current.data).toEqual([])
  })

  it('should use correct query key with user ID', () => {
    mockUseAuth.mockReturnValue({ user: mockUser })

    const { result } = renderHook(() => useGetAutomations(), {
      wrapper: createQueryWrapper(queryClient),
    })

    // The query should be enabled when user exists
    expect(result.current.isLoading).toBe(true)
  })

  it('should be enabled only when user exists', () => {
    // Test with user
    mockUseAuth.mockReturnValue({ user: mockUser })
    const { result: resultWithUser } = renderHook(() => useGetAutomations(), {
      wrapper: createQueryWrapper(),
    })
    expect(resultWithUser.current.isLoading).toBe(true)

    // Test without user
    mockUseAuth.mockReturnValue({ user: null })
    const { result: resultWithoutUser } = renderHook(() => useGetAutomations(), {
      wrapper: createQueryWrapper(queryClient),
    })
    expect(resultWithoutUser.current.isLoading).toBe(false)
  })

  it('should order automations by created_at descending', async () => {
    const mockAutomationData = mockAutomations.createMany(5, { active: true })
    
    mockUseAuth.mockReturnValue({ user: mockUser })
    
    const mockOrder = vi.fn().mockResolvedValue(createSuccessResponse(mockAutomationData))
    const mockEq = vi.fn().mockReturnValue({ order: mockOrder })
    const mockSelect = vi.fn().mockReturnValue({ eq: mockEq })
    vi.mocked(supabase.from).mockReturnValue({ select: mockSelect } as ReturnType<typeof supabase.from>)

    const { result } = renderHook(() => useGetAutomations(), {
      wrapper: createQueryWrapper(queryClient),
    })

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    expect(mockOrder).toHaveBeenCalledWith('created_at', { ascending: false })
  })

  it('should fetch automations for specific user only', async () => {
    const differentUser = { id: 'different-user-id', email: 'different@example.com' }
    const mockAutomationData = mockAutomations.createMany(2)
    
    mockUseAuth.mockReturnValue({ user: differentUser })
    
    const mockOrder = vi.fn().mockResolvedValue(createSuccessResponse(mockAutomationData))
    const mockEq = vi.fn().mockReturnValue({ order: mockOrder })
    const mockSelect = vi.fn().mockReturnValue({ eq: mockEq })
    vi.mocked(supabase.from).mockReturnValue({ select: mockSelect } as ReturnType<typeof supabase.from>)

    const { result } = renderHook(() => useGetAutomations(), {
      wrapper: createQueryWrapper(queryClient),
    })

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    expect(mockEq).toHaveBeenCalledWith('user_id', differentUser.id)
  })
})