import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Phone, Mail, MapPin, AlertTriangle, Crown, Shield, Edit, Eye } from 'lucide-react';
import type { CircleMember, MemberFamilyLabel, AppRole } from '@/types/database';
import { FamilyLabelsForMember } from '@/components/FamilyLabelsManager';

const roleLabels: Record<AppRole, string> = {
  owner: 'Propriétaire',
  family_manager: 'Gestionnaire',
  family_member: 'Membre',
  heir: 'Héritier',
  proposed_executor: 'Exécuteur pressenti',
  verified_executor: 'Exécuteur documenté',
};

const roleIcons: Record<AppRole, React.FC<{ className?: string }>> = {
  owner: Crown,
  family_manager: Shield,
  family_member: Edit,
  heir: Eye,
  proposed_executor: Eye,
  verified_executor: Shield,
};

interface Props {
  member: CircleMember;
  labels: MemberFamilyLabel[];
  canViewContact: boolean;
}

export const MemberCard: React.FC<Props> = ({ member, labels, canViewContact }) => {
  const RoleIcon = roleIcons[member.role];
  const profile = member.profiles;
  const displayName = profile?.full_name || profile?.first_name
    ? `${profile.first_name} ${profile.last_name}`.trim()
    : profile?.email || 'Membre';
  const initial = displayName[0]?.toUpperCase() || '?';

  const showContact = canViewContact && profile?.is_visible_to_family !== false;

  return (
    <div className="rounded-lg border border-border p-4 space-y-3">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="h-10 w-10 rounded-full bg-secondary flex items-center justify-center shrink-0">
            <span className="text-sm font-medium text-secondary-foreground">{initial}</span>
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <p className="text-sm font-medium text-foreground truncate">{displayName}</p>
              {profile?.is_emergency_contact && (
                <Badge variant="destructive" className="text-[10px] px-1.5 py-0 shrink-0">
                  <AlertTriangle className="h-3 w-3 mr-0.5" />
                  Urgence
                </Badge>
              )}
            </div>
            {profile?.relationship_label && (
              <p className="text-xs text-muted-foreground">{profile.relationship_label}</p>
            )}
          </div>
        </div>
        <Badge variant="secondary" className="flex items-center gap-1 shrink-0">
          <RoleIcon className="h-3 w-3" />
          {roleLabels[member.role]}
        </Badge>
      </div>

      {showContact && (
        <div className="flex flex-wrap gap-3 text-xs text-muted-foreground ml-[52px]">
          {profile?.email && (
            <span className="flex items-center gap-1">
              <Mail className="h-3 w-3" /> {profile.email}
            </span>
          )}
          {profile?.phone && (
            <span className="flex items-center gap-1">
              <Phone className="h-3 w-3" /> {profile.phone}
            </span>
          )}
          {profile?.city && (
            <span className="flex items-center gap-1">
              <MapPin className="h-3 w-3" /> {profile.city}
            </span>
          )}
        </div>
      )}

      {labels.length > 0 && (
        <div className="ml-[52px]">
          <FamilyLabelsForMember labels={labels} />
        </div>
      )}
    </div>
  );
};
