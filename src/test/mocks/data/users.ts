import type { MockDataFactory } from '../../types/testing'

export interface MockUser {
  id: string
  email: string
  created_at: string
  updated_at?: string
}

export interface MockUserProfile {
  id: string
  user_id: string
  full_name?: string
  avatar_url?: string
  created_at: string
  updated_at?: string
}

const createMockUser: MockDataFactory<MockUser>['create'] = (overrides = {}) => ({
  id: crypto.randomUUID(),
  email: 'test-user@example.com',
  created_at: new Date().toISOString(),
  ...overrides,
})

const createManyMockUsers: MockDataFactory<MockUser>['createMany'] = (count, overrides = {}) => {
  return Array.from({ length: count }, (_, index) =>
    createMockUser({
      email: `test-user-${index}@example.com`,
      ...overrides,
    })
  )
}

const createMockUserProfile: MockDataFactory<MockUserProfile>['create'] = (overrides = {}) => ({
  id: crypto.randomUUID(),
  user_id: crypto.randomUUID(),
  full_name: 'Test User',
  avatar_url: 'https://example.com/avatar.jpg',
  created_at: new Date().toISOString(),
  ...overrides,
})

const createManyMockUserProfiles: MockDataFactory<MockUserProfile>['createMany'] = (count, overrides = {}) => {
  return Array.from({ length: count }, (_, index) =>
    createMockUserProfile({
      full_name: `Test User ${index + 1}`,
      ...overrides,
    })
  )
}

export const mockUsers: MockDataFactory<MockUser> = {
  create: createMockUser,
  createMany: createManyMockUsers,
}

export const mockUserProfiles: MockDataFactory<MockUserProfile> = {
  create: createMockUserProfile,
  createMany: createManyMockUserProfiles,
}