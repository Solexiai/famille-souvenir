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
import { LimitWarning } from '@/components/PlanGate';
import { usePlan, FREE_LIMITS, isOverFreeLimit } from '@/hooks/usePlan';
import { useLocale } from '@/contexts/LocaleContext';

const MembersPage: React.FC = () => {
  const { user } = useAuth();
  const { plan } = usePlan();
  const { t } = useLocale();
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

    const { data: myRole } = await supabase.from('circle_members').select('role').eq('circle_id', c.id).eq('user_id', user.id).limit(1);
    const role = myRole?.[0]?.role as AppRole | undefined;
    setCurrentUserRole(role || null);
    setIsManager(c.owner_id === user.id || role === 'owner' || role === 'family_manager');

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
          <p className="text-muted-foreground">{t.please_create_circle}</p>
          <Button className="mt-4" onClick={() => window.location.href = '/circle'}>{t.create_circle}</Button>
        </div>
      </AppLayout>
    );
  }

  const memberLimitReached = isOverFreeLimit(plan, 'maxMembers', members.length);

  return (
    <AppLayout>
      <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
        <h1 className="font-heading text-xl sm:text-2xl font-semibold text-foreground">{t.members_page_title}</h1>

        <LimitWarning current={members.length} max={FREE_LIMITS.maxMembers} label={t.plan_gate_member_limit} />

        <Tabs defaultValue="members" className="space-y-4">
          <TabsList className="grid w-full" style={{ gridTemplateColumns: `repeat(${isManager ? 4 : 3}, 1fr)` }}>
            <TabsTrigger value="members" className="text-xs sm:text-sm px-2">{t.members_tab_members}</TabsTrigger>
            {isManager && <TabsTrigger value="invitations" className="text-xs sm:text-sm px-2">{t.members_tab_invitations}</TabsTrigger>}
            <TabsTrigger value="labels" className="text-xs sm:text-sm px-2">{t.members_tab_labels}</TabsTrigger>
            <TabsTrigger value="executor" className="text-xs sm:text-sm px-2">{t.members_tab_executor_short}</TabsTrigger>
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
                {memberLimitReached && (
                  <div className="rounded-lg border border-dashed border-accent/40 bg-secondary/50 p-4 text-center">
                    <p className="text-sm text-muted-foreground">{t.plan_gate_member_limit}</p>
                    <Button size="sm" variant="outline" className="mt-2" onClick={() => window.location.href = '/choose-plan'}>
                      {t.upgrade}
                    </Button>
                  </div>
                )}
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
