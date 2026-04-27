
-- ai_user_context: per-user AI preferences and disclaimer acceptance
CREATE TABLE public.ai_user_context (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  country TEXT,
  region TEXT,
  language TEXT NOT NULL DEFAULT 'fr',
  preparing_for TEXT NOT NULL DEFAULT 'myself',
  ai_disclaimer_accepted BOOLEAN NOT NULL DEFAULT false,
  ai_disclaimer_accepted_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.ai_user_context ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users read own ai context" ON public.ai_user_context
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own ai context" ON public.ai_user_context
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own ai context" ON public.ai_user_context
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users delete own ai context" ON public.ai_user_context
  FOR DELETE USING (auth.uid() = user_id);

CREATE TRIGGER trg_ai_user_context_updated
  BEFORE UPDATE ON public.ai_user_context
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ai_interactions_log: audit trail of AI requests
CREATE TABLE public.ai_interactions_log (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  action_type TEXT NOT NULL,
  request_summary TEXT,
  response_summary TEXT,
  success BOOLEAN NOT NULL DEFAULT true,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.ai_interactions_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users read own ai logs" ON public.ai_interactions_log
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own ai logs" ON public.ai_interactions_log
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE INDEX idx_ai_interactions_user_created ON public.ai_interactions_log(user_id, created_at DESC);

-- ai_saved_suggestions: user-saved AI suggestions
CREATE TABLE public.ai_saved_suggestions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  suggestion_type TEXT NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'saved',
  professional_review_recommended BOOLEAN NOT NULL DEFAULT false,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.ai_saved_suggestions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users read own saved suggestions" ON public.ai_saved_suggestions
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own saved suggestions" ON public.ai_saved_suggestions
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own saved suggestions" ON public.ai_saved_suggestions
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users delete own saved suggestions" ON public.ai_saved_suggestions
  FOR DELETE USING (auth.uid() = user_id);

CREATE TRIGGER trg_ai_saved_suggestions_updated
  BEFORE UPDATE ON public.ai_saved_suggestions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_ai_saved_user_created ON public.ai_saved_suggestions(user_id, created_at DESC);
