import { render, screen } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter } from 'react-router-dom'
import { describe, it, expect, vi } from 'vitest'
import Index from './Index'

const createWrapper = ({ children }: { children: React.ReactNode }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  })
  
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        {children}
      </BrowserRouter>
    </QueryClientProvider>
  )
}

// Mock the dashboard hook
const mockUseGetDashboardStats = vi.fn()
vi.mock('../hooks/dashboard/useGetDashboardStats', () => ({
  useGetDashboardStats: () => mockUseGetDashboardStats(),
}))

describe('Index Page', () => {
  it('should render dashboard content', () => {
    mockUseGetDashboardStats.mockReturnValue({
      data: { prompts: 5, automations: 3, coaches: 2, totalRuns: 10 },
      isLoading: false,
    })
    
    render(<Index />, { wrapper: createWrapper })
    
    expect(screen.getByText('Dashboard')).toBeInTheDocument()
    expect(screen.getByText('Quick Access')).toBeInTheDocument()
    expect(screen.getByText('Prompt Library')).toBeInTheDocument()
    expect(screen.getByText('Asset Hub')).toBeInTheDocument()
  })
  
  it('should show loading state', () => {
    mockUseGetDashboardStats.mockReturnValue({
      data: undefined,
      isLoading: true,
    })
    
    render(<Index />, { wrapper: createWrapper })
    
    expect(screen.getByText('Dashboard')).toBeInTheDocument()
  })
})