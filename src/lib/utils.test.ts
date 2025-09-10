import { describe, it, expect } from 'vitest'
import { cn } from './utils'

describe('cn utility function', () => {
  it('should merge class names correctly', () => {
    expect(cn('px-2', 'py-1')).toBe('px-2 py-1')
  })

  it('should handle conflicting Tailwind classes', () => {
    expect(cn('px-2 px-4')).toBe('px-4')
    expect(cn('text-red-500 text-blue-500')).toBe('text-blue-500')
  })

  it('should handle conditional classes', () => {
    const isTrue = true
    const isFalse = false
    expect(cn('base-class', isTrue && 'conditional-class')).toBe('base-class conditional-class')
    expect(cn('base-class', isFalse && 'conditional-class')).toBe('base-class')
  })

  it('should handle empty inputs', () => {
    expect(cn()).toBe('')
    expect(cn('')).toBe('')
    expect(cn(null)).toBe('')
    expect(cn(undefined)).toBe('')
  })

  it('should handle arrays of classes', () => {
    expect(cn(['px-2', 'py-1'])).toBe('px-2 py-1')
    expect(cn(['px-2', null, 'py-1'])).toBe('px-2 py-1')
  })

  it('should handle objects with conditional classes', () => {
    expect(cn({
      'base-class': true,
      'optional-class': false,
      'another-class': true
    })).toBe('base-class another-class')
  })

  it('should handle mixed input types', () => {
    expect(cn(
      'base-class',
      ['array-class'],
      { 'object-class': true, 'false-class': false },
      'final-class'
    )).toBe('base-class array-class object-class final-class')
  })

  it('should handle complex Tailwind conflicts', () => {
    expect(cn(
      'bg-red-500 hover:bg-red-600',
      'bg-blue-500 hover:bg-blue-600'
    )).toBe('bg-blue-500 hover:bg-blue-600')
  })

  it('should preserve non-conflicting responsive classes', () => {
    expect(cn(
      'w-full sm:w-1/2 md:w-1/3',
      'lg:w-1/4'
    )).toBe('w-full sm:w-1/2 md:w-1/3 lg:w-1/4')
  })

  it('should handle hover, focus, and state variants', () => {
    expect(cn(
      'hover:bg-red-500 focus:bg-red-500',
      'hover:bg-blue-500'
    )).toBe('focus:bg-red-500 hover:bg-blue-500')
  })
})