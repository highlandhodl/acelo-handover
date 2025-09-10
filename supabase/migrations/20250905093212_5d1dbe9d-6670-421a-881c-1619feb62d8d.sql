-- Create management functions for sample prompts

-- Function to add sample prompts for current user
CREATE OR REPLACE FUNCTION public.add_sample_prompts()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    current_user_id uuid;
    sample_titles text[] := ARRAY[
        'Sales Email Sequence Generator',
        'Revenue Forecast Analysis', 
        'Customer Retention Strategy Builder',
        'Sales Objection Handler'
    ];
    existing_count integer;
BEGIN
    -- Get the current authenticated user ID
    current_user_id := auth.uid();
    
    -- Check if user is authenticated
    IF current_user_id IS NULL THEN
        RETURN 'Error: No authenticated user found';
    END IF;
    
    -- Check if sample prompts already exist for this user
    SELECT COUNT(*) INTO existing_count
    FROM public.prompts 
    WHERE user_id = current_user_id 
    AND title = ANY(sample_titles);
    
    IF existing_count > 0 THEN
        RETURN 'Sample prompts already exist for this user';
    END IF;
    
    -- Insert sample prompts
    INSERT INTO public.prompts (user_id, title, description, purpose, prompt_content) VALUES
    (
        current_user_id,
        'Sales Email Sequence Generator',
        'Generate personalized email sequences for lead nurturing and conversion',
        '# Sales Email Sequence Generator

This prompt helps you create compelling email sequences that nurture leads through your sales funnel. It generates personalized content that builds relationships while driving conversions.

## How to use:
1. Provide context about your product/service, target audience, and desired outcome
2. The AI will generate a complete email sequence with subject lines and timing recommendations
3. Review and customize the sequence for your specific brand voice

## Best for:
- Lead nurturing campaigns
- Product launch sequences  
- Re-engagement campaigns
- Post-purchase follow-ups',
        'You are an expert sales copywriter specializing in email marketing. Create a compelling email sequence that converts prospects into customers.

**Your task:**
- Generate 5-7 emails for a nurturing sequence
- Include compelling subject lines for each email
- Provide recommended timing between emails
- Focus on building trust and addressing common objections
- Include clear calls-to-action
- Maintain a conversational, helpful tone

**Structure each email with:**
1. Subject line
2. Email body (150-300 words)
3. Call-to-action
4. Timing recommendation

**Guidelines:**
- Lead with value, not sales pitches
- Address pain points and provide solutions
- Use social proof when relevant
- Create urgency appropriately
- Personalize where possible'
    ),
    (
        current_user_id,
        'Revenue Forecast Analysis',
        'Analyze sales data and create accurate revenue forecasts with actionable insights',
        '# Revenue Forecast Analysis

This prompt transforms your sales data into actionable revenue forecasts. It analyzes trends, identifies opportunities, and provides strategic recommendations for hitting your targets.

## How to use:
1. Input your current sales data, pipeline information, and historical performance
2. Specify your forecast period and any known variables
3. The AI will generate detailed forecasts with supporting analysis

## Perfect for:
- Monthly/quarterly revenue planning
- Board presentation preparation
- Sales strategy adjustments
- Resource allocation decisions',
        'You are a senior revenue operations analyst with expertise in sales forecasting and data analysis. Create comprehensive revenue forecasts based on the provided data.

**Your analysis should include:**

1. **Executive Summary**
   - Key forecast numbers
   - Confidence level assessment
   - Major assumptions

2. **Detailed Forecast Breakdown**
   - Revenue by month/quarter
   - Pipeline conversion analysis
   - Deal velocity trends
   - Win rate patterns

3. **Risk Assessment**
   - Upside scenarios
   - Downside risks
   - Mitigation strategies

4. **Actionable Recommendations**
   - Specific actions to achieve targets
   - Resource allocation suggestions
   - Process improvements

**Present findings in a clear, executive-ready format with supporting rationale for all projections.**'
    ),
    (
        current_user_id,
        'Customer Retention Strategy Builder',
        'Develop comprehensive strategies to improve customer retention and reduce churn',
        '# Customer Retention Strategy Builder

This prompt helps you develop data-driven retention strategies that reduce churn and increase customer lifetime value. It analyzes your customer journey and identifies key intervention points.

## How to use:
1. Provide customer data, churn patterns, and current retention efforts
2. Specify your industry and customer segments
3. Get a complete retention strategy with implementation roadmap

## Ideal for:
- Reducing customer churn
- Increasing LTV
- Improving customer satisfaction
- Building loyalty programs',
        'You are a customer success strategist specializing in retention and churn reduction. Develop a comprehensive retention strategy based on the provided customer data and business context.

**Create a strategy that includes:**

1. **Churn Analysis**
   - Identify at-risk customer segments
   - Analyze churn triggers and patterns
   - Calculate impact on revenue

2. **Retention Framework**
   - Customer lifecycle mapping
   - Intervention points and triggers
   - Success metrics and KPIs

3. **Tactical Recommendations**
   - Specific retention campaigns
   - Product/service improvements
   - Customer communication strategies
   - Team training requirements

4. **Implementation Roadmap**
   - Prioritized action items
   - Timeline and resource requirements
   - Success measurement plan

**Focus on practical, immediately actionable strategies that deliver measurable results.**'
    ),
    (
        current_user_id,
        'Sales Objection Handler',
        'Generate powerful responses to common sales objections and build confidence in sales conversations',
        '# Sales Objection Handler

This prompt equips your sales team with confident, persuasive responses to common objections. It helps transform resistance into opportunities and builds trust during the sales process.

## How to use:
1. Describe the specific objection or resistance you''re facing
2. Provide context about your product/service and the prospect
3. Get multiple response strategies with different approaches

## Great for:
- Sales training and enablement
- Handling price objections
- Overcoming feature concerns
- Building buyer confidence',
        'You are an experienced sales trainer and objection handling expert. Create powerful, empathetic responses to sales objections that build trust and move prospects forward in the buying process.

**For each objection, provide:**

1. **Acknowledge & Empathize**
   - Validate the prospect''s concern
   - Show understanding of their perspective

2. **Reframe the Objection**
   - Redirect focus to value and outcomes
   - Address underlying concerns

3. **Provide Evidence**
   - Use relevant case studies or examples
   - Share social proof when appropriate
   - Present data or testimonials

4. **Ask Follow-up Questions**
   - Uncover the real objection
   - Guide toward solution-focused thinking
   - Maintain conversational flow

5. **Alternative Approaches**
   - Multiple response strategies
   - Different angles for different personality types

**Ensure all responses maintain a consultative, helpful tone while confidently addressing concerns.**'
    );
    
    RETURN 'Successfully added 4 sample prompts for sales/revenue operations';
END $$;

-- Function to remove sample prompts for current user
CREATE OR REPLACE FUNCTION public.remove_sample_prompts()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    current_user_id uuid;
    sample_titles text[] := ARRAY[
        'Sales Email Sequence Generator',
        'Revenue Forecast Analysis', 
        'Customer Retention Strategy Builder',
        'Sales Objection Handler'
    ];
    deleted_count integer;
BEGIN
    -- Get the current authenticated user ID
    current_user_id := auth.uid();
    
    -- Check if user is authenticated
    IF current_user_id IS NULL THEN
        RETURN 'Error: No authenticated user found';
    END IF;
    
    -- Delete sample prompts for this user
    DELETE FROM public.prompts 
    WHERE user_id = current_user_id 
    AND title = ANY(sample_titles);
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    
    RETURN 'Successfully removed ' || deleted_count || ' sample prompts';
END $$;

-- Grant execute permissions to authenticated users
GRANT EXECUTE ON FUNCTION public.add_sample_prompts() TO authenticated;
GRANT EXECUTE ON FUNCTION public.remove_sample_prompts() TO authenticated;