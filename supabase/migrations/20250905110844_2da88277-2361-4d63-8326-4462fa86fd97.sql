-- Add DELETE policy for automation_runs
CREATE POLICY "Users can delete their own automation runs" 
ON public.automation_runs 
FOR DELETE 
USING (automation_id IN (SELECT id FROM automations WHERE user_id = auth.uid()));

-- Create updated_at triggers for all core tables
CREATE TRIGGER update_automations_updated_at
BEFORE UPDATE ON public.automations
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_automation_runs_updated_at
BEFORE UPDATE ON public.automation_runs
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_prompts_updated_at
BEFORE UPDATE ON public.prompts
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_assets_updated_at
BEFORE UPDATE ON public.assets
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_coaches_updated_at
BEFORE UPDATE ON public.coaches
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();