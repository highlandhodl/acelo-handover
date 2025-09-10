-- Add DELETE policy for automation_runs
CREATE POLICY "Users can delete their own automation runs" 
ON public.automation_runs 
FOR DELETE 
USING (automation_id IN (SELECT id FROM automations WHERE user_id = auth.uid()));