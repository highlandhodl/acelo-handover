import { renderHook } from '@testing-library/react';
import { useContextSearch } from './useContextSearch';
import type { Context } from '../../types/context';

const mockContexts: Context[] = [
  {
    id: '1',
    user_id: 'user1',
    title: 'Client Profile: Tech Startup',
    description: 'Profile for technology startup clients',
    category: 'client_profiles',
    content: 'A fast-growing technology startup focused on AI solutions.',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
  {
    id: '2',
    user_id: 'user1',
    title: 'Product Info: SaaS Platform',
    description: 'Information about our SaaS platform',
    category: 'product_service_info',
    content: 'A comprehensive software-as-a-service platform for project management.',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
  {
    id: '3',
    user_id: 'user1',
    title: 'Marketing Campaign Context',
    description: 'Context for marketing campaigns',
    category: 'brand_voice_guidelines',
    content: 'Our brand voice is friendly, professional, and innovative.',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
];

describe('useContextSearch', () => {
  it('should return all contexts when no search term or category filter', () => {
    const { result } = renderHook(() =>
      useContextSearch({
        contexts: mockContexts,
        searchTerm: '',
        selectedCategory: undefined,
      })
    );

    expect(result.current.filteredContexts).toHaveLength(3);
    expect(result.current.searchStats.filtered).toBe(3);
    expect(result.current.searchStats.total).toBe(3);
    expect(result.current.searchStats.hasActiveFilters).toBe(false);
  });

  it('should filter contexts by search term in title', () => {
    const { result } = renderHook(() =>
      useContextSearch({
        contexts: mockContexts,
        searchTerm: 'tech',
        selectedCategory: undefined,
      })
    );

    expect(result.current.filteredContexts).toHaveLength(1);
    expect(result.current.filteredContexts[0].title).toContain('Tech');
    expect(result.current.searchStats.hasActiveFilters).toBe(true);
  });

  it('should filter contexts by search term in content', () => {
    const { result } = renderHook(() =>
      useContextSearch({
        contexts: mockContexts,
        searchTerm: 'software',
        selectedCategory: undefined,
      })
    );

    expect(result.current.filteredContexts).toHaveLength(1);
    expect(result.current.filteredContexts[0].content).toContain('software');
  });

  it('should filter contexts by category', () => {
    const { result } = renderHook(() =>
      useContextSearch({
        contexts: mockContexts,
        searchTerm: '',
        selectedCategory: 'client_profiles',
      })
    );

    expect(result.current.filteredContexts).toHaveLength(1);
    expect(result.current.filteredContexts[0].category).toBe('client_profiles');
    expect(result.current.searchStats.hasActiveFilters).toBe(true);
  });

  it('should combine search term and category filters', () => {
    const { result } = renderHook(() =>
      useContextSearch({
        contexts: mockContexts,
        searchTerm: 'platform',
        selectedCategory: 'product_service_info',
      })
    );

    expect(result.current.filteredContexts).toHaveLength(1);
    expect(result.current.filteredContexts[0].category).toBe('product_service_info');
    expect(result.current.filteredContexts[0].content).toContain('platform');
  });

  it('should return empty results when no matches found', () => {
    const { result } = renderHook(() =>
      useContextSearch({
        contexts: mockContexts,
        searchTerm: 'nonexistent',
        selectedCategory: undefined,
      })
    );

    expect(result.current.filteredContexts).toHaveLength(0);
    expect(result.current.searchStats.filtered).toBe(0);
    expect(result.current.searchStats.total).toBe(3);
    expect(result.current.searchStats.hasActiveFilters).toBe(true);
  });

  it('should be case insensitive', () => {
    const { result } = renderHook(() =>
      useContextSearch({
        contexts: mockContexts,
        searchTerm: 'TECH',
        selectedCategory: undefined,
      })
    );

    expect(result.current.filteredContexts).toHaveLength(1);
  });

  it('should handle empty contexts array', () => {
    const { result } = renderHook(() =>
      useContextSearch({
        contexts: [],
        searchTerm: 'test',
        selectedCategory: undefined,
      })
    );

    expect(result.current.filteredContexts).toHaveLength(0);
    expect(result.current.searchStats.total).toBe(0);
  });
});