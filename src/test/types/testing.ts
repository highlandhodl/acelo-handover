export interface MockDataFactory<T> {
  create: (overrides?: Partial<T>) => T
  createMany: (count: number, overrides?: Partial<T>) => T[]
}

export interface TestScenario {
  name: string
  description: string
  setup: () => void | Promise<void>
  cleanup?: () => void | Promise<void>
}

export interface TestUser {
  id: string
  email: string
  role: 'admin' | 'user'
  created_at: string
}

export interface MockSupabaseResponse<T> {
  data: T | null
  error: Error | null
}

export interface CoverageThresholds {
  statements: number
  branches: number
  functions: number
  lines: number
}

export interface TestMetrics {
  totalTests: number
  passingTests: number
  failingTests: number
  coverage: CoverageThresholds
  duration: number
}