# Project Task Manager - Acelo Backend Feature Example

This file provides a complete example of a standard backend feature built with the Acelo framework. It includes the database schema, TypeScript types, React hooks, a UI component, and a Supabase Edge Function for business logic.

---

### 1. Database Schema

A new `tasks` table is required to store project tasks.

```sql
-- FILE: supabase/migrations/20250906081000_create_tasks.sql

CREATE TABLE public.tasks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    project_id UUID NOT NULL, -- Assumes a 'projects' table exists
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    
    title TEXT NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'todo' NOT NULL, -- e.g., 'todo', 'in_progress', 'done'
    priority TEXT DEFAULT 'medium', -- e.g., 'low', 'medium', 'high'
    due_date TIMESTAMPTZ,

    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- RLS Policies are MANDATORY
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own tasks"
ON public.tasks FOR ALL
USING (auth.uid() = user_id);
````

-----

### 2\. TypeScript Types

The corresponding types for the application.

```typescript
// FILE: src/types/task.ts

export type TaskStatus = 'todo' | 'in_progress' | 'done';
export type TaskPriority = 'low' | 'medium' | 'high';

export interface Task {
  id: string;
  project_id: string;
  user_id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  due_date: string | null;
  created_at: string;
  updated_at: string;
}
```

-----

### 3\. React Hooks (Business Logic)

Hooks encapsulate all interaction with the Supabase backend.

```typescript
// FILE: src/hooks/tasks/useGetTask.ts
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../../lib/supabaseClient';
import type { Task } from '../../types/task';

export const useGetTask = (taskId: string) => {
  return useQuery({
    queryKey: ['task', taskId],
    queryFn: async (): Promise<Task> => {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('id', taskId)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!taskId,
  });
};


// FILE: src/hooks/tasks/useUpdateTaskStatus.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../lib/supabaseClient';
import type { TaskStatus } from '../../types/task';

export const useUpdateTaskStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ taskId, status }: { taskId: string, status: TaskStatus }) => {
      const { data, error } = await supabase.functions.invoke('update-task-status', {
        body: { task_id: taskId, new_status: status },
      });
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      // Invalidate the specific task and the list of tasks
      queryClient.invalidateQueries({ queryKey: ['task', data.id] });
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });
};
```

-----

### 4\. UI Component

A simple card to display the task information.

```typescript
// FILE: src/components/tasks/TaskCard.tsx
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { useGetTask } from '../../hooks/tasks/useGetTask';

interface TaskCardProps {
  taskId: string;
}

export const TaskCard = ({ taskId }: TaskCardProps) => {
  const { data: task, isLoading } = useGetTask(taskId);

  if (isLoading) return <div>Loading Task...</div>;
  if (!task) return <div>Task not found.</div>;

  return (
    <Card>
      <CardHeader>
        <CardTitle>{task.title}</CardTitle>
      </CardHeader>
      <CardContent className="space-x-2">
        <Badge variant="outline">{task.status}</Badge>
        <Badge>{task.priority}</Badge>
      </CardContent>
    </Card>
  );
};
```

-----

### 5\. Supabase Edge Function (Backend Logic)

An Edge Function to handle the logic of updating a task's status securely on the backend.

```typescript
// FILE: supabase/functions/update-task-status/index.ts
import { createClient } from '@supabase/supabase-js'
import { corsHeaders } from '../_shared/cors.ts'

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { task_id, new_status } = await req.json();

    // Create a Supabase client with the user's auth token
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    );

    // Update the task in the database
    // RLS policy ensures the user can only update their own tasks
    const { data, error } = await supabaseClient
      .from('tasks')
      .update({ status: new_status, updated_at: new Date().toISOString() })
      .eq('id', task_id)
      .select()
      .single();

    if (error) throw error;

    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
```

