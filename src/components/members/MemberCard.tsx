import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Phone, Mail, MapPin, AlertTriangle, Crown, Shield, Edit, Eye } from 'lucide-react';
import type { CircleMember, MemberFamilyLabel, AppRole } from '@/types/database';
import { FamilyLabelsForMember } from '@/components/FamilyLabelsManager';
import { useLocale } from '@/contexts/LocaleContext';

const roleIcons: Record<AppRole, React.FC<{ className?: string }>> = {
  owner: Crown,
  family_manager: Shield,
  family_member: Edit,
  heir: Eye,
  proposed_executor: Eye,
  verified_executor: Shield,
  viewer: Eye,
  contributor: Edit,
};

interface Props {
  member: CircleMember;
  labels: MemberFamilyLabel[];
  canViewContact: boolean;
}

export const MemberCard: React.FC<Props> = ({ member, labels, canViewContact }) => {
  const { t } = useLocale();
  const RoleIcon = roleIcons[member.role];
  const profile = member.profiles;

  const roleLabels: Record<string, string> = {
    owner: t.role_owner,
    family_manager: t.role_family_manager,
    family_member: t.role_family_member,
    heir: t.role_heir,
    contributor: t.role_contributor,
    viewer: t.role_viewer,
    proposed_executor: t.role_proposed_executor,
    verified_executor: t.role_verified_executor,
  };

  const displayName = profile?.full_name || profile?.first_name
    ? `${profile.first_name} ${profile.last_name}`.trim()
    : profile?.email || t.labels_member_default;
  const initial = displayName[0]?.toUpperCase() || '?';

  const showContact = canViewContact && profile?.is_visible_to_family !== false;

  return (
    <div className="rounded-lg border border-border p-3 sm:p-4 space-y-3">
      <div className="flex items-start gap-3">
        <div className="h-10 w-10 rounded-full bg-secondary flex items-center justify-center shrink-0">
          <span className="text-sm font-medium text-secondary-foreground">{initial}</span>
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-2 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">{displayName}</p>
              {profile?.is_emergency_contact && (
                <Badge variant="destructive" className="text-[10px] px-1.5 py-0 shrink-0">
                  <AlertTriangle className="h-3 w-3 mr-0.5" />
                  {t.member_emergency}
                </Badge>
              )}
            </div>
            <Badge variant="secondary" className="flex items-center gap-1 shrink-0 text-[11px]">
              <RoleIcon className="h-3 w-3" />
              {roleLabels[member.role]}
            </Badge>
          </div>
          {profile?.relationship_label && (
            <p className="text-xs text-muted-foreground mt-0.5">{profile.relationship_label}</p>
          )}
        </div>
      </div>

      {showContact && (
        <div className="flex flex-col sm:flex-row sm:flex-wrap gap-1.5 sm:gap-3 text-xs text-muted-foreground pl-[52px]">
          {profile?.email && (
            <span className="flex items-center gap-1 truncate">
              <Mail className="h-3 w-3 shrink-0" /> <span className="truncate">{profile.email}</span>
            </span>
          )}
          {profile?.phone && (
            <span className="flex items-center gap-1">
              <Phone className="h-3 w-3 shrink-0" /> {profile.phone}
            </span>
          )}
          {profile?.city && (
            <span className="flex items-center gap-1">
              <MapPin className="h-3 w-3 shrink-0" /> {profile.city}
            </span>
          )}
        </div>
      )}

      {labels.length > 0 && (
        <div className="pl-[52px]">
          <FamilyLabelsForMember labels={labels} />
        </div>
      )}
    </div>
  );
};
