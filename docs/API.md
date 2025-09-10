# Acelo API Documentation

## Overview

Acelo uses Supabase as its backend, providing a PostgreSQL database with auto-generated REST API, real-time subscriptions, and Edge Functions for server-side logic.

## Authentication

All API requests require authentication via Supabase Auth. The client automatically includes the user's JWT token in requests.

### Authentication Flow
1. User signs in via Supabase Auth
2. Client receives JWT token
3. Token included in all subsequent requests
4. Row Level Security (RLS) policies enforce data access

## Database Schema

### Users Table (`auth.users`)
Managed by Supabase Auth - contains user authentication data.

### Prompts Table (`prompts`)
Stores user's prompt library entries.

```sql
CREATE TABLE prompts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT,
  tags TEXT[],
  is_favorite BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
```

**RLS Policy**: Users can only access their own prompts.

### Contexts Table (`contexts`)
Stores context information for prompts and automations.

```sql
CREATE TABLE contexts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  content TEXT NOT NULL,
  type TEXT DEFAULT 'general',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
```

**RLS Policy**: Users can only access their own contexts.

### Coaches Table (`coaches`)
Stores AI coach configurations.

```sql
CREATE TABLE coaches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  personality TEXT NOT NULL,
  expertise_areas TEXT[],
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
```

**RLS Policy**: Users can only access their own coaches.

### Automations Table (`automations`)
Stores automation workflow definitions.

```sql
CREATE TABLE automations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  workflow_data JSONB NOT NULL,
  is_active BOOLEAN DEFAULT false,
  last_run_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
```

**RLS Policy**: Users can only access their own automations.

### Assets Table (`assets`)
Stores file uploads and asset references.

```sql
CREATE TABLE assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size INTEGER,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
```

**RLS Policy**: Users can only access their own assets.

## REST API Endpoints

### Prompts API

#### GET /rest/v1/prompts
Get all prompts for the authenticated user.

**Query Parameters:**
- `select` - Columns to select
- `order` - Ordering specification
- `limit` - Maximum number of results

**Response:**
```json
[
  {
    "id": "uuid",
    "title": "string",
    "content": "string",
    "category": "string",
    "tags": ["string"],
    "is_favorite": boolean,
    "created_at": "timestamp",
    "updated_at": "timestamp"
  }
]
```

#### POST /rest/v1/prompts
Create a new prompt.

**Request Body:**
```json
{
  "title": "string",
  "content": "string",
  "category": "string",
  "tags": ["string"],
  "is_favorite": boolean
}
```

#### PATCH /rest/v1/prompts?id=eq.{id}
Update an existing prompt.

#### DELETE /rest/v1/prompts?id=eq.{id}
Delete a prompt.

### Contexts API

Similar REST endpoints available for contexts:
- GET /rest/v1/contexts
- POST /rest/v1/contexts
- PATCH /rest/v1/contexts?id=eq.{id}
- DELETE /rest/v1/contexts?id=eq.{id}

### Coaches API

Similar REST endpoints available for coaches:
- GET /rest/v1/coaches
- POST /rest/v1/coaches
- PATCH /rest/v1/coaches?id=eq.{id}
- DELETE /rest/v1/coaches?id=eq.{id}

### Automations API

Similar REST endpoints available for automations:
- GET /rest/v1/automations
- POST /rest/v1/automations
- PATCH /rest/v1/automations?id=eq.{id}
- DELETE /rest/v1/automations?id=eq.{id}

### Assets API

Similar REST endpoints available for assets:
- GET /rest/v1/assets
- POST /rest/v1/assets
- DELETE /rest/v1/assets?id=eq.{id}

## Supabase Edge Functions

### AI Chat Function
**Endpoint:** `/functions/v1/ai-chat`

Handles AI conversations with OpenAI GPT models.

**Request:**
```json
{
  "messages": [
    {
      "role": "user|assistant|system",
      "content": "string"
    }
  ],
  "model": "gpt-4",
  "temperature": 0.7,
  "max_tokens": 1000
}
```

**Response:**
```json
{
  "response": "string",
  "usage": {
    "prompt_tokens": number,
    "completion_tokens": number,
    "total_tokens": number
  }
}
```

### File Upload Function
**Endpoint:** `/functions/v1/upload-asset`

Handles file uploads to Supabase Storage.

**Request:** FormData with file

**Response:**
```json
{
  "id": "uuid",
  "name": "string",
  "file_path": "string",
  "file_type": "string",
  "file_size": number
}
```

## Real-time Subscriptions

Supabase provides real-time subscriptions for all tables. Subscribe to changes using the Supabase client:

```typescript
const subscription = supabase
  .channel('prompts_changes')
  .on('postgres_changes', 
    { 
      event: '*', 
      schema: 'public', 
      table: 'prompts',
      filter: `user_id=eq.${user.id}`
    }, 
    (payload) => {
      // Handle real-time updates
    }
  )
  .subscribe();
```

## Error Handling

### HTTP Status Codes
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden (RLS policy violation)
- `404` - Not Found
- `500` - Internal Server Error

### Error Response Format
```json
{
  "error": {
    "message": "string",
    "details": "string",
    "hint": "string",
    "code": "string"
  }
}
```

## Rate Limiting

- REST API: 100 requests per minute per user
- Edge Functions: 50 requests per minute per user
- Real-time: 100 messages per minute per connection

## Environment Variables

### Required Variables
```bash
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Edge Function Variables
```bash
OPENAI_API_KEY=your_openai_api_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

## Development Tools

### Supabase CLI
- Database migrations: `supabase db reset`
- Function deployment: `supabase functions deploy`
- Type generation: `supabase gen types typescript`

### Database Management
- Supabase Dashboard for GUI management
- Direct SQL access via psql
- Migration files in `supabase/migrations/`

## Security Best Practices

1. **Never expose service role key** in client-side code
2. **Always use RLS policies** for data access control
3. **Validate inputs** in Edge Functions
4. **Use HTTPS only** for all communications
5. **Rotate API keys** regularly
6. **Monitor usage** for unusual patterns

## Testing

### API Testing
Use the included test utilities:

```typescript
import { createTestSupabaseClient } from '../test/utils/supabase';

const supabase = createTestSupabaseClient();
// Use for testing API calls
```

### Integration Testing
Test with actual Supabase instance using test environment variables.