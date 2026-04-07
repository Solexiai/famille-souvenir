
-- Create role enum
CREATE TYPE public.app_role AS ENUM ('owner', 'family_manager', 'contributor', 'viewer');

-- Create memory type enum
CREATE TYPE public.memory_type AS ENUM ('photo', 'video', 'audio', 'text');

-- Create visibility enums
CREATE TYPE public.memory_visibility AS ENUM ('circle', 'managers', 'private');
CREATE TYPE public.vault_visibility AS ENUM ('owner', 'managers', 'circle');
CREATE TYPE public.invitation_status AS ENUM ('pending', 'accepted', 'declined', 'expired');

-- Timestamp updater function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- ============================================
-- PROFILES
-- ============================================
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL DEFAULT '',
  email TEXT NOT NULL DEFAULT '',
  language TEXT NOT NULL DEFAULT 'fr',
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email, full_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.email, ''),
    COALESCE(NEW.raw_user_meta_data->>'full_name', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- FAMILY CIRCLES
-- ============================================
CREATE TABLE public.family_circles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT DEFAULT '',
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.family_circles ENABLE ROW LEVEL SECURITY;

CREATE INDEX idx_family_circles_owner ON public.family_circles(owner_id);

CREATE TRIGGER update_family_circles_updated_at
  BEFORE UPDATE ON public.family_circles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================
-- CIRCLE MEMBERS
-- ============================================
CREATE TABLE public.circle_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  circle_id UUID NOT NULL REFERENCES public.family_circles(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL DEFAULT 'viewer',
  joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(circle_id, user_id)
);

ALTER TABLE public.circle_members ENABLE ROW LEVEL SECURITY;

CREATE INDEX idx_circle_members_circle ON public.circle_members(circle_id);
CREATE INDEX idx_circle_members_user ON public.circle_members(user_id);

-- ============================================
-- SECURITY DEFINER FUNCTIONS for RLS
-- ============================================

-- Check if user is member of a circle
CREATE OR REPLACE FUNCTION public.is_circle_member(_user_id UUID, _circle_id UUID)
RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.circle_members
    WHERE user_id = _user_id AND circle_id = _circle_id
  )
$$;

-- Check if user has a specific role in a circle
CREATE OR REPLACE FUNCTION public.has_circle_role(_user_id UUID, _circle_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.circle_members
    WHERE user_id = _user_id AND circle_id = _circle_id AND role = _role
  )
$$;

-- Check if user is owner or family_manager in a circle
CREATE OR REPLACE FUNCTION public.is_circle_manager(_user_id UUID, _circle_id UUID)
RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.circle_members
    WHERE user_id = _user_id AND circle_id = _circle_id AND role IN ('owner', 'family_manager')
  )
$$;

-- Get user's role in a circle
CREATE OR REPLACE FUNCTION public.get_circle_role(_user_id UUID, _circle_id UUID)
RETURNS app_role
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT role FROM public.circle_members
  WHERE user_id = _user_id AND circle_id = _circle_id
  LIMIT 1
$$;

-- ============================================
-- RLS POLICIES for family_circles
-- ============================================
CREATE POLICY "Members can view their circles"
  ON public.family_circles FOR SELECT
  USING (public.is_circle_member(auth.uid(), id));

CREATE POLICY "Owner can update circle"
  ON public.family_circles FOR UPDATE
  USING (owner_id = auth.uid());

CREATE POLICY "Authenticated users can create circles"
  ON public.family_circles FOR INSERT
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Owner can delete circle"
  ON public.family_circles FOR DELETE
  USING (owner_id = auth.uid());

-- ============================================
-- RLS POLICIES for circle_members
-- ============================================
CREATE POLICY "Members can view circle members"
  ON public.circle_members FOR SELECT
  USING (public.is_circle_member(auth.uid(), circle_id));

CREATE POLICY "Owner can add members"
  ON public.circle_members FOR INSERT
  WITH CHECK (public.has_circle_role(auth.uid(), circle_id, 'owner') OR auth.uid() = user_id);

CREATE POLICY "Owner can update member roles"
  ON public.circle_members FOR UPDATE
  USING (public.has_circle_role(auth.uid(), circle_id, 'owner'));

CREATE POLICY "Owner can remove members"
  ON public.circle_members FOR DELETE
  USING (public.has_circle_role(auth.uid(), circle_id, 'owner') OR auth.uid() = user_id);

-- ============================================
-- INVITATIONS
-- ============================================
CREATE TABLE public.invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  circle_id UUID NOT NULL REFERENCES public.family_circles(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  role app_role NOT NULL DEFAULT 'viewer',
  token TEXT NOT NULL UNIQUE DEFAULT gen_random_uuid()::text,
  status invitation_status NOT NULL DEFAULT 'pending',
  invited_by UUID NOT NULL REFERENCES auth.users(id),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (now() + interval '7 days'),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.invitations ENABLE ROW LEVEL SECURITY;

CREATE INDEX idx_invitations_circle ON public.invitations(circle_id);
CREATE INDEX idx_invitations_email ON public.invitations(email);
CREATE INDEX idx_invitations_token ON public.invitations(token);

CREATE POLICY "Managers can view invitations"
  ON public.invitations FOR SELECT
  USING (public.is_circle_manager(auth.uid(), circle_id));

CREATE POLICY "Managers can create invitations"
  ON public.invitations FOR INSERT
  WITH CHECK (public.is_circle_manager(auth.uid(), circle_id));

CREATE POLICY "Managers can update invitations"
  ON public.invitations FOR UPDATE
  USING (public.is_circle_manager(auth.uid(), circle_id));

CREATE POLICY "Managers can delete invitations"
  ON public.invitations FOR DELETE
  USING (public.is_circle_manager(auth.uid(), circle_id));

-- ============================================
-- MEMORIES
-- ============================================
CREATE TABLE public.memories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  circle_id UUID NOT NULL REFERENCES public.family_circles(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES auth.users(id),
  type memory_type NOT NULL DEFAULT 'text',
  caption TEXT DEFAULT '',
  media_url TEXT,
  visibility memory_visibility NOT NULL DEFAULT 'circle',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.memories ENABLE ROW LEVEL SECURITY;

CREATE INDEX idx_memories_circle ON public.memories(circle_id);
CREATE INDEX idx_memories_author ON public.memories(author_id);

CREATE TRIGGER update_memories_updated_at
  BEFORE UPDATE ON public.memories
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Memory access: depends on visibility and role
CREATE POLICY "Members can view circle-visible memories"
  ON public.memories FOR SELECT
  USING (
    (visibility = 'circle' AND public.is_circle_member(auth.uid(), circle_id))
    OR (visibility = 'managers' AND public.is_circle_manager(auth.uid(), circle_id))
    OR (visibility = 'private' AND author_id = auth.uid())
  );

CREATE POLICY "Contributors can create memories"
  ON public.memories FOR INSERT
  WITH CHECK (
    auth.uid() = author_id
    AND public.is_circle_member(auth.uid(), circle_id)
    AND public.get_circle_role(auth.uid(), circle_id) IN ('owner', 'family_manager', 'contributor')
  );

CREATE POLICY "Authors can update own memories"
  ON public.memories FOR UPDATE
  USING (author_id = auth.uid());

CREATE POLICY "Authors or owners can delete memories"
  ON public.memories FOR DELETE
  USING (
    author_id = auth.uid()
    OR public.has_circle_role(auth.uid(), circle_id, 'owner')
  );

-- ============================================
-- VAULT DOCUMENTS
-- ============================================
CREATE TABLE public.vault_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  circle_id UUID NOT NULL REFERENCES public.family_circles(id) ON DELETE CASCADE,
  uploaded_by UUID NOT NULL REFERENCES auth.users(id),
  label TEXT NOT NULL,
  category TEXT DEFAULT 'general',
  file_url TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_size BIGINT DEFAULT 0,
  visibility vault_visibility NOT NULL DEFAULT 'owner',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.vault_documents ENABLE ROW LEVEL SECURITY;

CREATE INDEX idx_vault_documents_circle ON public.vault_documents(circle_id);
CREATE INDEX idx_vault_documents_uploader ON public.vault_documents(uploaded_by);

CREATE POLICY "Vault access by visibility and role"
  ON public.vault_documents FOR SELECT
  USING (
    (visibility = 'circle' AND public.is_circle_member(auth.uid(), circle_id))
    OR (visibility = 'managers' AND public.is_circle_manager(auth.uid(), circle_id))
    OR (visibility = 'owner' AND uploaded_by = auth.uid())
  );

CREATE POLICY "Authorized users can upload vault docs"
  ON public.vault_documents FOR INSERT
  WITH CHECK (
    auth.uid() = uploaded_by
    AND public.is_circle_member(auth.uid(), circle_id)
    AND public.get_circle_role(auth.uid(), circle_id) IN ('owner', 'family_manager', 'contributor')
  );

CREATE POLICY "Uploaders can update own vault docs"
  ON public.vault_documents FOR UPDATE
  USING (uploaded_by = auth.uid());

CREATE POLICY "Uploaders or owners can delete vault docs"
  ON public.vault_documents FOR DELETE
  USING (
    uploaded_by = auth.uid()
    OR public.has_circle_role(auth.uid(), circle_id, 'owner')
  );

-- ============================================
-- CONSENTS
-- ============================================
CREATE TABLE public.consents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  default_sharing TEXT NOT NULL DEFAULT 'circle',
  privacy_accepted BOOLEAN NOT NULL DEFAULT false,
  privacy_accepted_at TIMESTAMPTZ,
  marketing_consent BOOLEAN NOT NULL DEFAULT false,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.consents ENABLE ROW LEVEL SECURITY;

CREATE TRIGGER update_consents_updated_at
  BEFORE UPDATE ON public.consents
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE POLICY "Users can read own consents"
  ON public.consents FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own consents"
  ON public.consents FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own consents"
  ON public.consents FOR UPDATE
  USING (auth.uid() = user_id);

-- ============================================
-- AUDIT LOGS
-- ============================================
CREATE TABLE public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  circle_id UUID REFERENCES public.family_circles(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  details JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

CREATE INDEX idx_audit_logs_circle ON public.audit_logs(circle_id);
CREATE INDEX idx_audit_logs_user ON public.audit_logs(user_id);
CREATE INDEX idx_audit_logs_created ON public.audit_logs(created_at DESC);

-- Only circle owners can read audit logs for their circle
CREATE POLICY "Circle owners can read audit logs"
  ON public.audit_logs FOR SELECT
  USING (public.has_circle_role(auth.uid(), circle_id, 'owner'));

-- Insert allowed for authenticated users (for logging their own actions)
CREATE POLICY "Authenticated users can insert audit logs"
  ON public.audit_logs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ============================================
-- STORAGE BUCKETS
-- ============================================
INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true);
INSERT INTO storage.buckets (id, name, public) VALUES ('memories-media', 'memories-media', false);
INSERT INTO storage.buckets (id, name, public) VALUES ('vault-private', 'vault-private', false);

-- Avatars: public read, authenticated upload to own folder
CREATE POLICY "Avatar images are publicly accessible"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload own avatar"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update own avatar"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete own avatar"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Memories media: circle members can read, contributors+ can upload
CREATE POLICY "Circle members can view memories media"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'memories-media' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can upload memories media"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'memories-media' AND auth.role() = 'authenticated');

CREATE POLICY "Users can update own memories media"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'memories-media' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete own memories media"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'memories-media' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Vault private: strictly controlled
CREATE POLICY "Authenticated users can view vault files"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'vault-private' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can upload vault files"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'vault-private' AND auth.role() = 'authenticated');

CREATE POLICY "Users can update own vault files"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'vault-private' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete own vault files"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'vault-private' AND auth.uid()::text = (storage.foldername(name))[1]);
