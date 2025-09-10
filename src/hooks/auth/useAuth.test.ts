import { renderHook } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { createElement } from 'react'
import { useAuth } from './useAuth'
import { AuthContext } from '../../context/AuthContext'

// Mock auth context value
const mockAuthValue = {
  user: { id: 'test-user', email: 'test@example.com' },
  session: null,
  loading: false,
  signOut: vi.fn()
}

// Create wrapper with mocked AuthContext
const createAuthWrapper = (authValue = mockAuthValue) => {
  return ({ children }: { children: React.ReactNode }) =>
    createElement(AuthContext.Provider, { value: authValue }, children)
}

describe('useAuth', () => {
  it('should return auth context', () => {
    const { result } = renderHook(() => useAuth(), {
      wrapper: createAuthWrapper()
    })
    
    expect(result.current).toBeDefined()
    expect(result.current.user).toEqual(mockAuthValue.user)
    expect(result.current.loading).toBe(false)
    expect(typeof result.current.signOut).toBe('function')
  })

  it('should throw error when used outside AuthProvider', () => {
    expect(() => {
      renderHook(() => useAuth())
    }).toThrow('useAuth must be used within an AuthProvider')
  })
})