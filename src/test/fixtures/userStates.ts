import type { TestScenario } from '../types/testing'
import { mockUsers } from '../mocks/data'
import { supabase } from '../../lib/supabaseClient'

// Common user state scenarios for testing
export const userStateScenarios: Record<string, TestScenario> = {
  signedOut: {
    name: 'Signed Out User',
    description: 'User is not authenticated',
    setup: () => {
      // Mock no session/user in auth state
      supabase.auth.getSession.mockResolvedValue({
        data: { session: null },
        error: null,
      })
      supabase.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: null,
      })
    },
  },

  signedInUser: {
    name: 'Signed In Regular User',
    description: 'User is authenticated with regular permissions',
    setup: () => {
      const testUser = mockUsers.create({
        id: 'signed-in-user-id',
        email: 'user@test.com',
        role: 'user',
      })
      
      supabase.auth.getSession.mockResolvedValue({
        data: {
          session: {
            access_token: 'mock-access-token',
            refresh_token: 'mock-refresh-token',
            expires_at: Date.now() + 3600000,
            token_type: 'bearer',
            user: testUser,
          },
        },
        error: null,
      })
      supabase.auth.getUser.mockResolvedValue({
        data: { user: testUser },
        error: null,
      })
    },
  },

  signedInAdmin: {
    name: 'Signed In Admin User',
    description: 'User is authenticated with admin permissions',
    setup: () => {
      const adminUser = mockUsers.create({
        id: 'admin-user-id',
        email: 'admin@test.com',
        role: 'admin',
      })
      
      supabase.auth.getSession.mockResolvedValue({
        data: {
          session: {
            access_token: 'mock-admin-access-token',
            refresh_token: 'mock-admin-refresh-token',
            expires_at: Date.now() + 3600000,
            token_type: 'bearer',
            user: adminUser,
          },
        },
        error: null,
      })
      supabase.auth.getUser.mockResolvedValue({
        data: { user: adminUser },
        error: null,
      })
    },
  },

  expiredSession: {
    name: 'Expired Session',
    description: 'User session has expired',
    setup: () => {
      supabase.auth.getSession.mockResolvedValue({
        data: { session: null },
        error: { message: 'Session expired' },
      })
      supabase.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: { message: 'Session expired' },
      })
    },
  },

  networkError: {
    name: 'Network Error',
    description: 'Network connection issues during auth',
    setup: () => {
      const networkError = new Error('Network request failed')
      
      supabase.auth.getSession.mockRejectedValue(networkError)
      supabase.auth.getUser.mockRejectedValue(networkError)
    },
  },

  rateLimited: {
    name: 'Rate Limited',
    description: 'Too many authentication requests',
    setup: () => {
      const rateLimitError = new Error('Too many requests')
      
      supabase.auth.signInWithPassword.mockResolvedValue({
        data: { user: null, session: null },
        error: rateLimitError,
      })
      supabase.auth.signUp.mockResolvedValue({
        data: { user: null, session: null },
        error: rateLimitError,
      })
    },
  },
}

// Helper to setup specific user state for tests
export const setupUserState = async (stateName: keyof typeof userStateScenarios) => {
  const scenario = userStateScenarios[stateName]
  if (!scenario) {
    throw new Error(`Unknown user state: ${stateName}`)
  }
  
  await scenario.setup()
  return scenario
}

// Helper to reset user state after tests
export const resetUserState = () => {
  
  // Reset all auth mocks to default state
  supabase.auth.getSession.mockResolvedValue({
    data: { session: null },
    error: null,
  })
  supabase.auth.getUser.mockResolvedValue({
    data: { user: null },
    error: null,
  })
  supabase.auth.signInWithPassword.mockResolvedValue({
    data: { user: null, session: null },
    error: null,
  })
  supabase.auth.signUp.mockResolvedValue({
    data: { user: null, session: null },
    error: null,
  })
  supabase.auth.signOut.mockResolvedValue({
    error: null,
  })
}