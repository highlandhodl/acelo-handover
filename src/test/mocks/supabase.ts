import { vi } from 'vitest'
import type { MockSupabaseResponse } from '../types/testing'

// Enhanced Supabase client mock with comprehensive method coverage
export const createMockSupabaseClient = () => {
  const mockFrom = vi.fn().mockReturnValue({
    select: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
    upsert: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    neq: vi.fn().mockReturnThis(),
    gt: vi.fn().mockReturnThis(),
    gte: vi.fn().mockReturnThis(),
    lt: vi.fn().mockReturnThis(),
    lte: vi.fn().mockReturnThis(),
    like: vi.fn().mockReturnThis(),
    ilike: vi.fn().mockReturnThis(),
    is: vi.fn().mockReturnThis(),
    in: vi.fn().mockReturnThis(),
    contains: vi.fn().mockReturnThis(),
    containedBy: vi.fn().mockReturnThis(),
    rangeGt: vi.fn().mockReturnThis(),
    rangeGte: vi.fn().mockReturnThis(),
    rangeLt: vi.fn().mockReturnThis(),
    rangeLte: vi.fn().mockReturnThis(),
    rangeAdjacent: vi.fn().mockReturnThis(),
    overlaps: vi.fn().mockReturnThis(),
    textSearch: vi.fn().mockReturnThis(),
    match: vi.fn().mockReturnThis(),
    not: vi.fn().mockReturnThis(),
    or: vi.fn().mockReturnThis(),
    filter: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
    range: vi.fn().mockReturnThis(),
    single: vi.fn().mockReturnThis(),
    maybeSingle: vi.fn().mockReturnThis(),
    csv: vi.fn().mockReturnThis(),
    explain: vi.fn().mockReturnThis(),
  })

  const mockAuth = {
    getSession: vi.fn().mockResolvedValue({
      data: { session: null },
      error: null,
    }),
    getUser: vi.fn().mockResolvedValue({
      data: { user: null },
      error: null,
    }),
    onAuthStateChange: vi.fn().mockReturnValue({
      data: {
        subscription: {
          unsubscribe: vi.fn(),
        },
      },
    }),
    signUp: vi.fn().mockResolvedValue({
      data: { user: null, session: null },
      error: null,
    }),
    signInWithPassword: vi.fn().mockResolvedValue({
      data: { user: null, session: null },
      error: null,
    }),
    signInWithOAuth: vi.fn().mockResolvedValue({
      data: { provider: 'github', url: 'https://example.com' },
      error: null,
    }),
    signOut: vi.fn().mockResolvedValue({
      error: null,
    }),
    resetPasswordForEmail: vi.fn().mockResolvedValue({
      data: {},
      error: null,
    }),
    updateUser: vi.fn().mockResolvedValue({
      data: { user: null },
      error: null,
    }),
    setSession: vi.fn().mockResolvedValue({
      data: { session: null, user: null },
      error: null,
    }),
    refreshSession: vi.fn().mockResolvedValue({
      data: { session: null, user: null },
      error: null,
    }),
  }

  const mockStorage = {
    from: vi.fn().mockReturnValue({
      upload: vi.fn().mockResolvedValue({
        data: { path: 'test/path/file.png' },
        error: null,
      }),
      download: vi.fn().mockResolvedValue({
        data: new Blob(['test content']),
        error: null,
      }),
      remove: vi.fn().mockResolvedValue({
        data: [{ name: 'file.png' }],
        error: null,
      }),
      list: vi.fn().mockResolvedValue({
        data: [{ name: 'file1.png' }, { name: 'file2.pdf' }],
        error: null,
      }),
      createSignedUrl: vi.fn().mockResolvedValue({
        data: { signedUrl: 'https://example.com/signed-url' },
        error: null,
      }),
      createSignedUrls: vi.fn().mockResolvedValue({
        data: [
          { path: 'file1.png', signedUrl: 'https://example.com/signed-url-1' },
          { path: 'file2.pdf', signedUrl: 'https://example.com/signed-url-2' },
        ],
        error: null,
      }),
      getPublicUrl: vi.fn().mockReturnValue({
        data: { publicUrl: 'https://example.com/public-url' },
      }),
      move: vi.fn().mockResolvedValue({
        data: { message: 'Successfully moved' },
        error: null,
      }),
      copy: vi.fn().mockResolvedValue({
        data: { message: 'Successfully copied' },
        error: null,
      }),
    }),
  }

  const mockFunctions = {
    invoke: vi.fn().mockResolvedValue({
      data: { result: 'test function result' },
      error: null,
    }),
  }

  const mockRpc = vi.fn().mockResolvedValue({
    data: { result: 'test rpc result' },
    error: null,
  })

  const mockChannel = {
    on: vi.fn().mockReturnThis(),
    subscribe: vi.fn().mockReturnValue({
      unsubscribe: vi.fn(),
    }),
  }

  const mockRealtime = {
    channel: vi.fn().mockReturnValue(mockChannel),
    removeChannel: vi.fn(),
    removeAllChannels: vi.fn(),
    getChannels: vi.fn().mockReturnValue([]),
  }

  return {
    from: mockFrom,
    auth: mockAuth,
    storage: mockStorage,
    functions: mockFunctions,
    rpc: mockRpc,
    realtime: mockRealtime,
    channel: vi.fn().mockReturnValue(mockChannel),
    removeChannel: vi.fn(),
    removeAllChannels: vi.fn(),
    getChannels: vi.fn().mockReturnValue([]),
  }
}

// Helper functions for common test scenarios
export const mockSuccessResponse = <T>(data: T): MockSupabaseResponse<T> => ({
  data,
  error: null,
})

export const mockErrorResponse = <T>(message: string): MockSupabaseResponse<T> => ({
  data: null,
  error: new Error(message),
})

// Common error scenarios
export const mockDatabaseErrors = {
  connectionFailed: () => mockErrorResponse('Database connection failed'),
  notFound: () => mockErrorResponse('Record not found'),
  unauthorized: () => mockErrorResponse('Unauthorized access'),
  validationError: (field: string) => mockErrorResponse(`Validation failed for field: ${field}`),
  duplicateKey: () => mockErrorResponse('Duplicate key violation'),
  foreignKeyViolation: () => mockErrorResponse('Foreign key constraint violation'),
}

// Auth-specific mock responses
export const mockAuthResponses = {
  signedInUser: () => ({
    data: {
      user: {
        id: 'test-user-id',
        email: 'test@example.com',
        created_at: new Date().toISOString(),
      },
      session: {
        access_token: 'mock-access-token',
        refresh_token: 'mock-refresh-token',
        expires_at: Date.now() + 3600000,
        token_type: 'bearer',
        user: {
          id: 'test-user-id',
          email: 'test@example.com',
        },
      },
    },
    error: null,
  }),
  signedOutUser: () => ({
    data: { user: null, session: null },
    error: null,
  }),
  authError: (message: string) => ({
    data: { user: null, session: null },
    error: new Error(message),
  }),
}