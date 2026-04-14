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
    // ACCEPT INVITATION
    // ──────────────────────────────────────────────
    if (action === 'accept') {
      if (!token) return jsonResponse({ error: 'Token requis' }, 400)

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

      // Fetch invitation
      const { data: invitation, error: invError } = await supabase
        .from('invitations')
        .select('*')
        .eq('token', token)
        .single()
      if (invError || !invitation) return jsonResponse({ error: 'Invitation introuvable' }, 404)

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
        console.error('[manage-invitation] memberError:', memberError)
        return jsonResponse({ error: "Erreur lors de l'ajout au cercle" }, 500)
      }

      // Mark invitation accepted
      await supabase.from('invitations').update({ status: 'accepted' }).eq('id', invitation.id)

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

      // Audit log
      await supabase.from('audit_logs').insert({
        user_id: userId,
        circle_id: invitation.circle_id,
        action: 'invitation_accepted',
        details: { invitation_id: invitation.id, email: invitation.email, role: invitation.role },
      })

      // Circle name for response
      const { data: circle } = await supabase
        .from('family_circles')
        .select('name')
        .eq('id', invitation.circle_id)
        .single()

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
      if (!token) return jsonResponse({ error: 'Token requis' }, 400)

      const { data: invitation, error: invError } = await supabase
        .from('invitations')
        .select('id, email, role, status, expires_at, circle_id, first_name, last_name')
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
          email: invitation.email,
          role: invitation.role,
          status: expired ? 'expired' : invitation.status,
          first_name: invitation.first_name,
          last_name: invitation.last_name,
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
