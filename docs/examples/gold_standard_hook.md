# Gold Standard Hook Example

This file demonstrates the "gold standard" example for creating a custom React hook that fetches data.

It correctly demonstrates our current patterns that are **compliant with our development standards**:
1. Wrapping `useQuery` from TanStack Query
2. Using our shared `supabaseClient` with relative imports
3. Accessing user context via the `useAuth` hook
4. Setting a unique `queryKey` for caching
5. Using the `enabled` flag to prevent the query from running without a user
6. Handling real-time updates with Supabase subscriptions
7. Following our development conventions (relative imports, proper file structure)
8. This pattern is used by ALL existing features and MUST be used for all new features

## Query Hook Pattern (useGet*)

```typescript
// File: src/hooks/notifications/useGetNotifications.ts

import { supabase } from '../../lib/supabaseClient'
import { useAuth } from '../auth/useAuth'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect } from 'react'
import type { Notification } from '../../types/notification'

export const useGetNotifications = () => {
  const { user } = useAuth()
  const queryClient = useQueryClient()

  async function fetchNotifications(): Promise<Notification[]> {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', user?.id)
      .order('created_at', { ascending: false })

    if (error) throw error

    return data as Notification[]
  }

  // Real-time subscriptions for live updates
  useEffect(() => {
    if (!user) return

    const eventsChannel = supabase
      .channel('notifications-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          queryClient.setQueryData<Notification[]>(['notifications'], (oldData = []) => {
            return [payload.new as Notification, ...oldData]
          })
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          queryClient.setQueryData<Notification[]>(['notifications'], (oldData = []) => {
            return oldData.map((notification) =>
              notification.id === payload.new.id ? (payload.new as Notification) : notification
            )
          })
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'notifications',
        },
        (payload) => {
          queryClient.setQueryData<Notification[]>(['notifications'], (oldData = []) => {
            return oldData.filter((notification) => notification.id !== payload.old.id)
          })
        }
      )
      .subscribe()

    // Cleanup subscriptions
    return () => {
      supabase.removeChannel(eventsChannel)
    }
  }, [user, queryClient])

  return useQuery({
    queryKey: ['notifications', user?.id],
    queryFn: fetchNotifications,
    enabled: !!user,
  })
}
```

## Mutation Hook Pattern (use*Action)

```typescript
// File: src/hooks/assethub/useUploadAsset.ts

import { supabase } from '../../lib/supabaseClient'
import { useAuth } from '../auth/useAuth'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'react-toastify'
import type { Asset } from '../../types/asset'

interface UploadAssetData {
  file: File
  title: string
  description: string
  tags: string[]
}

export const useUploadAsset = () => {
  const { user } = useAuth()
  const queryClient = useQueryClient()

  async function uploadAsset(data: UploadAssetData): Promise<Asset> {
    if (!user) throw new Error('User must be authenticated')

    // Step 1: Upload file to Supabase Storage
    const fileExt = data.file.name.split('.').pop()
    const fileName = `${Date.now()}.${fileExt}`
    const filePath = `public/${user.id}/${fileName}`

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('assets')
      .upload(filePath, data.file)

    if (uploadError) throw uploadError

    // Step 2: Save metadata to database
    const { data: assetData, error: dbError } = await supabase
      .from('assets')
      .insert({
        user_id: user.id,
        title: data.title,
        description: data.description,
        file_path: uploadData.path,
        file_type: data.file.type,
        tags: data.tags,
      })
      .select()
      .single()

    if (dbError) throw dbError

    return assetData as Asset
  }

  return useMutation({
    mutationFn: uploadAsset,
    onSuccess: () => {
      // Invalidate and refetch assets
      queryClient.invalidateQueries({ queryKey: ['assets'] })
      toast.success('Asset uploaded successfully!')
    },
    onError: (error) => {
      console.error('Upload error:', error)
      toast.error('Failed to upload asset')
    },
  })
}
```

## Key Patterns to Follow

### 1. File Organization
- Query hooks: `src/hooks/[feature]/useGet[Entity].ts`
- Mutation hooks: `src/hooks/[feature]/use[Action][Entity].ts`
- Use relative imports only (no @/ aliases)

### 2. Import Order
```typescript
// External libraries first
import { supabase } from '../../lib/supabaseClient'
import { useAuth } from '../auth/useAuth'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

// React imports
import { useEffect } from 'react'

// Type imports last
import type { Asset } from '../../types/asset'
```

### 3. Query Keys
- Use descriptive, hierarchical keys: `['assets', user?.id]`
- Include user ID for user-scoped data
- Keep keys consistent across related hooks

### 4. Error Handling
- Always handle Supabase errors
- Provide user-friendly error messages
- Use toast notifications for user feedback
- Log errors for debugging

### 5. Real-time Updates
- Set up subscriptions in useEffect
- Filter subscriptions by user_id
- Update query cache directly for performance
- Always clean up subscriptions

### 6. TypeScript
- Define proper return types for async functions
- Use type assertions carefully (prefer type guards)
- Import types separately from values
- Keep types in src/types/ directory

### 7. Performance
- Use `enabled` flag to prevent unnecessary queries
- Invalidate queries efficiently after mutations
- Use optimistic updates when appropriate
- Clean up subscriptions properly

This pattern ensures consistent, maintainable, and performant data fetching throughout the application.