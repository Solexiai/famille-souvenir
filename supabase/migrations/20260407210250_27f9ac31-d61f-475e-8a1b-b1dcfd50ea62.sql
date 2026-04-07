
-- Extend profiles with contact fields
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS first_name text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS last_name text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS phone text DEFAULT '',
  ADD COLUMN IF NOT EXISTS secondary_phone text DEFAULT '',
  ADD COLUMN IF NOT EXISTS city text DEFAULT '',
  ADD COLUMN IF NOT EXISTS relationship_label text DEFAULT '',
  ADD COLUMN IF NOT EXISTS contact_preference text DEFAULT '',
  ADD COLUMN IF NOT EXISTS notes text DEFAULT '',
  ADD COLUMN IF NOT EXISTS is_emergency_contact boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS is_visible_to_family boolean NOT NULL DEFAULT true;

-- Extend invitations with member detail fields
ALTER TABLE public.invitations
  ADD COLUMN IF NOT EXISTS first_name text DEFAULT '',
  ADD COLUMN IF NOT EXISTS last_name text DEFAULT '',
  ADD COLUMN IF NOT EXISTS phone text DEFAULT '',
  ADD COLUMN IF NOT EXISTS city text DEFAULT '',
  ADD COLUMN IF NOT EXISTS relationship_label text DEFAULT '',
  ADD COLUMN IF NOT EXISTS invitation_message text DEFAULT '',
  ADD COLUMN IF NOT EXISTS resent_at timestamp with time zone DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS resent_count integer NOT NULL DEFAULT 0;
