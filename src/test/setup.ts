import '@testing-library/jest-dom'
import { beforeAll, beforeEach, afterEach, vi } from 'vitest'
import { createMockSupabaseClient } from './mocks/supabase'

// Mock Supabase client with comprehensive coverage
const mockSupabaseClient = createMockSupabaseClient()

vi.mock('../lib/supabaseClient', () => ({
  supabase: mockSupabaseClient,
}))

// Mock localStorage and sessionStorage
const mockStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
  key: vi.fn(),
  length: 0,
}

Object.defineProperty(global, 'localStorage', {
  value: mockStorage,
  writable: true,
})

Object.defineProperty(global, 'sessionStorage', {
  value: mockStorage,
  writable: true,
})

// Mock IntersectionObserver
beforeAll(() => {
  global.IntersectionObserver = vi.fn().mockImplementation(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
  }))

  // Mock ResizeObserver
  global.ResizeObserver = vi.fn().mockImplementation(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
  }))

  // Mock matchMedia
  global.matchMedia = vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }))

  // Mock URL.createObjectURL and URL.revokeObjectURL for file uploads
  global.URL.createObjectURL = vi.fn().mockReturnValue('mock-object-url')
  global.URL.revokeObjectURL = vi.fn()

  // Mock fetch for external API calls
  global.fetch = vi.fn()
})

// Reset all mocks between tests
beforeEach(() => {
  vi.clearAllMocks()
  mockStorage.getItem.mockClear()
  mockStorage.setItem.mockClear()
  mockStorage.removeItem.mockClear()
  mockStorage.clear.mockClear()
})

// Clean up after each test
afterEach(() => {
  vi.clearAllTimers()
  vi.useRealTimers()
})