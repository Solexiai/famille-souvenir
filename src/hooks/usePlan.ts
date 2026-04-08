import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

export type PlanType = 'free' | 'annual_family';

interface PlanState {
  plan: PlanType;
  loading: boolean;
  isAnnual: boolean;
  founderDiscount: boolean;
  renewalDate: string | null;
  status: string;
}

// Free plan limits
export const FREE_LIMITS = {
  maxMembers: 5,
  maxDocuments: 10,
  maxMemories: 20,
  advancedExport: false,
  advancedExecutor: false,
  advancedReminders: false,
  advancedGovernance: false,
};

export function usePlan(): PlanState {
  const { user } = useAuth();
  const [state, setState] = useState<PlanState>({
    plan: 'free',
    loading: true,
    isAnnual: false,
    founderDiscount: false,
    renewalDate: null,
    status: 'active',
  });

  useEffect(() => {
    if (!user) {
      setState(s => ({ ...s, loading: false }));
      return;
    }
    const load = async () => {
      const { data } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (data) {
        setState({
          plan: data.plan === 'annual_family' ? 'annual_family' : 'free',
          loading: false,
          isAnnual: data.plan === 'annual_family',
          founderDiscount: data.founder_discount_applied ?? false,
          renewalDate: data.renewal_date,
          status: data.subscription_status ?? 'active',
        });
      } else {
        setState(s => ({ ...s, loading: false }));
      }
    };
    load();
  }, [user]);

  return state;
}

export function isPremiumFeature(plan: PlanType, feature: keyof typeof FREE_LIMITS): boolean {
  if (plan === 'annual_family') return true;
  return !!FREE_LIMITS[feature];
}
