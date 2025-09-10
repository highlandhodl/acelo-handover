/// <reference types="vitest" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
    
    // Coverage configuration
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      reportsDirectory: './coverage',
      exclude: [
        'node_modules/',
        'src/test/',
        '**/*.d.ts',
        '**/*.config.*',
        '**/coverage/**',
        '**/*.test.*',
        '**/*.spec.*',
        'src/types/',
        'src/components/ui/', // shadcn/ui components
        'dist/',
        '.next/',
        '.nuxt/',
        '.output/',
        '.vite/',
        '.vitepress/',
        '.storybook/',
        'storybook-static/',
        'cypress/',
        'test-results/',
        'playwright-report/',
        'playwright/',
        '.nyc_output/',
      ],
      thresholds: {
        global: {
          statements: 85,
          branches: 80,
          functions: 85,
          lines: 85,
        },
        './src/hooks/': {
          statements: 90,
          branches: 85,
          functions: 90,
          lines: 90,
        },
        './src/lib/': {
          statements: 100,
          branches: 100,
          functions: 100,
          lines: 100,
        },
        './src/context/': {
          statements: 85,
          branches: 80,
          functions: 85,
          lines: 85,
        },
      },
      all: true,
      clean: true,
    },
    
    // Test execution configuration
    testTimeout: 10000,
    hookTimeout: 10000,
    teardownTimeout: 5000,
    
    // Parallel execution
    threads: true,
    maxThreads: 4,
    minThreads: 1,
    
    // Watch mode configuration
    watch: {
      ignored: [
        '**/node_modules/**',
        '**/dist/**',
        '**/coverage/**',
        '**/.git/**',
      ],
    },
    
    // Reporter configuration
    reporter: ['verbose', 'json'],
    outputFile: {
      json: './test-results/results.json',
    },
    
    // Retry configuration for flaky tests
    retry: 2,
    
    // Test file patterns
    include: [
      'src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}',
    ],
    exclude: [
      'node_modules',
      'dist',
      '.idea',
      '.git',
      '.cache',
      'coverage',
    ],
    
    // Environment configuration
    env: {
      NODE_ENV: 'test',
      VITE_SUPABASE_URL: 'https://test.supabase.co',
      VITE_SUPABASE_ANON_KEY: 'test-anon-key',
    },
    
    // Mock configuration
    clearMocks: true,
    restoreMocks: true,
    
    // Performance monitoring
    benchmark: {
      outputFile: './test-results/benchmark.json',
      reporters: ['verbose'],
    },
    
    // UI configuration for local development
    ui: false, // Set to true to enable Vitest UI
    uiBase: '/vitest/',
    
    // Pool options
    pool: 'threads',
    poolOptions: {
      threads: {
        singleThread: false,
      },
    },
    
    // Logging configuration
    logLevel: 'info',
    silent: false,
    
    // Server configuration
    server: {
      deps: {
        inline: [
          // Inline dependencies that need to be transformed
          '@supabase/supabase-js',
          '@tanstack/react-query',
        ],
      },
    },
  },
})