import { mockAssets, mockPrompts, mockAutomations, mockCoaches } from '../mocks/data'
import { supabase } from '../../lib/supabaseClient'

// Mock API response fixtures for consistent testing
export const apiResponseFixtures = {
  // Successful responses
  success: {
    assets: {
      list: () => ({
        data: mockAssets.createMany(3),
        error: null,
      }),
      single: () => ({
        data: mockAssets.create(),
        error: null,
      }),
      create: () => ({
        data: mockAssets.create({ name: 'Newly Created Asset' }),
        error: null,
      }),
      update: () => ({
        data: mockAssets.create({ name: 'Updated Asset' }),
        error: null,
      }),
      delete: () => ({
        data: null,
        error: null,
      }),
    },

    prompts: {
      list: () => ({
        data: mockPrompts.createMany(5),
        error: null,
      }),
      single: () => ({
        data: mockPrompts.create(),
        error: null,
      }),
      create: () => ({
        data: mockPrompts.create({ name: 'Newly Created Prompt' }),
        error: null,
      }),
      update: () => ({
        data: mockPrompts.create({ name: 'Updated Prompt' }),
        error: null,
      }),
      delete: () => ({
        data: null,
        error: null,
      }),
    },

    automations: {
      list: () => ({
        data: mockAutomations.createMany(4),
        error: null,
      }),
      single: () => ({
        data: mockAutomations.create(),
        error: null,
      }),
      create: () => ({
        data: mockAutomations.create({ name: 'Newly Created Automation' }),
        error: null,
      }),
      update: () => ({
        data: mockAutomations.create({ name: 'Updated Automation' }),
        error: null,
      }),
      delete: () => ({
        data: null,
        error: null,
      }),
    },

    coaches: {
      list: () => ({
        data: mockCoaches.createMany(3),
        error: null,
      }),
      single: () => ({
        data: mockCoaches.create(),
        error: null,
      }),
      create: () => ({
        data: mockCoaches.create({ name: 'Newly Created Coach' }),
        error: null,
      }),
      update: () => ({
        data: mockCoaches.create({ name: 'Updated Coach' }),
        error: null,
      }),
      delete: () => ({
        data: null,
        error: null,
      }),
    },
  },

  // Error responses
  errors: {
    notFound: () => ({
      data: null,
      error: {
        message: 'Record not found',
        code: 'PGRST116',
        hint: 'The result contains 0 rows',
      },
    }),

    unauthorized: () => ({
      data: null,
      error: {
        message: 'Unauthorized',
        code: '401',
        hint: 'You do not have permission to access this resource',
      },
    }),

    validation: (field: string) => ({
      data: null,
      error: {
        message: `Validation failed for field: ${field}`,
        code: '422',
        hint: 'Check the input data and try again',
      },
    }),

    serverError: () => ({
      data: null,
      error: {
        message: 'Internal Server Error',
        code: '500',
        hint: 'An unexpected error occurred',
      },
    }),

    networkError: () => ({
      data: null,
      error: {
        message: 'Network request failed',
        code: 'NETWORK_ERROR',
        hint: 'Check your internet connection',
      },
    }),

    rateLimited: () => ({
      data: null,
      error: {
        message: 'Too many requests',
        code: '429',
        hint: 'Please wait before making another request',
      },
    }),

    duplicateKey: () => ({
      data: null,
      error: {
        message: 'Duplicate key value violates unique constraint',
        code: '23505',
        hint: 'A record with this value already exists',
      },
    }),

    foreignKeyViolation: () => ({
      data: null,
      error: {
        message: 'Foreign key constraint violation',
        code: '23503',
        hint: 'Referenced record does not exist',
      },
    }),
  },

  // Loading states
  loading: {
    pending: () => ({
      data: null,
      error: null,
      status: 'pending',
    }),
  },

  // Empty states
  empty: {
    list: () => ({
      data: [],
      error: null,
    }),

    single: () => ({
      data: null,
      error: null,
    }),
  },

  // Pagination responses
  paginated: {
    firstPage: () => ({
      data: mockAssets.createMany(10),
      error: null,
      count: 25,
    }),

    middlePage: () => ({
      data: mockAssets.createMany(10),
      error: null,
      count: 25,
    }),

    lastPage: () => ({
      data: mockAssets.createMany(5),
      error: null,
      count: 25,
    }),
  },

  // Real-time subscription responses
  realtime: {
    insert: (record: Record<string, unknown>) => ({
      eventType: 'INSERT',
      new: record,
      old: null,
      schema: 'public',
      table: 'test_table',
    }),

    update: (oldRecord: Record<string, unknown>, newRecord: Record<string, unknown>) => ({
      eventType: 'UPDATE',
      new: newRecord,
      old: oldRecord,
      schema: 'public',
      table: 'test_table',
    }),

    delete: (record: Record<string, unknown>) => ({
      eventType: 'DELETE',
      new: null,
      old: record,
      schema: 'public',
      table: 'test_table',
    }),
  },
}

// Helper to get response by path
export const getApiResponse = (path: string) => {
  const keys = path.split('.')
  let current: unknown = apiResponseFixtures
  
  for (const key of keys) {
    if (current[key]) {
      current = current[key]
    } else {
      throw new Error(`API response not found for path: ${path}`)
    }
  }
  
  return typeof current === 'function' ? current() : current
}

// Helper to setup mock responses for a specific entity
export const setupMockResponses = (entity: keyof typeof apiResponseFixtures.success) => {
  const responses = apiResponseFixtures.success[entity]
  
  // Setup default successful responses
  supabase.from.mockReturnValue({
    select: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
    single: vi.fn().mockResolvedValue(responses.single()),
    // Chain resolves to list for queries without single()
    then: vi.fn().mockResolvedValue(responses.list()),
  })
  
  return {
    mockList: () => supabase.from().select().mockResolvedValue(responses.list()),
    mockSingle: () => supabase.from().select().single().mockResolvedValue(responses.single()),
    mockCreate: () => supabase.from().insert().mockResolvedValue(responses.create()),
    mockUpdate: () => supabase.from().update().mockResolvedValue(responses.update()),
    mockDelete: () => supabase.from().delete().mockResolvedValue(responses.delete()),
    mockError: (errorType: keyof typeof apiResponseFixtures.errors) => {
      const errorResponse = apiResponseFixtures.errors[errorType]()
      supabase.from().select().mockResolvedValue(errorResponse)
    },
  }
}