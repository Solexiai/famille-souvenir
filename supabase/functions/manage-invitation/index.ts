import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const jsonResponse = (body: Record<string, unknown>, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })


const normalizeEmail = (value: string | null | undefined) =>
  (value ?? '').trim().toLowerCase()

const isLikelyToken = (value: string) => /^[A-Za-z0-9_-]{24,128}$/.test(value)

const logAppEvent = async (
  supabase: ReturnType<typeof createClient>,
  eventType: string,
  level: 'info' | 'warning' | 'error',
  userId: string | null,
  context: Record<string, unknown>
) => {
  await supabase.from('app_events').insert({
    source: 'manage-invitation',
    level,
    event_type: eventType,
    user_id: userId,
    context,
  })
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, serviceKey)

    const body = await req.json()
    const { action, token } = body
    console.log('[manage-invitation] action:', action, 'token:', token ? token.substring(0, 8) + '...' : 'none')

    // ──────────────────────────────────────────────
    // GENERATE MAGIC LINK for an invitation token
    // ──────────────────────────────────────────────
    if (action === 'generate-magic-link') {
      if (!token || !isLikelyToken(token)) {
        return jsonResponse({ error: 'Token requis ou invalide' }, 400)
      }

      const { data: invitation, error: invError } = await supabase
        .from('invitations')
        .select('id, email, status, expires_at')
        .eq('token', token)
        .single()

      if (invError || !invitation) {
        return jsonResponse({ error: 'Invitation introuvable' }, 404)
      }
      if (invitation.status !== 'pending') {
        return jsonResponse({ error: "L'invitation n'est plus active" }, 400)
      }
      if (new Date(invitation.expires_at) < new Date()) {
        return jsonResponse({ error: 'Invitation expirée' }, 400)
      }

      const email = normalizeEmail(invitation.email)
      const redirectTo = `https://solexi.ai/auth/callback?invitation_token=${encodeURIComponent(token)}`

      // Detect if user already exists to choose magiclink (existing) vs invite (new)
      let userExists = false
      try {
        const { data: list } = await supabase.auth.admin.listUsers({ page: 1, perPage: 1, email } as never)
        const users = (list as { users?: Array<{ email?: string }> } | null)?.users ?? []
        userExists = users.some((u) => normalizeEmail(u.email) === email)
      } catch (_) {
        userExists = false
      }

      const linkType = userExists ? 'magiclink' : 'invite'

      const { data: linkData, error: linkError } = await supabase.auth.admin.generateLink({
        type: linkType as 'magiclink' | 'invite',
        email,
        options: { redirectTo, data: { invitation_token: token } },
      })

      if (linkError || !linkData?.properties?.action_link) {
        console.error('[manage-invitation] generateLink error:', linkError)
        return jsonResponse({ error: linkError?.message || 'Échec de génération du lien' }, 500)
      }

      return jsonResponse({
        success: true,
        action_link: linkData.properties.action_link,
        link_type: linkType,
      })
    }

    // ──────────────────────────────────────────────
    // ACCEPT INVITATION
    // ──────────────────────────────────────────────
    if (action === 'accept') {
      if (!token || !isLikelyToken(token)) return jsonResponse({ error: 'Token requis ou invalide' }, 400)

      // Authenticate caller
      const authHeader = req.headers.get('Authorization')
      if (!authHeader?.startsWith('Bearer ')) {
        return jsonResponse({ error: 'Non authentifié' }, 401)
      }
      const { data: { user: authUser }, error: authError } = await supabase.auth.getUser(
        authHeader.replace('Bearer ', '')
      )
      if (authError || !authUser) return jsonResponse({ error: 'Token utilisateur invalide' }, 401)
      const userId = authUser.id
      const authEmail = normalizeEmail(authUser.email)

      // Fetch invitation
      const { data: invitation, error: invError } = await supabase
        .from('invitations')
        .select('*')
        .eq('token', token)
        .single()
      if (invError || !invitation) return jsonResponse({ error: 'Invitation introuvable' }, 404)

      const invitationEmail = normalizeEmail(invitation.email)
      if (!authEmail || authEmail !== invitationEmail) {
        await logAppEvent(supabase, 'invitation_email_mismatch', 'warning', userId, {
          invitation_id: invitation.id,
          invitation_email: invitationEmail,
          auth_email: authEmail,
        })
        return jsonResponse({ error: 'Ce compte ne correspond pas au courriel invité' }, 403)
      }

      // Status checks
      if (invitation.status !== 'pending') {
        const msg = invitation.status === 'accepted' ? 'Cette invitation a déjà été acceptée'
          : invitation.status === 'declined' ? 'Cette invitation a été déclinée'
          : "Cette invitation n'est plus valide"
        return jsonResponse({ error: msg }, 400)
      }

      // Expiration check
      if (new Date(invitation.expires_at) < new Date()) {
        await supabase.from('invitations').update({ status: 'expired' }).eq('id', invitation.id)
        return jsonResponse({ error: 'Cette invitation a expiré' }, 400)
      }

      // ── Check if already a member of this circle ──
      const { data: existingMember } = await supabase
        .from('circle_members')
        .select('id')
        .eq('circle_id', invitation.circle_id)
        .eq('user_id', userId)
        .single()

      if (existingMember) {
        await supabase.from('invitations').update({ status: 'accepted' }).eq('id', invitation.id)
        await logAppEvent(supabase, 'invitation_accept_idempotent', 'info', userId, {
          invitation_id: invitation.id,
          circle_id: invitation.circle_id,
        })
        return jsonResponse({
          success: true,
          circle_id: invitation.circle_id,
          message: 'Vous faites déjà partie de ce cercle',
        })
      }

      // ── Create membership with the role from the invitation ──
      const { error: memberError } = await supabase
        .from('circle_members')
        .insert({
          circle_id: invitation.circle_id,
          user_id: userId,
          role: invitation.role,
        })

      if (memberError) {
        // Unique index conflict can happen under concurrent accepts -> treat as idempotent success
        const pgCode = (memberError as { code?: string }).code
        if (pgCode !== '23505') {
          console.error('[manage-invitation] memberError:', memberError)
          return jsonResponse({ error: "Erreur lors de l'ajout au cercle" }, 500)
        }
      }

      // Mark invitation accepted (only if still pending)
      await supabase
        .from('invitations')
        .update({ status: 'accepted' })
        .eq('id', invitation.id)
        .eq('status', 'pending')

      // ── Populate profile with invitation data (only fill blanks) ──
      if (invitation.first_name || invitation.last_name || invitation.phone || invitation.city || invitation.relationship_label) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('first_name, last_name')
          .eq('user_id', userId)
          .single()

        const updates: Record<string, string> = {}
        if (!profile?.first_name && invitation.first_name) updates.first_name = invitation.first_name
        if (!profile?.last_name && invitation.last_name) updates.last_name = invitation.last_name
        if (invitation.phone) updates.phone = invitation.phone
        if (invitation.city) updates.city = invitation.city
        if (invitation.relationship_label) updates.relationship_label = invitation.relationship_label
        if (invitation.first_name && invitation.last_name) {
          updates.full_name = `${invitation.first_name} ${invitation.last_name}`.trim()
        }

        if (Object.keys(updates).length > 0) {
          await supabase.from('profiles').update(updates).eq('user_id', userId)
        }
      }

      // Circle name for response
      const { data: circle } = await supabase
        .from('family_circles')
        .select('name')
        .eq('id', invitation.circle_id)
        .single()

      // Audit log
      await supabase.from('audit_logs').insert({
        user_id: userId,
        circle_id: invitation.circle_id,
        action: 'invitation_accepted',
        details: { invitation_id: invitation.id, email: invitation.email, role: invitation.role },
      })

      // Notify the manager who sent the invitation
      const memberName = [invitation.first_name, invitation.last_name].filter(Boolean).join(' ') || invitation.email
      const circleName = circle?.name || 'le cercle'
      await supabase.from('notifications').insert({
        user_id: invitation.invited_by,
        circle_id: invitation.circle_id,
        type: 'invitation_accepted',
        title: `${memberName} a rejoint ${circleName}`,
        body: `${memberName} a accepté votre invitation et fait maintenant partie du cercle.`,
        link: '/circle/members',
      })

      await logAppEvent(supabase, 'invitation_accepted', 'info', userId, {
        invitation_id: invitation.id,
        circle_id: invitation.circle_id,
      })

      return jsonResponse({
        success: true,
        circle_id: invitation.circle_id,
        circle_name: circle?.name || 'Cercle',
        message: `Vous avez bien rejoint le cercle « ${circle?.name || ''} »`,
      })
    }

    // ──────────────────────────────────────────────
    // VALIDATE TOKEN (check without accepting)
    // ──────────────────────────────────────────────
    if (action === 'validate') {
      if (!token || !isLikelyToken(token)) return jsonResponse({ error: 'Token requis ou invalide' }, 400)

      const { data: invitation, error: invError } = await supabase
        .from('invitations')
        .select('id, role, status, expires_at, circle_id')
        .eq('token', token)
        .single()

      if (invError || !invitation) {
        return jsonResponse({ valid: false, error: 'Invitation introuvable' }, 404)
      }

      const expired = new Date(invitation.expires_at) < new Date()
      if (expired && invitation.status === 'pending') {
        await supabase.from('invitations').update({ status: 'expired' }).eq('id', invitation.id)
      }

      const { data: circle } = await supabase
        .from('family_circles')
        .select('name')
        .eq('id', invitation.circle_id)
        .single()

      return jsonResponse({
        valid: invitation.status === 'pending' && !expired,
        invitation: {
          id: invitation.id,
          role: invitation.role,
          status: expired ? 'expired' : invitation.status,
          circle_name: circle?.name || 'Cercle familial',
        },
      })
    }

    return jsonResponse({ error: 'Action non reconnue' }, 400)
  } catch (err) {
    console.error('[manage-invitation] error:', err)
    return jsonResponse({ error: 'Erreur serveur' }, 500)
  }
})
