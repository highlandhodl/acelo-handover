-- Create automations table
CREATE TABLE public.automations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT,
  purpose TEXT NOT NULL,
  webhook_url TEXT NOT NULL,
  input_schema JSONB,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create automation_runs table
CREATE TABLE public.automation_runs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  automation_id UUID NOT NULL REFERENCES public.automations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  input_data JSONB,
  output_data JSONB,
  status TEXT NOT NULL DEFAULT 'pending',
  error_message TEXT,
  duration_ms INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.automations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.automation_runs ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for automations
CREATE POLICY "Users can view their own automations" 
ON public.automations 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own automations" 
ON public.automations 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own automations" 
ON public.automations 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own automations" 
ON public.automations 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create RLS policies for automation_runs
CREATE POLICY "Users can view their own automation runs" 
ON public.automation_runs 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own automation runs" 
ON public.automation_runs 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own automation runs" 
ON public.automation_runs 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_automations_updated_at
BEFORE UPDATE ON public.automations
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_automation_runs_updated_at
BEFORE UPDATE ON public.automation_runs
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();