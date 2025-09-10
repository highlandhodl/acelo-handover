# Acelo Architecture

## Overview

Acelo is an AI-powered revenue operations platform built with React, TypeScript, and Supabase. The application follows a feature-based architecture with clear separation of concerns between UI components, business logic, and data management.

## Technology Stack

### Frontend
- **React 18** - UI library with hooks and functional components
- **TypeScript** - Type safety and developer experience
- **Vite** - Fast development build tool
- **Tailwind CSS** - Utility-first styling
- **shadcn/ui** - Pre-built UI component library

### Backend & Data
- **Supabase** - Backend-as-a-Service providing:
  - PostgreSQL database with Row Level Security (RLS)
  - Authentication and user management
  - Real-time subscriptions
  - Edge Functions for serverless compute
  - File storage

### State Management
- **TanStack Query** - Server state management and caching
- **React Context** - Global client state (auth, theme)
- **React Hook Form** - Form state management
- **localStorage** - Persistent client state

## Folder Structure

```
src/
├── components/          # UI components organized by feature
│   ├── assets/         # Asset management components
│   ├── automations/    # Automation workflow components
│   ├── coaches/        # AI coach components
│   ├── contexts/       # Context/prompt management components
│   ├── navigation/     # Navigation and layout components
│   ├── prompts/        # Prompt library components
│   ├── theme/          # Theme management components
│   └── ui/             # Reusable UI primitives (shadcn/ui)
├── hooks/              # Custom React hooks organized by feature
│   ├── assets/         # Asset management hooks
│   ├── auth/           # Authentication hooks
│   ├── automations/    # Automation hooks
│   ├── coaches/        # Coach management hooks
│   ├── contexts/       # Context management hooks
│   ├── dashboard/      # Dashboard data hooks
│   ├── navigation/     # Navigation hooks
│   ├── prompts/        # Prompt management hooks
│   ├── theme/          # Theme hooks
│   └── ui/             # UI-related hooks
├── context/            # React context providers
├── lib/                # Utility functions and configurations
├── pages/              # Page components
├── types/              # TypeScript type definitions
├── test/               # Test utilities and mocks
└── utils/              # Pure utility functions
```

## Architectural Patterns

### 1. Hook-Based Data Layer

All business logic and data fetching is encapsulated in custom hooks following these patterns:

#### Query Hooks (`useGet*`)
- Handle data fetching from Supabase
- Use TanStack Query for caching and synchronization
- Include loading states and error handling
- Enable/disable based on auth state

```typescript
export const useGetPrompts = () => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['prompts', user?.id],
    queryFn: async () => { /* fetch logic */ },
    enabled: !!user,
  });
};
```

#### Mutation Hooks (`useCreate*`, `useUpdate*`, `useDelete*`)
- Handle data mutations
- Invalidate relevant queries on success
- Include optimistic updates where appropriate
- Provide loading and error states

```typescript
export const useCreatePrompt = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data) => { /* mutation logic */ },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['prompts'] });
    },
  });
};
```

### 2. Component Architecture

#### Pure UI Components
Components focus solely on presentation and user interaction:
- Receive all data via props
- Use hooks for local UI state only
- Delegate business logic to custom hooks
- Follow shadcn/ui patterns for consistency

#### Feature Components
Combine UI components with data hooks:
- Use data hooks to fetch/mutate data
- Handle loading and error states
- Pass data down to pure UI components

### 3. Type Safety

- All Supabase database types are auto-generated
- Custom types defined in `src/types/` by feature
- Strict TypeScript configuration
- Runtime validation with Zod where needed

### 4. Authentication & Authorization

- Supabase Auth handles user authentication
- Row Level Security (RLS) policies on all user data tables
- Auth context provides user state throughout app
- Protected routes via React Router

### 5. Error Handling

- Global error boundaries for React errors
- TanStack Query error handling for API errors
- Toast notifications for user feedback
- Structured error logging

## Data Flow

1. **User Interaction** → Component event handlers
2. **Component** → Custom hook for data operations
3. **Hook** → Supabase client for API calls
4. **Supabase** → Database operations with RLS
5. **Response** → TanStack Query caching and UI updates
6. **UI Update** → React re-renders with new data

## Security Considerations

### Database Security
- All tables have Row Level Security (RLS) enabled
- Users can only access their own data
- Sensitive operations use Supabase Edge Functions

### API Security
- OpenAI API key stored in Edge Functions only
- Environment variables for all sensitive data
- HTTPS-only communication

### Client Security
- No sensitive data stored in localStorage
- Secure token storage via Supabase Auth
- Input validation and sanitization

## Performance Optimizations

- Code splitting with React.lazy()
- TanStack Query caching reduces API calls
- Optimistic updates for better UX
- Image optimization and lazy loading
- Bundle analysis and tree shaking

## Testing Strategy

- Unit tests for all custom hooks
- Integration tests for critical user flows
- Component testing with React Testing Library
- Coverage requirements: 85% overall, 90% for hooks

## Deployment

- Vercel hosting with automatic deployments
- Supabase managed database and functions
- Environment-specific configurations
- CI/CD with GitHub Actions

## Future Considerations

- Offline support with service workers
- Real-time collaboration features
- Advanced analytics and reporting
- Multi-tenant architecture support