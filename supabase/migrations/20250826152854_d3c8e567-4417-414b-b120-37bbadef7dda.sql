-- Create tables for bot project management
CREATE TABLE IF NOT EXISTS public.bots (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.bots ENABLE ROW LEVEL SECURITY;

-- Create policies for bots
CREATE POLICY "Users can view their own bots" 
ON public.bots 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own bots" 
ON public.bots 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own bots" 
ON public.bots 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own bots" 
ON public.bots 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create commands table for storing command flows and generated code
CREATE TABLE IF NOT EXISTS public.commands (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  bot_id UUID NOT NULL REFERENCES public.bots(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  command_type TEXT DEFAULT 'chat_input',
  flow JSONB,
  generated_code TEXT,
  user_code TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.commands ENABLE ROW LEVEL SECURITY;

-- Create policies for commands (through bot ownership)
CREATE POLICY "Users can manage commands for their bots" 
ON public.commands 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.bots 
    WHERE bots.id = commands.bot_id 
    AND bots.user_id = auth.uid()
  )
);

-- Create env_vars table for secure environment variable storage
CREATE TABLE IF NOT EXISTS public.env_vars (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  bot_id UUID NOT NULL REFERENCES public.bots(id) ON DELETE CASCADE,
  key TEXT NOT NULL,
  value TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(bot_id, key)
);

-- Enable RLS
ALTER TABLE public.env_vars ENABLE ROW LEVEL SECURITY;

-- Create policies for env_vars
CREATE POLICY "Users can manage env vars for their bots" 
ON public.env_vars 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.bots 
    WHERE bots.id = env_vars.bot_id 
    AND bots.user_id = auth.uid()
  )
);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_bots_updated_at
  BEFORE UPDATE ON public.bots
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_commands_updated_at
  BEFORE UPDATE ON public.commands
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_env_vars_updated_at
  BEFORE UPDATE ON public.env_vars
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();