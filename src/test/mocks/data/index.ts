// Export all mock data factories
export * from './users'
export * from './assets' 
export * from './prompts'
export * from './coaches'
export * from './automations'

// Export test scenarios for convenience
export { assetTestScenarios } from './assets'
export { promptTestScenarios } from './prompts'
export { coachTestScenarios } from './coaches'
export { automationTestScenarios } from './automations'

// Common utility functions for testing
export const createTestId = () => crypto.randomUUID()

export const createTestDate = (daysFromNow = 0) => {
  const date = new Date()
  date.setDate(date.getDate() + daysFromNow)
  return date.toISOString()
}

// Test user states for common scenarios
export const testUserStates = {
  authenticated: {
    id: 'test-user-id',
    email: 'test@example.com',
    created_at: createTestDate(-30),
  },
  newUser: {
    id: 'new-user-id',
    email: 'new@example.com',
    created_at: createTestDate(-1),
  },
  adminUser: {
    id: 'admin-user-id',
    email: 'admin@example.com',
    created_at: createTestDate(-100),
  },
}

// Common API response patterns
export const createSuccessResponse = <T>(data: T) => ({
  data,
  error: null,
})

export const createErrorResponse = <T>(message: string) => ({
  data: null as T | null,
  error: new Error(message),
})

// Database error scenarios
export const dbErrors = {
  notFound: 'Record not found',
  unauthorized: 'Unauthorized access',
  validationError: 'Validation failed',
  connectionError: 'Database connection failed',
  duplicateKey: 'Duplicate key violation',
  foreignKey: 'Foreign key constraint violation',
}

// Performance test helpers
export const createLargeDataset = <T>(factory: (overrides?: Partial<T>) => T, size: number) => {
  return Array.from({ length: size }, () => factory())
}