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
    const { description } = await req.json();
    
    if (!description) {
      return new Response(
        JSON.stringify({ error: 'Description is required' }),
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

    const systemPrompt = `You are an expert Discord.js v14+ bot developer.
Your task is to generate only the BASE structure of slash commands for Discord bots.
Always use @discordjs/builders and the standard Discord.js module.exports format.

Rules:
- Output ONLY valid JavaScript inside a JSON response with "code" field
- Include command name, description, and options based on user description
- Always include an async execute(interaction) function with a placeholder comment
- Do NOT add actual business logic, leave it empty or minimal
- Use SlashCommandBuilder properly with appropriate options (string, integer, user, role, channel, etc.)
- Make command names lowercase with no spaces or special characters
- Keep descriptions under 100 characters
- Add required options when they make sense for the command`;

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
          { role: 'user', content: `Generate a Discord.js slash command for: ${description}` }
        ],
        max_tokens: 1000,
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Groq API error:', errorData);
      return new Response(
        JSON.stringify({ error: 'Failed to generate command' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data = await response.json();
    const generatedCode = data.choices[0].message.content;

    // Extract command structure for the visual builder
    const commandMatch = generatedCode.match(/\.setName\(['"`]([^'"`]+)['"`]\)/);
    const descriptionMatch = generatedCode.match(/\.setDescription\(['"`]([^'"`]+)['"`]\)/);
    
    const commandName = commandMatch ? commandMatch[1] : 'generated-command';
    const commandDescription = descriptionMatch ? descriptionMatch[1] : 'Generated command';

    // Extract options for visual builder
    const options = [];
    const optionMatches = generatedCode.matchAll(/\.add(\w+)Option\(option =>\s*option\.setName\(['"`]([^'"`]+)['"`]\)\.setDescription\(['"`]([^'"`]+)['"`]\)(?:\.setRequired\(true\))?/g);
    
    for (const match of optionMatches) {
      const type = match[1].toLowerCase();
      const name = match[2];
      const description = match[3];
      const required = generatedCode.includes(`.setName(['"\`]${name}['"\`]).setDescription(['"\`]${description}['"\`]).setRequired(true)`);
      
      options.push({
        type,
        name,
        description,
        required
      });
    }

    return new Response(
      JSON.stringify({
        code: generatedCode,
        command: {
          name: commandName,
          description: commandDescription,
          options
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in ai-generate-command function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});