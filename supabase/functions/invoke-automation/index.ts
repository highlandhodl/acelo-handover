import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { automationId, inputData } = await req.json();
    
    if (!automationId) {
      throw new Error('Automation ID is required');
    }

    // Get authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Authorization required');
    }

    // Initialize Supabase client with user's auth
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey, {
      global: {
        headers: { Authorization: authHeader },
      },
    });

    // Get user ID from auth
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      throw new Error('Authentication failed');
    }

    console.log(`Invoking automation ${automationId} for user ${user.id}`);

    // Fetch automation details
    const { data: automation, error: fetchError } = await supabase
      .from('automations')
      .select('*')
      .eq('id', automationId)
      .single();

    if (fetchError || !automation) {
      console.error('Automation fetch error:', fetchError);
      throw new Error('Automation not found');
    }

    if (!automation.active) {
      throw new Error('Automation is not active');
    }

    // Create automation run record
    const { data: run, error: runError } = await supabase
      .from('automation_runs')
      .insert({
        automation_id: automationId,
        user_id: user.id,
        input_data: inputData,
        status: 'running'
      })
      .select()
      .single();

    if (runError || !run) {
      console.error('Run creation error:', runError);
      throw new Error('Failed to create automation run');
    }

    const startTime = Date.now();

    try {
      // Call n8n webhook
      console.log(`Calling webhook: ${automation.webhook_url}`);
      const webhookResponse = await fetch(automation.webhook_url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...inputData,
          automation_id: automationId,
          run_id: run.id,
          user_id: user.id
        }),
        signal: AbortSignal.timeout(60000) // 60 second timeout
      });

      const duration = Date.now() - startTime;

      let outputData;
      let status = 'completed';

      if (!webhookResponse.ok) {
        status = 'failed';
        outputData = {
          error: `HTTP ${webhookResponse.status}: ${webhookResponse.statusText}`,
          response: await webhookResponse.text()
        };
      } else {
        const contentType = webhookResponse.headers.get('content-type');
        if (contentType?.includes('application/json')) {
          outputData = await webhookResponse.json();
        } else {
          outputData = { response: await webhookResponse.text() };
        }
      }

      // Update run with results
      const { error: updateError } = await supabase
        .from('automation_runs')
        .update({
          output_data: outputData,
          status,
          duration_ms: duration,
          error_message: status === 'failed' ? outputData.error : null
        })
        .eq('id', run.id);

      if (updateError) {
        console.error('Failed to update run:', updateError);
      }

      console.log(`Automation ${automationId} completed with status: ${status}`);

      return new Response(JSON.stringify({
        success: status === 'completed',
        runId: run.id,
        status,
        output: outputData,
        duration: duration
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });

    } catch (error) {
      const duration = Date.now() - startTime;
      console.error('Webhook execution error:', error);

      // Update run with error
      await supabase
        .from('automation_runs')
        .update({
          status: 'failed',
          error_message: error.message,
          duration_ms: duration
        })
        .eq('id', run.id);

      throw error;
    }

  } catch (error) {
    console.error('Error in invoke-automation function:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      success: false 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});