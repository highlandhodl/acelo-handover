import { renderHook, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useCreateCoach } from './useCreateCoach'
import { createQueryWrapper, createTestQueryClient } from '../../test/utils/queryClient'
import { mockCoachFormData, mockCoaches } from '../../test/mocks/data'

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

const mockUseAuth = vi.mocked(await import('../../context/AuthContext.tsx')).useAuth
const { supabase } = vi.mocked(await import('../../lib/supabaseClient'))

describe('useCreateCoach', () => {
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

  it('should create a coach successfully', async () => {
    const formData = mockCoachFormData.create({
      name: 'New Test Coach',
      description: 'A coach for testing',
    })
    
    const createdCoach = mockCoaches.create({
      ...formData,
      user_id: testUserId,
      id: 'new-coach-id',
    })

    supabase.from.mockReturnValue({
      insert: vi.fn().mockReturnValue({
        select: vi.fn().mockResolvedValue({
          data: [createdCoach],
          error: null,
        }),
      }),
    })

    const wrapper = createQueryWrapper(queryClient)
    const { result } = renderHook(() => useCreateCoach(), { wrapper })

    result.current.mutate(formData)

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    expect(result.current.data).toEqual(createdCoach)
    expect(supabase.from).toHaveBeenCalledWith('coaches')
    expect(supabase.from().insert).toHaveBeenCalledWith({
      ...formData,
      user_id: testUserId,
    })
  })

  it('should handle creation errors', async () => {
    const formData = mockCoachFormData.create()
    const mockError = new Error('Creation failed')

    supabase.from.mockReturnValue({
      insert: vi.fn().mockReturnValue({
        select: vi.fn().mockResolvedValue({
          data: null,
          error: mockError,
        }),
      }),
    })

    const wrapper = createQueryWrapper(queryClient)
    const { result } = renderHook(() => useCreateCoach(), { wrapper })

    result.current.mutate(formData)

    await waitFor(() => {
      expect(result.current.isError).toBe(true)
    })

    expect(result.current.error).toEqual(mockError)
  })

  it('should invalidate coaches queries on successful creation', async () => {
    const formData = mockCoachFormData.create()
    const createdCoach = mockCoaches.create()

    supabase.from.mockReturnValue({
      insert: vi.fn().mockReturnValue({
        select: vi.fn().mockResolvedValue({
          data: [createdCoach],
          error: null,
        }),
      }),
    })

    const wrapper = createQueryWrapper(queryClient)
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries')

    const { result } = renderHook(() => useCreateCoach(), { wrapper })

    result.current.mutate(formData)

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['coaches'] })
  })

  it('should include user_id in the inserted data', async () => {
    const formData = mockCoachFormData.create({
      name: 'Test Coach',
      description: 'Test description',
    })

    const mockInsert = vi.fn().mockReturnValue({
      select: vi.fn().mockResolvedValue({
        data: [mockCoaches.create()],
        error: null,
      }),
    })

    supabase.from.mockReturnValue({
      insert: mockInsert,
    })

    const wrapper = createQueryWrapper(queryClient)
    const { result } = renderHook(() => useCreateCoach(), { wrapper })

    result.current.mutate(formData)

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    expect(mockInsert).toHaveBeenCalledWith({
      ...formData,
      user_id: testUserId,
    })
  })

  it('should handle missing user gracefully', async () => {
    mockUseAuth.mockReturnValue({
      user: null,
      loading: false,
    })

    const formData = mockCoachFormData.create()
    
    supabase.from.mockReturnValue({
      insert: vi.fn().mockReturnValue({
        select: vi.fn().mockResolvedValue({
          data: [mockCoaches.create()],
          error: null,
        }),
      }),
    })

    const wrapper = createQueryWrapper(queryClient)
    const { result } = renderHook(() => useCreateCoach(), { wrapper })

    result.current.mutate(formData)

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    // Should still work with undefined user_id
    expect(supabase.from().insert).toHaveBeenCalledWith({
      ...formData,
      user_id: undefined,
    })
  })

  it('should show loading state during mutation', async () => {
    const formData = mockCoachFormData.create()
    
    // Create a promise that we can control
    let resolvePromise: (value: unknown) => void
    const controlledPromise = new Promise((resolve) => {
      resolvePromise = resolve
    })

    supabase.from.mockReturnValue({
      insert: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue(controlledPromise),
      }),
    })

    const wrapper = createQueryWrapper(queryClient)
    const { result } = renderHook(() => useCreateCoach(), { wrapper })

    result.current.mutate(formData)

    expect(['idle', 'pending']).toContain(result.current.status)
    expect(result.current.data).toBeUndefined()

    // Resolve the promise
    resolvePromise!({
      data: [mockCoaches.create()],
      error: null,
    })

    await waitFor(() => {
      expect(result.current.status).toBe('success')
      expect(result.current.isSuccess).toBe(true)
    })
  })

  it('should handle validation errors from database', async () => {
    const formData = mockCoachFormData.create()
    const validationError = new Error('Name is required')

    supabase.from.mockReturnValue({
      insert: vi.fn().mockReturnValue({
        select: vi.fn().mockResolvedValue({
          data: null,
          error: validationError,
        }),
      }),
    })

    const wrapper = createQueryWrapper(queryClient)
    const { result } = renderHook(() => useCreateCoach(), { wrapper })

    result.current.mutate(formData)

    await waitFor(() => {
      expect(result.current.isError).toBe(true)
    })

    expect(result.current.error).toEqual(validationError)
    expect(result.current.data).toBeUndefined()
  })
})