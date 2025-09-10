# Acelo Testing Guide

## Overview

This document provides comprehensive guidelines for testing in the Acelo platform. Our testing infrastructure is built on **Vitest**, **React Testing Library**, and **TanStack Query** with comprehensive mocking and utilities.

## Quick Start

```bash
# Run all tests
npm test

# Run tests in CI mode with coverage
npm run test:ci

# Run tests with coverage report
npm run test:coverage

# Run specific test suites
npm run test:hooks      # Only hook tests
npm run test:components # Only component tests
npm run test:unit       # All unit tests

# Run performance benchmarks
npm run test:performance

# Watch mode for development
npm test:watch
````

## Testing Philosophy

Our testing strategy follows these principles:

1.  **Test behaviour, not implementation** - Focus on what the code does, not how it does it.
2.  **Business logic lives in hooks** - We write comprehensive tests for custom hooks where all business logic resides.
3.  **Components are for interactions** - We test user interactions and complex conditional rendering in components.
4.  **Mock all external dependencies** - Supabase, APIs, and other external services must be mocked consistently.
5.  **Performance is a feature** - Monitor test performance and optimise for a fast feedback loop.

## Testing Architecture

### Coverage Thresholds

| Category          | Statements | Branches | Functions | Lines |
| ----------------- | ---------- | -------- | --------- | ----- |
| **Hooks** | 90%        | 85%      | 90%       | 90%   |
| **Utilities** | 100%       | 100%     | 100%      | 100%  |
| **Components** | 80%        | 75%      | 80%       | 80%   |
| **Overall Project** | 85%        | 80%      | 85%       | 85%   |

### Testing Hierarchy

```
src/
├── test/                 # Testing infrastructure
│   ├── setup.ts          # Global test configuration
│   ├── mocks/            # Mock factories and utilities
│   │   ├── data/         # Mock data factories
│   │   └── supabase.ts   # Supabase mocking
│   ├── utils/            # Test utilities
│   │   ├── queryClient.ts# TanStack Query test helpers
│   │   └── testHelpers.ts# Common test utilities
│   └── fixtures/         # Test fixtures and scenarios
├── hooks/
│   └── **/*.test.ts      # Hook tests alongside source
├── components/
│   └── **/*.test.tsx     # Component tests alongside source
└── lib/
    └── **/*.test.ts      # Utility function tests
```

## Writing Tests

### Hook Testing Patterns

**Query Hook Pattern (Data Fetching):**

```typescript
import { renderHook, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useGetAssets } from './useGetAssets';
import { createQueryWrapper } from '../../test/utils/queryClient';
import { mockAssets } from '../../test/mocks/data';

// Mock auth context
const mockUseAuth = vi.fn();
vi.mock('../../context/AuthContext', () => ({
  useAuth: mockUseAuth,
}));

describe('useGetAssets', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseAuth.mockReturnValue({
      user: { id: 'test-user-id' },
      loading: false,
    });
  });

  it('should fetch assets successfully', async () => {
    const mockData = mockAssets.createMany(3);
    
    // Mock your supabase client response
    const { supabase } = require('../../lib/supabaseClient');
    supabase.from.mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockResolvedValue({ data: mockData, error: null }),
    });

    const { result } = renderHook(() => useGetAssets(), {
      wrapper: createQueryWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(mockData);
  });
});
```

**Mutation Hook Pattern (Data Modification):**

```typescript
import { renderHook, waitFor } from '@testing-library/react';
import { useCreateAsset } from './useCreateAsset';
import { createQueryWrapper } from '../../test/utils/queryClient';
import { mockAssets } from '../../test/mocks/data';

describe('useCreateAsset', () => {
  it('should create an asset and invalidate queries', async () => {
    const newAsset = mockAssets.create();
    const { queryClient, wrapper } = createQueryWrapper(true); // Get client for spying
    
    // Mock supabase client response
    const { supabase } = require('../../lib/supabaseClient');
    supabase.from.mockReturnValue({
        insert: vi.fn().mockReturnThis(),
        select: vi.fn().mockResolvedValue({ data: [newAsset], error: null }),
    });
    
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');
    const { result } = renderHook(() => useCreateAsset(), { wrapper });

    result.current.mutate(newAsset);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['assets'] });
  });
});
```

### Component Testing Patterns

```typescript
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { AssetCard } from './AssetCard';
import { mockAssets } from '../../test/mocks/data';
import { createQueryWrapper } from '../../test/utils/queryClient';

describe('AssetCard', () => {
  const mockAsset = mockAssets.create();

  it('should handle delete action', async () => {
    const onDelete = vi.fn();
    
    render(<AssetCard asset={mockAsset} onDelete={onDelete} />, {
      wrapper: createQueryWrapper(),
    });

    const deleteButton = screen.getByRole('button', { name: /delete/i });
    fireEvent.click(deleteButton);

    await waitFor(() => {
      expect(onDelete).toHaveBeenCalledWith(mockAsset.id);
    });
  });
});
```

## Mocking & Data

### Mock Data Factories

Always use mock factories from `src/test/mocks/data` to ensure consistent test data.

```typescript
import { mockAssets, mockUsers } from '../../test/mocks/data';

// Create a single mock item
const user = mockUsers.create({ email: 'test@acelo.com' });

// Create an array of mock items
const assets = mockAssets.createMany(5);
```

### Test Scenarios

Use fixtures from `src/test/fixtures` to set up common application states.

```typescript
import { setupUserState } from '../../test/fixtures/userStates';

// Setup an authenticated user state before the test runs
await setupUserState('signedInUser');

// Setup a signed-out state
await setupUserState('signedOut');
```

## Best Practices

### DO ✅

  - Test user behaviour, not implementation details.
  - Use descriptive test names (`it('should do X when Y occurs')`).
  - Group related tests with `describe` blocks.
  - Mock external dependencies consistently.
  - Test all success and error scenarios.
  - Test edge cases and boundary conditions.
  - Ensure tests are independent and can run in any order.
  - Clean up mocks after each test (`vi.clearAllMocks()`).

### DON'T ❌

  - Do not test implementation details (e.g., checking internal state of a hook).
  - Do not create tests that depend on other tests.
  - Do not use real network calls or databases.
  - Do not hardcode test data; use the mock factories.
  - Do not forget to test asynchronous operations properly with `async/await` and `waitFor`.
  - Do not write overly complex tests. One assertion per test is ideal.
