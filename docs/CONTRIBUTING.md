# Contributing to Acelo

Thank you for your interest in contributing to Acelo! This guide will help you understand our development process and how to contribute effectively.

## Development Setup

### Prerequisites
- Node.js 18+ 
- npm 9+
- Git
- Supabase account (for backend development)

### Local Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/acelo/revops-hub.git
   cd revops-hub
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your Supabase credentials
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

## Development Workflow

### 1. Development Standards (Required)

All feature development **MUST** follow our established development standards:

1. **Planning**: Create clear requirements and implementation plan
2. **Implementation**: Follow the patterns outlined in [Development Guide](./DEVELOPMENT.md)
3. **Testing**: Ensure comprehensive test coverage
4. **Documentation**: Update relevant documentation

See the [Development Guide](./DEVELOPMENT.md) for detailed process information.

### 2. Branch Strategy

- `main` - Production branch
- `develop` - Integration branch  
- `feature/*` - Feature branches
- `fix/*` - Bug fix branches

### 3. Code Architecture Rules

These rules are **non-negotiable**:

#### Golden Rules
1. **Simple, Flat Folder Structure**: Group files by function, not feature
2. **Relative Imports Only**: Never use absolute or aliased paths
3. **Separate Logic and UI**: Business logic in hooks, UI in components
4. **Security First**: RLS policies on all user data tables
5. **Development Standards**: All features must follow established patterns

#### File Organization
```
src/
├── components/[feature]/     # UI components
├── hooks/[feature]/         # Business logic hooks
├── types/[feature].ts       # TypeScript types
└── pages/[Feature]Page.tsx  # Page components
```

#### Hook Patterns
- **Query hooks**: `useGet[Entity]s()` for data fetching
- **Mutation hooks**: `useCreate[Entity]()`, `useUpdate[Entity]()`, `useDelete[Entity]()`
- **TanStack Query**: Required for all server state
- **Error handling**: Include loading and error states

## Code Standards

### TypeScript
- Strict TypeScript configuration
- No `any` types allowed
- All types defined in `src/types/`
- Runtime validation with Zod where needed

### React Patterns
- Functional components only
- Hooks for all state management
- React Hook Form for forms
- Context for global state (auth, theme)

### Styling
- Tailwind CSS utility classes
- shadcn/ui components for consistency
- No custom CSS unless absolutely necessary
- Responsive design first

### Testing Requirements
- **Unit tests** for all custom hooks
- **Integration tests** for critical flows
- **Component tests** with React Testing Library
- **Coverage targets**: 85% overall, 90% for hooks

### Code Quality
Before submitting, ensure:
```bash
# Linting passes
npm run lint

# TypeScript compilation succeeds
npm run build

# All tests pass
npm run test:run

# Coverage meets requirements
npm run test:coverage
```

## Commit Guidelines

### Commit Message Format
```
type(scope): description

[optional body]

[optional footer]
```

**Types:**
- `feat` - New feature
- `fix` - Bug fix
- `docs` - Documentation changes
- `style` - Code style changes
- `refactor` - Code refactoring
- `test` - Adding or updating tests
- `chore` - Maintenance tasks

**Examples:**
```
feat(prompts): add prompt categorization
fix(auth): resolve token refresh issue
docs(api): update authentication section
```

### Commit Requirements
- All commits must pass CI checks
- Include tests for new features
- Update documentation as needed
- Follow the 5 Golden Rules

## Pull Request Process

### Before Submitting

1. **Follow development standards** for features
2. **Run quality checks**:
   ```bash
   npm run lint
   npm run build  
   npm run test:run
   npm run test:coverage
   ```
3. **Update documentation** if needed
4. **Test thoroughly** in your local environment

### PR Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature  
- [ ] Breaking change
- [ ] Documentation update

## Development Standards Compliance
- [ ] Feature follows development standards
- [ ] Documentation updated appropriately

## Testing
- [ ] Unit tests added/updated
- [ ] Integration tests added/updated
- [ ] Manual testing completed

## Checklist
- [ ] Code follows Golden Rules
- [ ] All tests pass
- [ ] Lint checks pass
- [ ] Build succeeds
- [ ] Documentation updated
```

### Review Process

1. **Automated checks** must pass
2. **Code review** by maintainers
3. **Development standards** verification
4. **Test coverage** validation
5. **Manual testing** if needed

## Database Changes

### Migration Process
1. Create migration files in `supabase/migrations/`
2. Include both up and down migrations
3. Test migrations locally
4. Update TypeScript types
5. Add RLS policies for new tables

### RLS Policy Requirements
All user data tables must have:
```sql
-- Enable RLS
ALTER TABLE table_name ENABLE ROW LEVEL SECURITY;

-- User can only access their own data
CREATE POLICY "Users can only access their own data" ON table_name
  FOR ALL USING (auth.uid() = user_id);
```

## Testing Guidelines

### Hook Testing Pattern
```typescript
import { renderHook, waitFor } from '@testing-library/react';
import { createTestQueryClient, TestWrapper } from '../../test/utils';

describe('useGetPrompts', () => {
  it('should fetch prompts successfully', async () => {
    const { result } = renderHook(() => useGetPrompts(), {
      wrapper: TestWrapper,
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });
  });
});
```

### Component Testing Pattern
```typescript
import { render, screen } from '@testing-library/react';
import { TestWrapper } from '../../test/utils';
import { PromptList } from './PromptList';

describe('PromptList', () => {
  it('should render prompt list', () => {
    render(<PromptList />, { wrapper: TestWrapper });
    
    expect(screen.getByText('Prompts')).toBeInTheDocument();
  });
});
```

## Documentation Standards

### Code Documentation
- JSDoc comments for all public functions
- Inline comments for complex logic
- README updates for new features
- API documentation for new endpoints

### JSDoc Format
```typescript
/**
 * Custom hook for managing user prompts
 * @returns Query object with prompts data, loading, and error states
 * @example
 * ```tsx
 * const { data: prompts, isLoading, error } = useGetPrompts();
 * ```
 */
export const useGetPrompts = () => {
  // Implementation
};
```

## Security Guidelines

### Client-Side Security
- Never expose sensitive API keys
- Validate all user inputs
- Use HTTPS only
- Implement proper error handling

### Database Security
- All tables must have RLS policies
- Use service role key only in Edge Functions
- Validate inputs in database functions
- Audit sensitive operations

### Authentication
- Use Supabase Auth for all authentication
- Implement proper session management
- Handle auth state changes properly
- Redirect unauthenticated users

## Performance Guidelines

### Code Splitting
```typescript
// Lazy load heavy components
const HeavyComponent = lazy(() => import('./HeavyComponent'));
```

### Query Optimization
```typescript
// Use specific selectors
.select('id, title, created_at')

// Implement pagination
.range(start, end)

// Use indexes for common queries
```

### Bundle Optimization
- Tree shaking enabled
- Dynamic imports for large dependencies
- Image optimization
- Minimize bundle size

## Common Issues

### Environment Variables
- Ensure all required vars are set
- Use VITE_ prefix for client-side vars
- Never commit .env files

### Import Errors
- Use relative imports only
- Check file extensions
- Verify export/import names

### Type Errors
- Regenerate types after schema changes: `supabase gen types typescript`
- Check for strict TypeScript compliance
- Use proper type assertions

### Test Failures
- Check test environment setup
- Verify mock data
- Ensure async operations complete

## Getting Help

### Resources
- [Architecture Documentation](./ARCHITECTURE.md)
- [API Documentation](./API.md) 
- [Development Guide](./DEVELOPMENT.md)
- [Gold Standard Hook Example](./examples/gold_standard_hook.md)

### Communication
- GitHub Issues for bugs and feature requests
- GitHub Discussions for questions
- Pull Request comments for code review
- Direct contact: [stuart@acelo.ai](mailto:stuart@acelo.ai) for additional support

### Code Review
- Be respectful and constructive
- Focus on code quality and architecture
- Suggest improvements with examples
- Ask questions to understand intent

Thank you for contributing to Acelo! 🚀