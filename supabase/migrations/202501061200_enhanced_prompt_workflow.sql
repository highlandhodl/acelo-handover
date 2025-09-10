-- Enhanced Prompt Workflow Migration
-- Add support for context sets, usage analytics, and enhanced prompt metadata

-- Add new fields to existing prompts table
ALTER TABLE public.prompts ADD COLUMN IF NOT EXISTS estimated_tokens INTEGER DEFAULT 0;
ALTER TABLE public.prompts ADD COLUMN IF NOT EXISTS last_used_contexts JSONB DEFAULT '[]';

-- Create context_sets table for saved context combinations
CREATE TABLE public.context_sets (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    context_ids JSONB NOT NULL DEFAULT '[]', -- Array of context UUIDs
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create prompt_usage_analytics table for context suggestions
CREATE TABLE public.prompt_usage_analytics (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    prompt_id UUID REFERENCES public.prompts(id) ON DELETE CASCADE NOT NULL,
    context_ids JSONB NOT NULL DEFAULT '[]', -- Array of context UUIDs used
    generated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- RLS Policies are MANDATORY
ALTER TABLE public.context_sets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prompt_usage_analytics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own context sets"
ON public.context_sets FOR ALL
USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own usage analytics"
ON public.prompt_usage_analytics FOR ALL
USING (auth.uid() = user_id);

-- Indexes for performance
CREATE INDEX idx_context_sets_user_id ON public.context_sets(user_id);
CREATE INDEX idx_prompt_usage_analytics_user_id ON public.prompt_usage_analytics(user_id);
CREATE INDEX idx_prompt_usage_analytics_prompt_id ON public.prompt_usage_analytics(prompt_id);