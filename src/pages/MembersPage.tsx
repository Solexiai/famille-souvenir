import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { AppLayout } from '@/components/AppLayout';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { CircleMember, FamilyCircle, AppRole, MemberFamilyLabel } from '@/types/database';
import { MembersList } from '@/components/members/MembersList';
import { InviteMemberForm } from '@/components/members/InviteMemberForm';
import { InvitationsList } from '@/components/members/InvitationsList';
import { FamilyLabelsManager } from '@/components/FamilyLabelsManager';
import { ExecutorDesignation } from '@/components/ExecutorDesignation';

const MembersPage: React.FC = () => {
  const { user } = useAuth();
  const [circle, setCircle] = useState<FamilyCircle | null>(null);
  const [members, setMembers] = useState<CircleMember[]>([]);
  const [memberLabels, setMemberLabels] = useState<MemberFamilyLabel[]>([]);
  const [loading, setLoading] = useState(true);
  const [isManager, setIsManager] = useState(false);
  const [currentUserRole, setCurrentUserRole] = useState<AppRole | null>(null);
  const [inviteRefresh, setInviteRefresh] = useState(0);

  const loadData = useCallback(async () => {
    if (!user) return;
    const { data: circles } = await supabase.from('family_circles').select('*').limit(1);
    if (!circles || circles.length === 0) { setLoading(false); return; }

    const c = circles[0] as FamilyCircle;
    setCircle(c);

    // Get current user role
    const { data: myRole } = await supabase.from('circle_members').select('role').eq('circle_id', c.id).eq('user_id', user.id).limit(1);
    const role = myRole?.[0]?.role as AppRole | undefined;
    setCurrentUserRole(role || null);
    setIsManager(c.owner_id === user.id || role === 'owner' || role === 'family_manager');

    // Load members with profiles
    const { data: memberData } = await supabase.from('circle_members').select('*').eq('circle_id', c.id);
    if (memberData) {
      const membersWithProfiles = await Promise.all(
        memberData.map(async (m) => {
          const { data: profileData } = await supabase.from('profiles').select('*').eq('user_id', m.user_id).single();
          return { ...m, profiles: profileData } as CircleMember;
        })
      );
      setMembers(membersWithProfiles);
    }

    // Load labels
    const { data: labelsData } = await supabase.from('member_family_labels').select('*').eq('circle_id', c.id);
    setMemberLabels((labelsData as MemberFamilyLabel[]) || []);
    setLoading(false);
  }, [user]);

  const loadLabels = useCallback(async () => {
    if (!circle) return;
    const { data } = await supabase.from('member_family_labels').select('*').eq('circle_id', circle.id);
    setMemberLabels((data as MemberFamilyLabel[]) || []);
  }, [circle]);

  useEffect(() => { loadData(); }, [loadData]);

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-accent" />
        </div>
      </AppLayout>
    );
  }

  if (!circle) {
    return (
      <AppLayout>
        <div className="text-center py-20">
          <p className="text-muted-foreground">Veuillez d'abord créer un cercle familial.</p>
          <Button className="mt-4" onClick={() => window.location.href = '/circle'}>Créer un cercle</Button>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
        <h1 className="font-heading text-2xl font-semibold text-foreground">Membres du cercle</h1>

        <Tabs defaultValue="members" className="space-y-4">
          <TabsList>
            <TabsTrigger value="members">Membres</TabsTrigger>
            {isManager && <TabsTrigger value="invitations">Invitations</TabsTrigger>}
            <TabsTrigger value="labels">Labels familiaux</TabsTrigger>
            <TabsTrigger value="executor">Exécuteur</TabsTrigger>
          </TabsList>

          <TabsContent value="members" className="space-y-4">
            <MembersList
              members={members}
              memberLabels={memberLabels}
              currentUserRole={currentUserRole}
            />
          </TabsContent>

          <TabsContent value="invitations" className="space-y-4">
            {isManager && user && (
              <>
                <InviteMemberForm
                  circleId={circle.id}
                  userId={user.id}
                  onInviteSent={() => setInviteRefresh(r => r + 1)}
                />
                <InvitationsList
                  circleId={circle.id}
                  userId={user.id}
                  canManage={isManager}
                  refreshKey={inviteRefresh}
                />
              </>
            )}
          </TabsContent>

          <TabsContent value="labels" className="space-y-4">
            <FamilyLabelsManager
              circleId={circle.id}
              members={members}
              canEdit={isManager}
              onLabelsChange={loadLabels}
            />
          </TabsContent>

          <TabsContent value="executor" className="space-y-4">
            <ExecutorDesignation members={members} labels={memberLabels} />
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
};

export default MembersPage;
