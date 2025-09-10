# React State Management Best Practices

This document outlines the standard procedures for managing state in our React application. All new features **MUST** adhere to these principles to ensure consistency, performance, and maintainability.

---
## 1. The Core Principle: Server State vs. Client State

The most critical concept to understand is the separation of **Server State** and **Client State**. They are fundamentally different and must be managed with different tools.

| State Type     | Description                                                                 | Examples                                     | How We Manage It                 |
| :------------- | :-------------------------------------------------------------------------- | :------------------------------------------- | :------------------------------- |
| **Server State** | Data that lives on our backend (Supabase). It's asynchronous and can become stale. | User profile, list of tasks, stored files    | **TanStack Query (React Query)** |
| **Client State** | Data that lives exclusively in the browser. It's synchronous and owned by the UI. | Is a modal open? Text in an input field, theme toggle | **Standard React Hooks (`useState`)** |

---
## 2. Managing Server State with TanStack Query

All data that comes from or is sent to Supabase **MUST** be managed with TanStack Query.

**Why:** It automatically handles caching, background refetching, loading states, and error states. Manually handling this with `useState` and `useEffect` is strictly forbidden as it leads to bugs and excessive boilerplate.

### The Standard Pattern: Custom Hooks in `src/hooks/`
We encapsulate all TanStack Query logic within custom hooks. Components should never contain raw data-fetching logic.

#### For **Reading Data** (`useQuery`)
Use `useQuery` for fetching data. The hook must return the query result directly.

**Gold Standard Example (based on `useGetTasks.tsx`):**
```typescript
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../../lib/supabaseClient';
import { useAuth } from './useAuth';

export const useGetTasks = () => {
  const { user } = useAuth();

  const fetchTasks = async () => {
    // The actual data fetching logic
    const { data, error } = await supabase
      .from("tasks")
      .select("*")
      .eq("user_id", user!.id);
    
    if (error) throw error;
    return data;
  };

  return useQuery({
    queryKey: ['tasks'],      // A unique key for this data
    queryFn: fetchTasks,      // The function that fetches the data
    enabled: !!user,          // CRITICAL: Only run the query if the user is logged in
  });
};
````

#### For **Writing Data** (`useMutation`)

Use `useMutation` for creating, updating, or deleting data.

**CRITICAL:** After a successful mutation, you **MUST** invalidate the relevant queries to ensure the UI updates with fresh data from the server.

**Gold Standard Example (based on `useAddTask.tsx`):**

```typescript
import { useMutation, useQueryClient } from '@tanstack/react-query';
// ... other imports

export const useAddTask = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient(); // Get the query client instance

  const addTask = async (newText: string) => {
    // The actual mutation logic
    const { error } = await supabase
      .from("tasks")
      .insert([{ text: newText, user_id: user.id }]);
    if (error) throw error;
  };

  return useMutation({
    mutationFn: addTask,
    onSuccess: () => {
      // CRITICAL: This refetches the 'tasks' query so the UI updates.
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
    onError: (err) => {
      console.error(err);
      // Logic for showing an error toast to the user would go here.
    },
  });
};
```

-----

## 3\. What NOT To Do (Anti-Patterns)

To maintain a clean and reliable codebase, the following patterns are strictly forbidden:

  - **DO NOT** use `useEffect` to fetch data from Supabase.
  - **DO NOT** store server data directly in `useState` (e.g., `const [tasks, setTasks] = useState([])`). This creates stale data and ignores all the benefits of TanStack Query.