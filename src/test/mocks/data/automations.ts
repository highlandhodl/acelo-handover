import type { MockDataFactory } from '../../types/testing'
import type { Automation, AutomationFormData } from '../../../types/automation'

const createMockAutomation: MockDataFactory<Automation>['create'] = (overrides = {}) => ({
  id: crypto.randomUUID(),
  name: 'Test Automation',
  description: 'Test automation description',
  category: 'General',
  active: true,
  created_at: new Date().toISOString(),
  ...overrides,
})

const createManyMockAutomations: MockDataFactory<Automation>['createMany'] = (count, overrides = {}) => {
  return Array.from({ length: count }, (_, index) =>
    createMockAutomation({
      name: `Test Automation ${index + 1}`,
      description: `Test automation description ${index + 1}`,
      active: index % 2 === 0, // Alternate active/inactive
      ...overrides,
    })
  )
}

const createMockAutomationFormData: MockDataFactory<AutomationFormData>['create'] = (overrides = {}) => ({
  name: 'Test Automation Form',
  description: 'Test automation form description',
  category: 'General',
  active: true,
  ...overrides,
})

const createManyMockAutomationFormData: MockDataFactory<AutomationFormData>['createMany'] = (count, overrides = {}) => {
  return Array.from({ length: count }, (_, index) =>
    createMockAutomationFormData({
      name: `Test Automation Form ${index + 1}`,
      description: `Test automation form description ${index + 1}`,
      ...overrides,
    })
  )
}

export const mockAutomations: MockDataFactory<Automation> = {
  create: createMockAutomation,
  createMany: createManyMockAutomations,
}

export const mockAutomationFormData: MockDataFactory<AutomationFormData> = {
  create: createMockAutomationFormData,
  createMany: createManyMockAutomationFormData,
}

// Common automation test scenarios
export const automationTestScenarios = {
  active: () => createMockAutomation({
    active: true,
  }),
  inactive: () => createMockAutomation({
    active: false,
  }),
  emailMarketing: () => createMockAutomation({
    name: 'Email Marketing Campaign',
    description: 'Automated email marketing workflow',
    category: 'Marketing',
    active: true,
  }),
  leadNurturing: () => createMockAutomation({
    name: 'Lead Nurturing Sequence',
    description: 'Automated lead nurturing process',
    category: 'Sales',
    active: true,
  }),
  customerOnboarding: () => createMockAutomation({
    name: 'Customer Onboarding',
    description: 'Automated customer onboarding workflow',
    category: 'Customer Success',
    active: true,
  }),
  dataSync: () => createMockAutomation({
    name: 'Data Synchronization',
    description: 'Automated data sync between systems',
    category: 'Integration',
    active: true,
  }),
  reporting: () => createMockAutomation({
    name: 'Weekly Reporting',
    description: 'Automated weekly report generation',
    category: 'Analytics',
    active: true,
  }),
}