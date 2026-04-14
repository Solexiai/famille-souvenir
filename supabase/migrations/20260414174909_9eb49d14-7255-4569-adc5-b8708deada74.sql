
-- Enforce one profile per email
ALTER TABLE public.profiles
ADD CONSTRAINT profiles_email_unique UNIQUE (email);

-- Enforce one membership per user per circle
ALTER TABLE public.circle_members
ADD CONSTRAINT circle_members_user_circle_unique UNIQUE (user_id, circle_id);
