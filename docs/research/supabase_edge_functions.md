# Supabase Edge Functions: Best Practices

This document contains the mandatory rules and patterns for developing Supabase Edge Functions in this project. All functions **MUST** adhere to these guidelines.

---
## 1. Foundational Principles
- **Deno Runtime:** Our functions run on Deno. This means they are secure by default and have first-class TypeScript support. We **MUST** use modern Web APIs like `fetch` for HTTP requests.
- **"Fat Function" Architecture:** To optimize performance and reduce "cold starts," we prefer to group related logic into a single function. For example, a `user-profile` function might handle `GET`, `POST`, and `DELETE` requests internally using a routing mechanism, rather than having three separate functions.
- **Shared Code:** Reusable code (like CORS handlers or a shared Supabase client) **MUST** be placed in a `supabase/functions/_shared/` directory.

---
## 2. The Golden Rule: Secure, User-Contextual Supabase Client
This is the most critical security pattern. To ensure all database operations respect Row Level Security (RLS), you **MUST** create a new Supabase client instance for each request, passing the user's authentication token.

**NEVER** use the `service_role` key for user-facing operations.

**Mandatory Code Pattern:**
```typescript
// All Edge Functions that interact with Supabase MUST use this pattern.

import { createClient } from 'npm:@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

Deno.serve(async (req) => {
  // 1. Create a Supabase client FOR THIS REQUEST
  const supabaseClient = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_PUBLISHABLE_KEY')!,
    {
      global: {
        // 2. Pass the user's Authorization header to the client
        headers: { Authorization: req.headers.get('Authorization')! },
      },
    }
  )

  // 3. Now, any call using this client will enforce the user's RLS policies
  const { data, error } = await supabaseClient.from('profiles').select('*')

  if (error) {
    throw error
  }

  return new Response(JSON.stringify({ data }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    status: 200,
  })
})
````

-----

## 3\. CRITICAL: Database Connection Pooling

Serverless functions can quickly exhaust database connections. To prevent this, Supabase provides the **Supavisor connection pooler**.

  - Your Supabase project settings **MUST** be configured to use the "Transaction" mode connection pooler for Edge Functions.
  - The `SUPABASE_DB_URL` environment variable used by the function should be the pooler's connection string (using port `6543`). The `supabase-js` client will use this automatically.
  - **Direct database connections are forbidden** in production environments as they will lead to instability.

-----

## 4\. Handling Secrets & Environment Variables

  - **Local Development:** Secrets are stored in `supabase/functions/.env`. This file **MUST** be in your `.gitignore`.
  - **Production:** Secrets **MUST** be set using the Supabase Dashboard or the `supabase secrets set` CLI command.
  - **Access in Code:** Use `Deno.env.get("YOUR_SECRET_NAME")` to access secrets.

-----

## 5\. Public Webhooks

If a function needs to be called by an external service (like a Stripe webhook) that doesn't provide a Supabase JWT, you must:

1.  Deploy the function with the `--no-verify-jwt` flag.
2.  **CRITICAL:** You **MUST** implement another form of security, such as verifying a webhook signature, to protect the endpoint. An unprotected public endpoint is a major security risk.
