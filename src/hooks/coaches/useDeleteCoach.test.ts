import { renderHook, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useDeleteCoach } from './useDeleteCoach'
import { createQueryWrapper, createTestQueryClient } from '../../test/utils/queryClient'

// Mock the supabase client
vi.mock('../../lib/supabaseClient', () => ({
  supabase: {
    from: vi.fn(),
  },
}))

const { supabase } = vi.mocked(await import('../../lib/supabaseClient'))

describe('useDeleteCoach', () => {
  let queryClient: ReturnType<typeof createTestQueryClient>
  
  beforeEach(() => {
    vi.clearAllMocks()
    queryClient = createTestQueryClient()
  })

  it('should delete a coach successfully', async () => {
    const coachId = 'coach-to-delete'

    supabase.from.mockReturnValue({
      delete: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({
          data: null,
          error: null,
        }),
      }),
    })

    const wrapper = createQueryWrapper(queryClient)
    const { result } = renderHook(() => useDeleteCoach(), { wrapper })

    result.current.mutate(coachId)

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    expect(result.current.data).toEqual({ success: true })
    expect(supabase.from).toHaveBeenCalledWith('coaches')
    expect(supabase.from().delete().eq).toHaveBeenCalledWith('id', coachId)
  })

  it('should handle deletion errors', async () => {
    const coachId = 'non-existent-coach'
    const mockError = new Error('Coach not found')

    supabase.from.mockReturnValue({
      delete: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({
          data: null,
          error: mockError,
        }),
      }),
    })

    const wrapper = createQueryWrapper(queryClient)
    const { result } = renderHook(() => useDeleteCoach(), { wrapper })

    result.current.mutate(coachId)

    await waitFor(() => {
      expect(result.current.isError).toBe(true)
    })

    expect(result.current.error).toEqual(mockError)
  })

  it('should invalidate coaches queries on successful deletion', async () => {
    const coachId = 'coach-to-delete'

    supabase.from.mockReturnValue({
      delete: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({
          data: null,
          error: null,
        }),
      }),
    })

    const wrapper = createQueryWrapper(queryClient)
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries')

    const { result } = renderHook(() => useDeleteCoach(), { wrapper })

    result.current.mutate(coachId)

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['coaches'] })
  })

  it('should show loading state during deletion', async () => {
    const coachId = 'coach-to-delete'
    
    let resolvePromise: (value: unknown) => void
    const controlledPromise = new Promise((resolve) => {
      resolvePromise = resolve
    })

    supabase.from.mockReturnValue({
      delete: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue(controlledPromise),
      }),
    })

    const wrapper = createQueryWrapper(queryClient)
    const { result } = renderHook(() => useDeleteCoach(), { wrapper })

    result.current.mutate(coachId)

    expect(['idle', 'pending']).toContain(result.current.status)
    expect(result.current.data).toBeUndefined()

    resolvePromise!({
      data: null,
      error: null,
    })

    await waitFor(() => {
      expect(result.current.status).toBe('success')
      expect(result.current.isSuccess).toBe(true)
    })
  })

  it('should handle permission errors', async () => {
    const coachId = 'restricted-coach'
    const permissionError = new Error('Permission denied')

    supabase.from.mockReturnValue({
      delete: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({
          data: null,
          error: permissionError,
        }),
      }),
    })

    const wrapper = createQueryWrapper(queryClient)
    const { result } = renderHook(() => useDeleteCoach(), { wrapper })

    result.current.mutate(coachId)

    await waitFor(() => {
      expect(result.current.isError).toBe(true)
    })

    expect(result.current.error).toEqual(permissionError)
  })

  it('should not invalidate queries on failed deletion', async () => {
    const coachId = 'coach-to-delete'
    const mockError = new Error('Deletion failed')

    supabase.from.mockReturnValue({
      delete: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({
          data: null,
          error: mockError,
        }),
      }),
    })

    const wrapper = createQueryWrapper(queryClient)
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries')

    const { result } = renderHook(() => useDeleteCoach(), { wrapper })

    result.current.mutate(coachId)

    await waitFor(() => {
      expect(result.current.isError).toBe(true)
    })

    expect(invalidateSpy).not.toHaveBeenCalled()
  })
})