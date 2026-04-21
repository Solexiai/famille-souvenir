import { supabase } from '@/integrations/supabase/client';
import { SUPABASE_PUBLISHABLE_KEY, SUPABASE_URL } from '@/integrations/supabase/config';
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

const resolveInvitationFunctionError = async (error: unknown) => {
  if (error instanceof FunctionsHttpError) {
    try {
      const payload = await error.context.json();
      return payload?.error || payload?.details?.message || payload?.message || error.message;
    } catch {
      return error.message;
    }
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Impossible d'envoyer le courriel d'invitation.";
};

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

  const { data, error } = await supabase.functions.invoke('send-transactional-email', {
    body: {
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
    },
  });

  if (error) {
    return {
      ok: false,
      queued: false,
      error: await resolveInvitationFunctionError(error),
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