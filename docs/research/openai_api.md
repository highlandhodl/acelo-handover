# OpenAI API Best Practices & Usage Patterns

This document outlines the standard procedures for using the OpenAI API within this project. All new implementations **MUST** follow these guidelines.

---
## 1. 🛡️ The Golden Rule: Security First
The most important rule is that the **OpenAI API key MUST NEVER be exposed on the client-side**.

- **ALL** calls to the OpenAI API **MUST** be made from a secure backend environment. In our stack, this means all calls go through **Supabase Edge Functions**.
- The API key will be stored as an environment variable in Supabase and accessed within the Edge Function via `Deno.env.get("OPENAI_API_KEY")`.

---
## 2. Authentication
Authentication is handled via a `Bearer` token in the `Authorization` header. The API key is retrieved securely from environment variables on the server.

```typescript
// Inside a Supabase Edge Function
const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");

const headers = {
  "Content-Type": "application/json",
  "Authorization": `Bearer ${OPENAI_API_KEY}`
};
````

-----

## 3\. Standard Edge Function Pattern for OpenAI Calls

Here is the mandatory boilerplate for making a request from a Supabase Edge Function. This pattern includes proper CORS handling, request body parsing, and error management.

**File:** `supabase/functions/my-openai-feature/index.ts`

```typescript
import { corsHeaders } from '../_shared/cors.ts' // CRITICAL: Use shared CORS headers

Deno.serve(async (req) => {
  // 1. Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // 2. Securely get the OpenAI API key from environment variables
    const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
    if (!OPENAI_API_KEY) {
      throw new Error("Missing OPENAI_API_KEY environment variable.");
    }

    // 3. Parse the incoming request body from the client
    const { userPrompt } = await req.json();
    if (!userPrompt) {
      return new Response(JSON.stringify({ error: 'Missing userPrompt in request body' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // 4. Make the request to the OpenAI API
    const response = await fetch("[https://api.openai.com/v1/responses](https://api.openai.com/v1/responses)", {
      method: 'POST',
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-5", // Use the latest appropriate model
        input: userPrompt,
        instructions: "You are a helpful assistant for our application.",
      }),
    });

    // 5. Handle potential errors from the OpenAI API
    if (!response.ok) {
      const errorBody = await response.json();
      console.error("OpenAI API Error:", errorBody);
      throw new Error(`OpenAI API request failed with status ${response.status}`);
    }

    // 6. Return the successful response to the client
    const responseData = await response.json();
    return new Response(
      JSON.stringify(responseData),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    // 7. Return a generic server error response
    console.error(error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
})
```

-----

## 4\. Key Request Parameters

When calling the `/v1/responses` endpoint, these are the most common parameters to use:

  - `model`: **(Required)** The model to use (e.g., `"gpt-5"`, `"gpt-4o"`).
  - `input`: **(Required)** The user's prompt or content for the model.
  - `instructions`: The system prompt. This defines the AI's persona, rules, and goals.
  - `stream`: Set to `true` to receive the response as a stream of events. This is **highly recommended** for chat UIs.
  - `tools` & `tool_choice`: Used for function calling.
  - `temperature`: A value from 0 to 2. Lower values (e.g., `0.2`) are for deterministic tasks; higher values (e.g., `0.8`) are for creative tasks.

-----

## 5\. Error Handling

  - The boilerplate in Section 3 provides the standard `try/catch` block for handling errors.
  - Always return a proper JSON object with an `error` key.
  - For debugging with OpenAI support, log the `x-request-id` from the API response headers when an error occurs.