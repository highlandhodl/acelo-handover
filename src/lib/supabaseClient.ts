import { createClient } from '@supabase/supabase-js'
import type { Database } from './supabase-types'

const SUPABASE_URL = (
  import.meta.env.VITE_SUPABASE_URL ??
  import.meta.env.VITE_PUBLIC_SUPABASE_URL
) as string | undefined
const SUPABASE_PUBLISHABLE_KEY = (
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ??
  import.meta.env.VITE_SUPABASE_ANON_KEY ??
  import.meta.env.VITE_PUBLIC_SUPABASE_ANON_KEY
) as string | undefined

const missingEnvMessage = 'Missing Supabase environment variables. Expected one of: VITE_SUPABASE_URL or VITE_PUBLIC_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY or VITE_SUPABASE_ANON_KEY or VITE_PUBLIC_SUPABASE_ANON_KEY. Ensure they are defined in .env/.env.local and restart the dev server.'

export const supabase = (SUPABASE_URL && SUPABASE_PUBLISHABLE_KEY)
  ? createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
      auth: {
        storage: localStorage,
        persistSession: true,
        autoRefreshToken: true,
      }
    })
  : (console.error(missingEnvMessage), new Proxy({}, {
      get() {
        throw new Error(missingEnvMessage)
      }
    }) as unknown as ReturnType<typeof createClient<Database>>)