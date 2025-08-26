import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

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
    const { code } = await req.json();
    
    if (!code) {
      return new Response(
        JSON.stringify({ error: 'Code is required for validation' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const groqApiKey = Deno.env.get('GROQ_API_KEY');
    if (!groqApiKey) {
      console.error('GROQ_API_KEY not found in environment');
      return new Response(
        JSON.stringify({ error: 'AI service not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const systemPrompt = `You are a strict code validator for Discord.js slash commands.
Check the given JavaScript for:
1. Syntax errors
2. Missing or incorrect fields in SlashCommandBuilder
3. Correct use of module.exports format
4. Proper Discord.js v14+ patterns
5. Valid option types and configurations
6. Required execute function with interaction parameter

Respond with JSON containing:
- "isValid": boolean
- "errors": array of error descriptions
- "correctedCode": the fixed code if there were issues, or original if valid
- "suggestions": array of improvement suggestions`;

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${groqApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.1-70b-versatile',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Validate this Discord.js slash command code:\n\n${code}` }
        ],
        max_tokens: 1500,
        temperature: 0.1,
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Groq API error:', errorData);
      return new Response(
        JSON.stringify({ error: 'Failed to validate command' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data = await response.json();
    const validationResult = data.choices[0].message.content;

    // Try to parse as JSON, fallback to text analysis
    let result;
    try {
      result = JSON.parse(validationResult);
    } catch (e) {
      // Fallback: analyze the response text
      const hasErrors = validationResult.toLowerCase().includes('error') || 
                       validationResult.toLowerCase().includes('invalid') ||
                       validationResult.toLowerCase().includes('missing');
      
      result = {
        isValid: !hasErrors,
        errors: hasErrors ? ['Code validation detected potential issues'] : [],
        correctedCode: code,
        suggestions: ['Manual review recommended']
      };
    }

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in ai-validate-command function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});