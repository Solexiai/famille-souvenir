import { supabase } from '@/integrations/supabase/client';
import { resolvedSupabaseUrl, resolvedSupabasePublishableKey } from '@/integrations/supabase/config';
import type { AppRole } from '@/types/database';

interface InvitationEmailPayload {
  token: string;
  email: string;
  role: AppRole;
  firstName?: string | null;
  lastName?: string | null;
  invitationMessage?: string | null;
}

interface SendInvitationEmailInput {
  circleId: string;
  userId: string;
  invitation: InvitationEmailPayload;
}

interface SendInvitationEmailResult {
  error?: string;
  link: string;
  ok: boolean;
  queued: boolean;
  reason?: string;
}

export const buildInvitationAcceptUrl = (token: string) => {
  const baseUrl = window.location.origin.replace(/\/$/, '');
  return `${baseUrl}/invitation/accept?token=${token}`;
};

export const sendInvitationEmail = async ({
  circleId,
  userId,
  invitation,
}: SendInvitationEmailInput): Promise<SendInvitationEmailResult> => {
  const link = buildInvitationAcceptUrl(invitation.token);

  const [{ data: circleData }, { data: inviterProfile }] = await Promise.all([
    supabase.from('family_circles').select('name').eq('id', circleId).maybeSingle(),
    supabase.from('profiles').select('full_name').eq('user_id', userId).maybeSingle(),
  ]);

  const lang = localStorage.getItem('solexi_lang') || 'fr';

  // Direct fetch instead of supabase.functions.invoke() to avoid sending the
  // user's ES256-signed JWT, which the Supabase Edge Runtime gateway rejects
  // with "Unsupported JWT algorithm ES256". The function is configured with
  // verify_jwt = false, so only the publishable apikey is required.
  let data: any = null;
  let fetchError: string | null = null;

  try {
    const response = await fetch(`${resolvedSupabaseUrl}/functions/v1/send-transactional-email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: resolvedSupabasePublishableKey,
        Authorization: `Bearer ${resolvedSupabasePublishableKey}`,
      },
      body: JSON.stringify({
        templateName: 'circle-invitation',
        recipientEmail: invitation.email,
        idempotencyKey: `circle-invite-${invitation.token}`,
        templateData: {
          firstName: invitation.firstName || '',
          lastName: invitation.lastName || '',
          circleName: circleData?.name || 'un cercle familial',
          inviterName: inviterProfile?.full_name || '',
          role: invitation.role,
          invitationMessage: invitation.invitationMessage || '',
          acceptUrl: link,
          lang,
        },
      }),
    });

    const payload = await response.json().catch(() => null);

    if (!response.ok) {
      fetchError =
        payload?.error ||
        payload?.details?.message ||
        payload?.message ||
        `Edge function returned ${response.status}`;
    } else {
      data = payload;
    }
  } catch (err) {
    fetchError = err instanceof Error ? err.message : "Impossible d'envoyer le courriel d'invitation.";
  }

  if (fetchError) {
    return {
      ok: false,
      queued: false,
      error: fetchError,
      link,
    };
  }

  if (data?.success === false) {
    return {
      ok: false,
      queued: false,
      error:
        data.reason === 'email_suppressed'
          ? 'Cette adresse est bloquée pour les envois.'
          : data.error || "Le courriel d'invitation n'a pas pu être envoyé.",
      link,
      reason: data.reason,
    };
  }

  return {
    ok: true,
    queued: Boolean(data?.queued ?? false),
    link,
  };
};
