import type { MockDataFactory } from '../../types/testing'
import type { Coach, CoachFormData } from '../../../types/coach'

const createMockCoach: MockDataFactory<Coach>['create'] = (overrides = {}) => ({
  id: crypto.randomUUID(),
  name: 'Test Coach',
  description: 'Test coach description',
  voice_name: 'Test Voice',
  voice_id: 'test-voice-id',
  category: 'General',
  rating: 4.5,
  available: true,
  agent_id: crypto.randomUUID(),
  external_url: 'https://example.com/coach',
  personality: 'Professional and helpful',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  ...overrides,
})

const createManyMockCoaches: MockDataFactory<Coach>['createMany'] = (count, overrides = {}) => {
  return Array.from({ length: count }, (_, index) =>
    createMockCoach({
      name: `Test Coach ${index + 1}`,
      description: `Test coach description ${index + 1}`,
      rating: 3 + (index % 3), // Ratings between 3-5
      ...overrides,
    })
  )
}

const createMockCoachFormData: MockDataFactory<CoachFormData>['create'] = (overrides = {}) => ({
  name: 'Test Coach Form',
  description: 'Test coach form description',
  category: 'General',
  personality: 'Friendly and knowledgeable',
  ...overrides,
})

const createManyMockCoachFormData: MockDataFactory<CoachFormData>['createMany'] = (count, overrides = {}) => {
  return Array.from({ length: count }, (_, index) =>
    createMockCoachFormData({
      name: `Test Coach Form ${index + 1}`,
      description: `Test coach form description ${index + 1}`,
      ...overrides,
    })
  )
}

export const mockCoaches: MockDataFactory<Coach> = {
  create: createMockCoach,
  createMany: createManyMockCoaches,
}

export const mockCoachFormData: MockDataFactory<CoachFormData> = {
  create: createMockCoachFormData,
  createMany: createManyMockCoachFormData,
}

// Common coach test scenarios
export const coachTestScenarios = {
  available: () => createMockCoach({
    available: true,
    rating: 4.8,
  }),
  unavailable: () => createMockCoach({
    available: false,
    rating: 4.2,
  }),
  marketing: () => createMockCoach({
    category: 'Marketing',
    name: 'Marketing Expert',
    personality: 'Creative and persuasive',
    description: 'Specializes in marketing strategies and campaigns',
  }),
  technical: () => createMockCoach({
    category: 'Technical',
    name: 'Tech Mentor',
    personality: 'Analytical and precise',
    description: 'Expert in software development and architecture',
  }),
  sales: () => createMockCoach({
    category: 'Sales',
    name: 'Sales Coach',
    personality: 'Motivational and results-driven',
    description: 'Helps improve sales performance and techniques',
  }),
  highRated: () => createMockCoach({
    rating: 4.9,
    available: true,
  }),
  lowRated: () => createMockCoach({
    rating: 3.2,
    available: true,
  }),
}