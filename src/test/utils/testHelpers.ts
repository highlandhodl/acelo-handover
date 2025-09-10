import { vi } from 'vitest'
import { render, RenderOptions } from '@testing-library/react'
import { createQueryWrapper } from './queryClient'
import type { ReactElement } from 'react'
import React from 'react'

// Custom render function that includes providers
export const renderWithProviders = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => {
  const Wrapper = createQueryWrapper()
  
  return render(ui, { wrapper: Wrapper, ...options })
}

// Helper to create a mock function with proper typing
export const createMockFn = <T extends (...args: unknown[]) => unknown>(): T => {
  return vi.fn() as T
}

// Helper to create a resolved promise for async testing
export const createResolvedPromise = <T>(value: T, delay = 0): Promise<T> => {
  return new Promise((resolve) => {
    setTimeout(() => resolve(value), delay)
  })
}

// Helper to create a rejected promise for error testing
export const createRejectedPromise = <T>(error: Error, delay = 0): Promise<T> => {
  return new Promise((_, reject) => {
    setTimeout(() => reject(error), delay)
  })
}

// Helper to wait for a specific condition
export const waitForCondition = (
  condition: () => boolean,
  timeout = 5000,
  interval = 100
): Promise<void> => {
  return new Promise((resolve, reject) => {
    const startTime = Date.now()
    
    const check = () => {
      if (condition()) {
        resolve()
      } else if (Date.now() - startTime >= timeout) {
        reject(new Error(`Condition not met within ${timeout}ms`))
      } else {
        setTimeout(check, interval)
      }
    }
    
    check()
  })
}

// Helper to create a timer that can be advanced manually in tests
export const createTestTimer = () => {
  let currentTime = 0
  
  return {
    advance: (ms: number) => {
      currentTime += ms
      vi.advanceTimersByTime(ms)
    },
    getCurrentTime: () => currentTime,
    reset: () => {
      currentTime = 0
      vi.clearAllTimers()
    },
  }
}

// Helper for testing component lifecycle methods
export const componentTestHelpers = {
  mount: (component: ReactElement) => renderWithProviders(component),
  unmount: (result: ReturnType<typeof renderWithProviders>) => result.unmount(),
  rerender: (result: ReturnType<typeof renderWithProviders>, newComponent: ReactElement) =>
    result.rerender(newComponent),
}

// Helper for testing form interactions
export const formTestHelpers = {
  fillInput: (input: HTMLInputElement, value: string) => {
    input.focus()
    input.value = value
    input.dispatchEvent(new Event('input', { bubbles: true }))
    input.dispatchEvent(new Event('change', { bubbles: true }))
  },
  
  submitForm: (form: HTMLFormElement) => {
    form.dispatchEvent(new Event('submit', { bubbles: true }))
  },
  
  clickButton: (button: HTMLButtonElement) => {
    button.click()
  },
}

// Helper for testing async operations with cleanup
export const asyncTestHelper = <T>(
  asyncFn: () => Promise<T>,
  cleanup?: () => void | Promise<void>
) => {
  return async (): Promise<T> => {
    try {
      return await asyncFn()
    } finally {
      if (cleanup) {
        await cleanup()
      }
    }
  }
}

// Helper for testing error boundaries
export const createTestErrorBoundary = () => {
  let caughtError: Error | null = null
  
  const TestErrorBoundary = ({ children }: { children: React.ReactNode }) => {
    try {
      return React.createElement(React.Fragment, null, children)
    } catch (error) {
      caughtError = error as Error
      return React.createElement('div', { 'data-testid': 'error-boundary' }, 'Error caught')
    }
  }
  
  return {
    ErrorBoundary: TestErrorBoundary,
    getCaughtError: () => caughtError,
    clearError: () => { caughtError = null },
  }
}

// Helper for testing localStorage
export const localStorageTestHelper = {
  mockGetItem: (key: string, value: string | null = null) => {
    vi.mocked(localStorage.getItem).mockImplementation((k) => k === key ? value : null)
  },
  
  mockSetItem: () => {
    const setItem = vi.fn()
    vi.mocked(localStorage.setItem).mockImplementation(setItem)
    return setItem
  },
  
  clear: () => {
    vi.mocked(localStorage.clear).mockImplementation(() => {})
  },
}

// Helper for testing file operations
export const fileTestHelper = {
  createMockFile: (name: string, content: string, type: string = 'text/plain') => {
    return new File([content], name, { type })
  },
  
  createMockFileList: (files: File[]) => {
    const fileList = {
      length: files.length,
      item: (index: number) => files[index] || null,
      *[Symbol.iterator]() {
        yield* files
      },
    }
    return fileList as FileList
  },
}

// Performance testing helper
export const performanceTestHelper = {
  measureTime: async <T>(fn: () => Promise<T>): Promise<{ result: T; duration: number }> => {
    const start = performance.now()
    const result = await fn()
    const end = performance.now()
    return { result, duration: end - start }
  },
  
  expectToBeUnder: (duration: number, threshold: number, operation: string) => {
    if (duration > threshold) {
      throw new Error(`${operation} took ${duration}ms, expected under ${threshold}ms`)
    }
  },
}

// Re-export commonly used testing utilities
export { waitFor, screen, fireEvent, act } from '@testing-library/react'
export { vi } from 'vitest'