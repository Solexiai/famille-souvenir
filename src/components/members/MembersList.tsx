import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users } from 'lucide-react';
import type { CircleMember, MemberFamilyLabel, AppRole } from '@/types/database';
import { MemberCard } from './MemberCard';

interface Props {
  members: CircleMember[];
  memberLabels: MemberFamilyLabel[];
  currentUserRole: AppRole | null;
}

export const MembersList: React.FC<Props> = ({ members, memberLabels, currentUserRole }) => {
  // Contact visibility: owner/manager see all; family_member sees visible_to_family; others see limited
  const canViewContact = currentUserRole === 'owner' || currentUserRole === 'family_manager';

  return (
    <Card className="shadow-card">
      <CardHeader>
        <CardTitle className="font-heading text-lg flex items-center gap-2">
          <Users className="h-5 w-5 text-accent" />
          {members.length} membre{members.length !== 1 ? 's' : ''}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {members.map((m) => {
          const mLabels = memberLabels.filter(l => l.member_id === m.id);
          const showContact = canViewContact || (currentUserRole === 'family_member');
          return (
            <MemberCard
              key={m.id}
              member={m}
              labels={mLabels}
              canViewContact={showContact}
            />
          );
        })}
        {members.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-4">Aucun membre dans le cercle.</p>
        )}
      </CardContent>
    </Card>
  );
};
