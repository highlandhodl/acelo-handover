import { bench, describe } from 'vitest'
import { cn } from '../../lib/utils'
import { applyTheme, getCurrentTheme, cycleTheme } from '../../lib/themeUtils'

describe('Utils Performance Tests', () => {
  bench('cn function with simple classes', () => {
    cn('px-4', 'py-2', 'bg-blue-500', 'text-white', 'rounded')
  })

  bench('cn function with complex conflicts', () => {
    cn(
      'px-2 py-1 bg-red-500 hover:bg-red-600 focus:bg-red-700',
      'px-4 py-2 bg-blue-500 hover:bg-blue-600 focus:bg-blue-700',
      'px-6 py-3 bg-green-500 hover:bg-green-600 focus:bg-green-700'
    )
  })

  bench('cn function with conditional classes', () => {
    cn(
      'base-class',
      Math.random() > 0.5 && 'conditional-class-1',
      Math.random() > 0.5 && 'conditional-class-2',
      {
        'object-class-1': Math.random() > 0.5,
        'object-class-2': Math.random() > 0.5,
        'object-class-3': Math.random() > 0.5,
      }
    )
  })

  bench('cn function with large class arrays', () => {
    const classes = Array.from({ length: 100 }, (_, i) => `class-${i}`)
    cn(...classes)
  })
})

describe('Theme Utils Performance Tests', () => {
  // Mock document.documentElement for performance tests
  const mockElement = {
    classList: {
      add: () => {},
      remove: () => {},
      contains: () => Math.random() > 0.5,
    }
  }
  
  global.document = {
    documentElement: mockElement
  } as unknown as Document

  bench('applyTheme function', () => {
    applyTheme(Math.random() > 0.5 ? 'light' : 'dark')
  })

  bench('getCurrentTheme function', () => {
    getCurrentTheme()
  })

  bench('cycleTheme function', () => {
    const themes = ['light', 'dark', 'system'] as const
    cycleTheme(themes[Math.floor(Math.random() * themes.length)])
  })

  bench('theme cycle operations (bulk)', () => {
    let theme: 'light' | 'dark' | 'system' = 'light'
    for (let i = 0; i < 1000; i++) {
      theme = cycleTheme(theme)
    }
  })
})