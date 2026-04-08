
-- ============================================================
-- 1. Add jurisdiction fields to profiles (user preference)
-- ============================================================
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS country_group text DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS country_code text DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS region_code text DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS preferred_language text DEFAULT 'fr',
  ADD COLUMN IF NOT EXISTS jurisdiction_pack text DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS currency_code text DEFAULT 'CAD';

-- ============================================================
-- 2. Add jurisdiction fields to family_circles (dossier jurisdiction)
-- ============================================================
ALTER TABLE public.family_circles
  ADD COLUMN IF NOT EXISTS country_group text DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS country_code text DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS region_code text DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS jurisdiction_pack text DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS legal_terms_pack text DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS currency_code text DEFAULT 'CAD';

-- ============================================================
-- 3. Subscriptions table
-- ============================================================
CREATE TABLE public.subscriptions (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  plan text NOT NULL DEFAULT 'free',
  subscription_status text NOT NULL DEFAULT 'active',
  billing_cycle text DEFAULT 'annual',
  founder_discount_applied boolean NOT NULL DEFAULT false,
  renewal_date timestamp with time zone DEFAULT NULL,
  cancelled_at timestamp with time zone DEFAULT NULL,
  stripe_customer_id text DEFAULT NULL,
  stripe_subscription_id text DEFAULT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own subscription"
  ON public.subscriptions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own subscription"
  ON public.subscriptions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own subscription"
  ON public.subscriptions FOR UPDATE
  USING (auth.uid() = user_id);

CREATE TRIGGER update_subscriptions_updated_at
  BEFORE UPDATE ON public.subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================
-- 4. Notifications table
-- ============================================================
CREATE TABLE public.notifications (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  circle_id uuid DEFAULT NULL,
  type text NOT NULL DEFAULT 'info',
  title text NOT NULL,
  body text DEFAULT '',
  link text DEFAULT NULL,
  is_read boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own notifications"
  ON public.notifications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications"
  ON public.notifications FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own notifications"
  ON public.notifications FOR DELETE
  USING (auth.uid() = user_id);

CREATE POLICY "System or circle managers can insert notifications"
  ON public.notifications FOR INSERT
  WITH CHECK (true);

-- ============================================================
-- 5. Auto-create free subscription on new user signup
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email, full_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.email, ''),
    COALESCE(NEW.raw_user_meta_data->>'full_name', '')
  );
  INSERT INTO public.subscriptions (user_id, plan, subscription_status)
  VALUES (NEW.id, 'free', 'active');
  RETURN NEW;
END;
$$;
