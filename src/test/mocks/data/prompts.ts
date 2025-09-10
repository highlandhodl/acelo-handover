import type { MockDataFactory } from '../../types/testing'
import type { Prompt, PromptVersion, PromptFormData } from '../../../types/prompt'

const createMockPrompt: MockDataFactory<Prompt>['create'] = (overrides = {}) => ({
  id: crypto.randomUUID(),
  name: 'Test Prompt',
  title: 'Test Prompt Title',
  description: 'Test prompt description',
  category: 'General',
  purpose: 'Testing',
  prompt_content: 'This is a test prompt content.',
  status: 'active',
  current_version: 1,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  ...overrides,
})

const createManyMockPrompts: MockDataFactory<Prompt>['createMany'] = (count, overrides = {}) => {
  return Array.from({ length: count }, (_, index) =>
    createMockPrompt({
      name: `Test Prompt ${index + 1}`,
      title: `Test Prompt Title ${index + 1}`,
      description: `Test prompt description ${index + 1}`,
      ...overrides,
    })
  )
}

const createMockPromptVersion: MockDataFactory<PromptVersion>['create'] = (overrides = {}) => ({
  id: crypto.randomUUID(),
  prompt_id: crypto.randomUUID(),
  title: 'Test Prompt Version',
  content: 'This is a test prompt version content.',
  version_number: 1,
  created_at: new Date().toISOString(),
  ...overrides,
})

const createManyMockPromptVersions: MockDataFactory<PromptVersion>['createMany'] = (count, overrides = {}) => {
  return Array.from({ length: count }, (_, index) =>
    createMockPromptVersion({
      title: `Test Prompt Version ${index + 1}`,
      version_number: index + 1,
      ...overrides,
    })
  )
}

const createMockPromptFormData: MockDataFactory<PromptFormData>['create'] = (overrides = {}) => ({
  name: 'Test Prompt Form',
  description: 'Test prompt form description',
  category: 'General',
  title: 'Test Prompt Form Title',
  content: 'This is test prompt form content.',
  ...overrides,
})

const createManyMockPromptFormData: MockDataFactory<PromptFormData>['createMany'] = (count, overrides = {}) => {
  return Array.from({ length: count }, (_, index) =>
    createMockPromptFormData({
      name: `Test Prompt Form ${index + 1}`,
      title: `Test Prompt Form Title ${index + 1}`,
      ...overrides,
    })
  )
}

export const mockPrompts: MockDataFactory<Prompt> = {
  create: createMockPrompt,
  createMany: createManyMockPrompts,
}

export const mockPromptVersions: MockDataFactory<PromptVersion> = {
  create: createMockPromptVersion,
  createMany: createManyMockPromptVersions,
}

export const mockPromptFormData: MockDataFactory<PromptFormData> = {
  create: createMockPromptFormData,
  createMany: createManyMockPromptFormData,
}

// Common prompt test scenarios
export const promptTestScenarios = {
  active: () => createMockPrompt({
    status: 'active',
    current_version: 1,
  }),
  draft: () => createMockPrompt({
    status: 'draft',
    current_version: 0,
  }),
  archived: () => createMockPrompt({
    status: 'archived',
    current_version: 3,
  }),
  marketing: () => createMockPrompt({
    category: 'Marketing',
    purpose: 'Email campaigns',
    prompt_content: 'Write a compelling marketing email for {product_name}.',
  }),
  technical: () => createMockPrompt({
    category: 'Technical',
    purpose: 'Code generation',
    prompt_content: 'Generate a {language} function that {functionality}.',
  }),
}