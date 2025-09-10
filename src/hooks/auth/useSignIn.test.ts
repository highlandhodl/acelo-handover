import { renderHook, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useSignIn } from './useSignIn'
import { createQueryWrapper, createTestQueryClient } from '../../test/utils/queryClient'

vi.mock('../../lib/supabaseClient', () => ({
  supabase: {
    auth: {
      signInWithPassword: vi.fn(),
    },
  },
}))

const { supabase } = vi.mocked(await import('../../lib/supabaseClient'))

describe('useSignIn', () => {
  let queryClient: ReturnType<typeof createTestQueryClient>
  
  beforeEach(() => {
    vi.clearAllMocks()
    queryClient = createTestQueryClient()
  })

  it('should sign in user successfully', async () => {
    const signInData = { email: 'test@example.com', password: 'password123' }
    const mockAuthResponse = {
      user: { id: 'user-id', email: 'test@example.com' },
      session: { access_token: 'token', refresh_token: 'refresh' },
    }

    supabase.auth.signInWithPassword.mockResolvedValue({
      data: mockAuthResponse,
      error: null,
    })

    const wrapper = createQueryWrapper(queryClient)
    const { result } = renderHook(() => useSignIn(), { wrapper })

    result.current.mutate(signInData)

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    expect(result.current.data).toEqual(mockAuthResponse)
    expect(supabase.auth.signInWithPassword).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'password123',
    })
  })

  it('should handle authentication errors', async () => {
    const signInData = { email: 'test@example.com', password: 'wrongpassword' }
    const mockError = new Error('Invalid credentials')

    supabase.auth.signInWithPassword.mockResolvedValue({
      data: { user: null, session: null },
      error: mockError,
    })

    const wrapper = createQueryWrapper(queryClient)
    const { result } = renderHook(() => useSignIn(), { wrapper })

    result.current.mutate(signInData)

    await waitFor(() => {
      expect(result.current.isError).toBe(true)
    })

    expect(result.current.error).toEqual(mockError)
  })

  it('should show loading state during sign in', async () => {
    const signInData = { email: 'test@example.com', password: 'password123' }
    
    let resolvePromise: (value: unknown) => void
    const controlledPromise = new Promise((resolve) => {
      resolvePromise = resolve
    })

    supabase.auth.signInWithPassword.mockReturnValue(controlledPromise)

    const wrapper = createQueryWrapper(queryClient)
    const { result } = renderHook(() => useSignIn(), { wrapper })

    result.current.mutate(signInData)

    // Check that mutation is in progress
    expect(['idle', 'pending']).toContain(result.current.status)
    expect(result.current.data).toBeUndefined()

    resolvePromise!({
      data: { user: { id: 'user-id' }, session: { access_token: 'token' } },
      error: null,
    })

    await waitFor(() => {
      expect(result.current.status).toBe('success')
      expect(result.current.isSuccess).toBe(true)
    })
  })

  it('should handle network errors', async () => {
    const signInData = { email: 'test@example.com', password: 'password123' }
    const networkError = new Error('Network request failed')

    supabase.auth.signInWithPassword.mockRejectedValue(networkError)

    const wrapper = createQueryWrapper(queryClient)
    const { result } = renderHook(() => useSignIn(), { wrapper })

    result.current.mutate(signInData)

    await waitFor(() => {
      expect(result.current.isError).toBe(true)
    })

    expect(result.current.error).toEqual(networkError)
  })

  it('should handle empty email and password', async () => {
    const signInData = { email: '', password: '' }
    const validationError = new Error('Email is required')

    supabase.auth.signInWithPassword.mockResolvedValue({
      data: { user: null, session: null },
      error: validationError,
    })

    const wrapper = createQueryWrapper(queryClient)
    const { result } = renderHook(() => useSignIn(), { wrapper })

    result.current.mutate(signInData)

    await waitFor(() => {
      expect(result.current.isError).toBe(true)
    })

    expect(result.current.error).toEqual(validationError)
  })

  it('should handle rate limiting', async () => {
    const signInData = { email: 'test@example.com', password: 'password123' }
    const rateLimitError = new Error('Too many requests')

    supabase.auth.signInWithPassword.mockResolvedValue({
      data: { user: null, session: null },
      error: rateLimitError,
    })

    const wrapper = createQueryWrapper(queryClient)
    const { result } = renderHook(() => useSignIn(), { wrapper })

    result.current.mutate(signInData)

    await waitFor(() => {
      expect(result.current.isError).toBe(true)
    })

    expect(result.current.error).toEqual(rateLimitError)
  })
})