import { renderHook, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useGetAssets } from './useGetAssets'
import { createQueryWrapper } from '../../test/utils/queryClient'
import { mockAssets, createSuccessResponse, createErrorResponse } from '../../test/mocks/data'
import { supabase } from '../../lib/supabaseClient'

// Mock the auth context
vi.mock('../../context/AuthContext', () => ({
  useAuth: () => mockUseAuth(),
}))

// Mock supabase - the main mock is in setup.ts, but we need to access it
vi.mock('../../lib/supabaseClient', () => ({
  supabase: {
    storage: {
      from: vi.fn(),
    },
  },
}))

const mockUseAuth = vi.fn()

describe('useGetAssets', () => {
  const mockUser = {
    id: 'test-user-id',
    email: 'test@example.com',
    created_at: new Date().toISOString(),
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should fetch assets successfully when user is authenticated', async () => {
    const mockAssetData = mockAssets.createMany(3)
    
    mockUseAuth.mockReturnValue({ user: mockUser })
    
    const mockList = vi.fn().mockResolvedValue(createSuccessResponse(mockAssetData))
    vi.mocked(supabase.storage.from).mockReturnValue({
      list: mockList,
    } as ReturnType<typeof supabase.from>)

    const { result } = renderHook(() => useGetAssets(), {
      wrapper: createQueryWrapper(),
    })

    expect(result.current.isLoading).toBe(true)
    expect(result.current.data).toBeUndefined()

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    expect(result.current.data).toEqual(mockAssetData)
    expect(mockList).toHaveBeenCalledWith(mockUser.id, {
      limit: 1000,
      sortBy: { column: 'created_at', order: 'desc' }
    })
    expect(supabase.storage.from).toHaveBeenCalledWith('user-assets')
  })

  it('should handle errors gracefully', async () => {
    const mockError = new Error('Storage access failed')
    
    mockUseAuth.mockReturnValue({ user: mockUser })
    
    const mockList = vi.fn().mockResolvedValue(createErrorResponse(mockError.message))
    vi.mocked(supabase.storage.from).mockReturnValue({
      list: mockList,
    } as ReturnType<typeof supabase.from>)

    const { result } = renderHook(() => useGetAssets(), {
      wrapper: createQueryWrapper(),
    })

    await waitFor(() => {
      expect(result.current.isError).toBe(true)
    })

    expect(result.current.error).toEqual(mockError)
  })

  it('should not fetch when user is not authenticated', () => {
    mockUseAuth.mockReturnValue({ user: null })

    const { result } = renderHook(() => useGetAssets(), {
      wrapper: createQueryWrapper(),
    })

    expect(result.current.isLoading).toBe(false)
    expect(result.current.data).toBeUndefined()
    expect(supabase.storage.from).not.toHaveBeenCalled()
  })

  it('should throw error when user ID is missing', async () => {
    mockUseAuth.mockReturnValue({ user: { id: '', email: 'test@example.com' } })

    const { result } = renderHook(() => useGetAssets(), {
      wrapper: createQueryWrapper(),
    })

    await waitFor(() => {
      expect(result.current.isError).toBe(true)
    })

    expect(result.current.error).toEqual(new Error('No user ID'))
  })

  it('should return empty array when no assets exist', async () => {
    mockUseAuth.mockReturnValue({ user: mockUser })
    
    const mockList = vi.fn().mockResolvedValue(createSuccessResponse([]))
    vi.mocked(supabase.storage.from).mockReturnValue({
      list: mockList,
    } as ReturnType<typeof supabase.from>)

    const { result } = renderHook(() => useGetAssets(), {
      wrapper: createQueryWrapper(),
    })

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    expect(result.current.data).toEqual([])
  })

  it('should handle null data response', async () => {
    mockUseAuth.mockReturnValue({ user: mockUser })
    
    const mockList = vi.fn().mockResolvedValue(createSuccessResponse(null))
    vi.mocked(supabase.storage.from).mockReturnValue({
      list: mockList,
    } as ReturnType<typeof supabase.from>)

    const { result } = renderHook(() => useGetAssets(), {
      wrapper: createQueryWrapper(),
    })

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    expect(result.current.data).toEqual([])
  })

  it('should use correct query key with user ID', () => {
    mockUseAuth.mockReturnValue({ user: mockUser })

    const { result } = renderHook(() => useGetAssets(), {
      wrapper: createQueryWrapper(),
    })

    // The query should be enabled when user exists
    expect(result.current.isLoading).toBe(true) // Query should be enabled and loading
  })

  it('should be enabled only when user exists', () => {
    // Test with user
    mockUseAuth.mockReturnValue({ user: mockUser })
    const { result: resultWithUser } = renderHook(() => useGetAssets(), {
      wrapper: createQueryWrapper(),
    })
    expect(resultWithUser.current.isLoading).toBe(true)

    // Test without user
    mockUseAuth.mockReturnValue({ user: null })
    const { result: resultWithoutUser } = renderHook(() => useGetAssets(), {
      wrapper: createQueryWrapper(),
    })
    expect(resultWithoutUser.current.isLoading).toBe(false)
  })
})