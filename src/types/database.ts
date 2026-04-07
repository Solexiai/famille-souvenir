export type AppRole = 'owner' | 'family_manager' | 'contributor' | 'viewer';
export type MemoryType = 'photo' | 'video' | 'audio' | 'text';
export type MemoryVisibility = 'circle' | 'managers' | 'private';
export type VaultVisibility = 'owner' | 'managers' | 'circle';
export type InvitationStatus = 'pending' | 'accepted' | 'declined' | 'expired';

export interface Profile {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
  language: string;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface FamilyCircle {
  id: string;
  name: string;
  description: string;
  owner_id: string;
  created_at: string;
  updated_at: string;
}

export interface CircleMember {
  id: string;
  circle_id: string;
  user_id: string;
  role: AppRole;
  joined_at: string;
  profiles?: Profile;
}

export interface Invitation {
  id: string;
  circle_id: string;
  email: string;
  role: AppRole;
  token: string;
  status: InvitationStatus;
  invited_by: string;
  expires_at: string;
  created_at: string;
}

export interface Memory {
  id: string;
  circle_id: string;
  author_id: string;
  type: MemoryType;
  caption: string;
  media_url: string | null;
  visibility: MemoryVisibility;
  created_at: string;
  updated_at: string;
  profiles?: Profile;
}

export interface VaultDocument {
  id: string;
  circle_id: string;
  uploaded_by: string;
  label: string;
  category: string;
  file_url: string;
  file_name: string;
  file_size: number;
  visibility: VaultVisibility;
  created_at: string;
  profiles?: Profile;
}

export interface Consent {
  id: string;
  user_id: string;
  default_sharing: string;
  privacy_accepted: boolean;
  privacy_accepted_at: string | null;
  marketing_consent: boolean;
  updated_at: string;
}
