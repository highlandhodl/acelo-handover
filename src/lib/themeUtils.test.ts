import { describe, it, expect, beforeEach, vi } from 'vitest'
import { applyTheme, getCurrentTheme, cycleTheme } from './themeUtils'

describe('themeUtils', () => {
  // Mock document.documentElement
  const mockDocumentElement = {
    classList: {
      add: vi.fn(),
      remove: vi.fn(),
      contains: vi.fn(),
    }
  }

  beforeEach(() => {
    vi.clearAllMocks()
    
    // Mock document.documentElement
    Object.defineProperty(global.document, 'documentElement', {
      value: mockDocumentElement,
      writable: true,
    })
  })

  describe('applyTheme', () => {
    it('should apply light theme correctly', () => {
      applyTheme('light')
      
      expect(mockDocumentElement.classList.remove).toHaveBeenCalledWith('light', 'dark')
      expect(mockDocumentElement.classList.add).toHaveBeenCalledWith('light')
    })

    it('should apply dark theme correctly', () => {
      applyTheme('dark')
      
      expect(mockDocumentElement.classList.remove).toHaveBeenCalledWith('light', 'dark')
      expect(mockDocumentElement.classList.add).toHaveBeenCalledWith('dark')
    })

    it('should remove existing theme classes before applying new one', () => {
      applyTheme('dark')
      
      expect(mockDocumentElement.classList.remove).toHaveBeenCalledWith('light', 'dark')
      expect(mockDocumentElement.classList.add).toHaveBeenCalledWith('dark')
    })
  })

  describe('getCurrentTheme', () => {
    it('should return dark when dark class is present', () => {
      mockDocumentElement.classList.contains.mockReturnValue(true)
      
      const theme = getCurrentTheme()
      
      expect(mockDocumentElement.classList.contains).toHaveBeenCalledWith('dark')
      expect(theme).toBe('dark')
    })

    it('should return light when dark class is not present', () => {
      mockDocumentElement.classList.contains.mockReturnValue(false)
      
      const theme = getCurrentTheme()
      
      expect(mockDocumentElement.classList.contains).toHaveBeenCalledWith('dark')
      expect(theme).toBe('light')
    })
  })

  describe('cycleTheme', () => {
    it('should cycle from light to dark', () => {
      const result = cycleTheme('light')
      expect(result).toBe('dark')
    })

    it('should cycle from dark to system', () => {
      const result = cycleTheme('dark')
      expect(result).toBe('system')
    })

    it('should cycle from system to light', () => {
      const result = cycleTheme('system')
      expect(result).toBe('light')
    })

    it('should default to light for invalid input', () => {
      const result = cycleTheme('invalid' as Theme)
      expect(result).toBe('light')
    })

    it('should handle undefined input', () => {
      const result = cycleTheme(undefined as unknown as Theme)
      expect(result).toBe('light')
    })

    it('should handle null input', () => {
      const result = cycleTheme(null as unknown as Theme)
      expect(result).toBe('light')
    })
  })

  describe('theme cycle integration', () => {
    it('should complete a full cycle correctly', () => {
      let currentTheme: 'light' | 'dark' | 'system' = 'light'
      
      // light -> dark
      currentTheme = cycleTheme(currentTheme)
      expect(currentTheme).toBe('dark')
      
      // dark -> system
      currentTheme = cycleTheme(currentTheme)
      expect(currentTheme).toBe('system')
      
      // system -> light
      currentTheme = cycleTheme(currentTheme)
      expect(currentTheme).toBe('light')
    })
  })

  describe('edge cases and error handling', () => {
    it('should handle missing document.documentElement gracefully', () => {
      Object.defineProperty(global.document, 'documentElement', {
        value: null,
        writable: true,
      })

      expect(() => applyTheme('light')).toThrow()
    })

    it('should handle classList methods not being functions', () => {
      Object.defineProperty(global.document, 'documentElement', {
        value: {
          classList: {
            add: null,
            remove: null,
            contains: null,
          }
        },
        writable: true,
      })

      expect(() => applyTheme('light')).toThrow()
      expect(() => getCurrentTheme()).toThrow()
    })
  })
})