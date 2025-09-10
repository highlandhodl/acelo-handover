# Development Guide - The Development Constitution v2.1

This document contains the mandatory, non-negotiable rules for developing on the Acelo project. You **MUST** follow these guidelines in every task. This is your primary instruction set.

---

## 📜 The Golden Rules

These four rules are the foundation of all development. They are critical and must not be violated.

1.  **Simple, Flat Folder Structure**: You **MUST** group files by function, not by feature. For a feature named 'profile', create `src/components/profile/`, `src/hooks/profile/`, and `src/types/profile.ts`. **NEVER** create nested feature folders like `src/features/profile/components/`.
2.  **Relative Imports Only**: All imports **MUST** be relative (e.g., `../hooks/auth/useAuth`). **NEVER** use absolute or aliased paths (e.g., `@/hooks/auth/useAuth`).
3.  **Separate Logic and UI**: All business logic, state management, and data fetching **MUST** be in hooks (`src/hooks/`). Components (`src/components/`) are for UI and user interaction ONLY.
4.  **Security First**: All database tables containing user data **MUST** have Row Level Security (RLS) policies enabled. Sensitive API keys (like OpenAI) **MUST** only be used in Supabase Edge Functions.

---

## 🏗️ Architecture & Code Patterns

### 1. Technology Stack

You **MUST** use the established technology stack. Do not introduce new libraries without explicit instruction.

| Category             | Technology       | Purpose                |
| -------------------- | ---------------- | ---------------------- |
| **Framework** | React 18         | UI library             |
| **Language** | TypeScript       | Type safety            |
| **Build Tool** | Vite             | Dev & build            |
| **UI Components** | shadcn/ui        | Component primitives   |
| **Styling** | Tailwind CSS     | Utility-first CSS      |
| **Server State** | TanStack Query   | Data fetching & cache  |
| **Backend** | Supabase         | Auth, DB, Storage, Edge Functions |
| **Routing** | React Router DOM | Client-side routing    |

### 2. State Management Strategy

-   **Server State (from Supabase)**: **MUST** use TanStack Query (`useQuery`, `useMutation`).
-   **Client State (UI state)**: **MUST** use React Hooks (`useState`, `useContext`).
-   **Form State**: **MUST** use React Hook Form.
-   **Persistent Client State (e.g., theme)**: **MUST** use `localStorage` managed via a TanStack Query hook (see `useTheme.ts` pattern).

### 3. Hook Implementation Pattern

All data-fetching hooks **MUST** follow the patterns established in `docs/examples/gold_standard_hook.md`.

#### **Query Hook (`useGet*`)**

```typescript
// src/hooks/[feature]/useGet[Entity].ts
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../../lib/supabaseClient';
import { useAuth } from '../../context/AuthContext';
import type { Entity } from '../../types/[feature]';

export const useGet[Entity]s = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['[entity]s', user?.id],
    queryFn: async (): Promise<Entity[]> => {
      const { data, error } = await supabase
        .from('[entity]s')
        .select('*')
        .eq('user_id', user!.id);

      if (error) throw error;
      return data || [];
    },
    enabled: !!user, // CRITICAL: Only run if user exists
  });
};
````

#### **Mutation Hook (`useCreate*`, `useUpdate*`, `useDelete*`)**

```typescript
// src/hooks/[feature]/useCreate[Entity].ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../lib/supabaseClient';
// ... other imports

export const useCreate[Entity] = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (newEntity: EntityFormData) => {
      const { data, error } = await supabase
        .from('[entity]s')
        .insert(newEntity)
        .select()
        .single();
        
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      // CRITICAL: Invalidate queries to refetch data and update the UI.
      queryClient.invalidateQueries({ queryKey: ['[entity]s'] });
    },
  });
};
```

### 4\. File Naming and Structure

  - **Components**: `src/components/[feature]/[ComponentName].tsx` (PascalCase)
  - **Hooks**: `src/hooks/[feature]/use[ActionName].ts` (camelCase)
  - **Types**: `src/types/[feature].ts` (camelCase)
  - **Pages**: `src/pages/[PageName]Page.tsx` (PascalCase)

-----

## ✅ Quality & Validation

### 1\. Validation Commands

Before concluding a task, you **MUST** run these commands and fix all resulting errors.

```bash
# 1. Check for linting and style errors
npm run lint

# 2. Check for TypeScript and build errors
npm run build
```

### 2\. Code Review Checklist

Ensure your changes meet these criteria:

  - [ ] Adheres to all 4 **Golden Rules**.
  - [ ] All new hooks and utils have corresponding tests.
  - [ ] Error handling and loading states are properly implemented.
  - [ ] No `any` types are used; all types are defined in `src/types/`.
  - [ ] No hardcoded strings that should be variables.
  - [ ] Follows the DRY (Don't Repeat Yourself) principle.

-----

*This document is the single source of truth for development standards. Adherence is mandatory.*