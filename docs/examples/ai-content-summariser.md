# AI Content Summariser - Complete Development Example

This example demonstrates how Acelo handles AI-powered features, from initial idea to final implementation following our development standards.

## Development Approach

This feature would be developed following our standard development process:

1. **Requirements Analysis**: Understanding the AI summarization feature requirements
2. **Implementation Planning**: Breaking down the feature into manageable components  
3. **Development**: Following our established patterns and conventions

## Implementation Overview

**Key Generated Sections:**

### Feature Goal
Build an intelligent text summarisation tool that helps users quickly understand the key points of long-form content, saving them significant reading time.

### User Value
-   **Productivity Boost**: Reduces the time needed to digest a 10-page document from 20 minutes to under 1 minute.
-   **Improved Comprehension**: Delivers the most critical information in a concise format.
-   **Efficient Research**: Allows users to quickly evaluate the relevance of multiple documents.

### Success Criteria
-   [ ] Generates a coherent and accurate summary of the provided text.
-   [ ] Supports variable summary lengths (short, medium, long).
-   [ ] AI responses are delivered within 5 seconds for a typical article.
-   [ ] 90%+ of generated summaries are rated as "helpful" by users.

### OpenAI Integration Architecture (Edge Function)

```typescript
// supabase/functions/generate-summary/index.ts
import { corsHeaders } from '../_shared/cors.ts'

interface SummaryRequest {
  text_to_summarise: string;
  summary_length: 'short' | 'medium' | 'long'; // e.g., 1 paragraph, 3 paragraphs, bullet points
}

Deno.serve(async (req) => {
  try {
    const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
    if (!OPENAI_API_KEY) {
      throw new Error("Missing OpenAI API key");
    }

    const request: SummaryRequest = await req.json();
    
    // Construct a domain-specific prompt
    const systemPrompt = `You are an expert text summariser for the Acelo platform. Your task is to provide clear, concise, and accurate summaries of the text provided by the user.`;

    const userPrompt = `
      Summarise the following text.
      The desired summary length is: ${request.summary_length}.
      - For 'short', provide a single, dense paragraph.
      - For 'medium', provide three distinct paragraphs covering the key themes.
      - For 'long', provide a detailed summary with bullet points for key takeaways.

      Here is the text to summarise:
      ---
      ${request.text_to_summarise}
      ---
    `;

    // Call OpenAI API
    const response = await fetch("[https://api.openai.com/v1/chat/completions](https://api.openai.com/v1/chat/completions)", {
      method: 'POST',
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        temperature: 0.5,
        max_tokens: 1000
      }),
    });

    const aiData = await response.json();
    
    return new Response(JSON.stringify({
      summary: aiData.choices[0].message.content,
      usage: aiData.usage
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
````

## Implementation Details

### 1\. AI Summariser Hook

```typescript
// src/hooks/ai/useAISummarizer.ts
import { useMutation } from '@tanstack/react-query';
import { supabase } from '../../lib/supabaseClient';

interface SummaryRequest {
  text_to_summarise: string;
  summary_length: 'short' | 'medium' | 'long';
}

export const useAISummarizer = () => {
  return useMutation({
    mutationFn: async (request: SummaryRequest) => {
      const { data, error } = await supabase.functions.invoke('generate-summary', {
        body: request
      });
      
      if (error) {
        console.error('AI summarisation failed:', error);
        throw new Error(error.message || 'Summarisation failed');
      }
      
      return data;
    },
  });
};
```

### 2\. Summariser UI Component

```typescript
// src/components/summariser/ContentSummariser.tsx
import { useState } from 'react';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Loader2, Wand2 } from 'lucide-react';
import { useAISummarizer } from '../../hooks/ai/useAISummarizer';

export const ContentSummariser = () => {
  const [sourceText, setSourceText] = useState('');
  const [summary, setSummary] = useState('');
  const { mutate: generateSummary, isPending, data } = useAISummarizer();

  const handleGenerate = () => {
    if (!sourceText) return;
    generateSummary({ text_to_summarise: sourceText, summary_length: 'medium' }, {
        onSuccess: (data) => setSummary(data.summary)
    });
  };
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>AI Content Summariser</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Textarea
          placeholder="Paste your article or text here..."
          value={sourceText}
          onChange={(e) => setSourceText(e.target.value)}
          rows={10}
        />
        <Button onClick={handleGenerate} disabled={isPending || !sourceText} className="w-full">
          {isPending ? (
            <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating...</>
          ) : (
            <><Wand2 className="mr-2 h-4 w-4" /> Generate Summary</>
          )}
        </Button>
        {summary && (
          <div className="space-y-2 pt-4">
            <h4 className="font-medium">Generated Summary:</h4>
            <div className="p-4 bg-muted border rounded-lg text-sm whitespace-pre-wrap">
              {summary}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
```

-----