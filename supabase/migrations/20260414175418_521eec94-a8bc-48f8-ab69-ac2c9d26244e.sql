
-- 1. Normalize all existing profile emails to lowercase
UPDATE public.profiles SET email = LOWER(email) WHERE email != LOWER(email);

-- 2. Normalize all existing invitation emails to lowercase
UPDATE public.invitations SET email = LOWER(email) WHERE email != LOWER(email);

-- 3. Create trigger to auto-lowercase email on profiles insert/update
CREATE OR REPLACE FUNCTION public.normalize_profile_email()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = 'public'
AS $$
BEGIN
  NEW.email = LOWER(TRIM(NEW.email));
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_normalize_profile_email
BEFORE INSERT OR UPDATE OF email ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.normalize_profile_email();

-- 4. Create trigger to auto-lowercase email on invitations insert/update
CREATE OR REPLACE FUNCTION public.normalize_invitation_email()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = 'public'
AS $$
BEGIN
  NEW.email = LOWER(TRIM(NEW.email));
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_normalize_invitation_email
BEFORE INSERT OR UPDATE OF email ON public.invitations
FOR EACH ROW
EXECUTE FUNCTION public.normalize_invitation_email();

-- 5. Update handle_new_user to use LOWER on email
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
    LOWER(COALESCE(NEW.email, '')),
    COALESCE(NEW.raw_user_meta_data->>'full_name', '')
  );
  INSERT INTO public.subscriptions (user_id, plan, subscription_status)
  VALUES (NEW.id, 'free', 'active');
  RETURN NEW;
END;
$$;

-- 6. Unique partial index: only one pending invitation per email per circle
CREATE UNIQUE INDEX IF NOT EXISTS invitations_pending_email_circle_unique
ON public.invitations (circle_id, email)
WHERE status = 'pending';

-- 7. Remove redundant duplicate constraint on circle_members
-- (circle_members_circle_id_user_id_key and circle_members_user_circle_unique are identical)
ALTER TABLE public.circle_members DROP CONSTRAINT IF EXISTS circle_members_circle_id_user_id_key;
