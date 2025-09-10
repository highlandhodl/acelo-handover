-- Create contexts table for the Context Hub feature
CREATE TABLE public.contexts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL CHECK (category IN (
        'client_profiles',
        'product_service_info', 
        'competitor_analysis',
        'industry_knowledge',
        'brand_voice_guidelines',
        'technical_documentation',
        'creative_frameworks',
        'communication_templates',
        'process_documentation',
        'market_research'
    )),
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- RLS Policies are MANDATORY
ALTER TABLE public.contexts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own contexts"
ON public.contexts FOR ALL
USING (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX idx_contexts_user_id ON public.contexts(user_id);
CREATE INDEX idx_contexts_category ON public.contexts(user_id, category);
CREATE INDEX idx_contexts_created_at ON public.contexts(user_id, created_at DESC);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_contexts_updated_at BEFORE UPDATE
ON public.contexts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();