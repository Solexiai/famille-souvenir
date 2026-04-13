import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
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
    const { action, token, invitation_id } = body
    console.log('[manage-invitation] action:', action, 'token:', token ? token.substring(0, 8) + '...' : 'none')

    // === ACCEPT INVITATION ===
    if (action === 'accept') {
      if (!token) {
        return new Response(JSON.stringify({ error: 'Token requis' }), {
          status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      // Validate auth
      const authHeader = req.headers.get('Authorization')
      if (!authHeader?.startsWith('Bearer ')) {
        return new Response(JSON.stringify({ error: 'Non authentifié' }), {
          status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      const userToken = authHeader.replace('Bearer ', '')
      const { data: { user: authUser }, error: authError } = await supabase.auth.getUser(userToken)
      if (authError || !authUser) {
        return new Response(JSON.stringify({ error: 'Token utilisateur invalide' }), {
          status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }
      const userId = authUser.id

      // Get invitation
      const { data: invitation, error: invError } = await supabase
        .from('invitations')
        .select('*')
        .eq('token', token)
        .single()

      if (invError || !invitation) {
        return new Response(JSON.stringify({ error: 'Invitation introuvable' }), {
          status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      // Check status
      if (invitation.status !== 'pending') {
        return new Response(JSON.stringify({
          error: invitation.status === 'accepted' ? 'Cette invitation a déjà été acceptée'
            : invitation.status === 'declined' ? 'Cette invitation a été déclinée'
            : 'Cette invitation n\'est plus valide'
        }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
      }

      // Check expiration
      if (new Date(invitation.expires_at) < new Date()) {
        await supabase.from('invitations').update({ status: 'expired' }).eq('id', invitation.id)
        return new Response(JSON.stringify({ error: 'Cette invitation a expiré' }), {
          status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      // Check if already a member
      const { data: existingMember } = await supabase
        .from('circle_members')
        .select('id')
        .eq('circle_id', invitation.circle_id)
        .eq('user_id', userId)
        .single()

      if (existingMember) {
        // Already a member, just mark invitation accepted
        await supabase.from('invitations').update({ status: 'accepted' }).eq('id', invitation.id)
        return new Response(JSON.stringify({
          success: true,
          circle_id: invitation.circle_id,
          message: 'Vous faites déjà partie de ce cercle'
        }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
      }

      // Create circle membership
      const { error: memberError } = await supabase
        .from('circle_members')
        .insert({
          circle_id: invitation.circle_id,
          user_id: userId,
          role: invitation.role,
        })

      if (memberError) {
        return new Response(JSON.stringify({ error: 'Erreur lors de l\'ajout au cercle' }), {
          status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      // Update invitation status
      await supabase.from('invitations').update({ status: 'accepted' }).eq('id', invitation.id)

      // Populate profile with invitation data if available
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
        details: {
          invitation_id: invitation.id,
          email: invitation.email,
          role: invitation.role,
        },
      })

      // Get circle name for response
      const { data: circle } = await supabase
        .from('family_circles')
        .select('name')
        .eq('id', invitation.circle_id)
        .single()

      return new Response(JSON.stringify({
        success: true,
        circle_id: invitation.circle_id,
        circle_name: circle?.name || 'Cercle',
        message: `Vous avez bien rejoint le cercle « ${circle?.name || ''} »`
      }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    // === VALIDATE TOKEN (check without accepting) ===
    if (action === 'validate') {
      if (!token) {
        return new Response(JSON.stringify({ error: 'Token requis' }), {
          status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      const { data: invitation, error: invError } = await supabase
        .from('invitations')
        .select('id, email, role, status, expires_at, circle_id, first_name, last_name')
        .eq('token', token)
        .single()

      if (invError || !invitation) {
        return new Response(JSON.stringify({ valid: false, error: 'Invitation introuvable' }), {
          status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      const expired = new Date(invitation.expires_at) < new Date()
      if (expired && invitation.status === 'pending') {
        await supabase.from('invitations').update({ status: 'expired' }).eq('id', invitation.id)
      }

      // Get circle name
      const { data: circle } = await supabase
        .from('family_circles')
        .select('name')
        .eq('id', invitation.circle_id)
        .single()

      return new Response(JSON.stringify({
        valid: invitation.status === 'pending' && !expired,
        invitation: {
          id: invitation.id,
          email: invitation.email,
          role: invitation.role,
          status: expired ? 'expired' : invitation.status,
          first_name: invitation.first_name,
          last_name: invitation.last_name,
          circle_name: circle?.name || 'Cercle familial',
        }
      }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    return new Response(JSON.stringify({ error: 'Action non reconnue' }), {
      status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (err) {
    return new Response(JSON.stringify({ error: 'Erreur serveur' }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})
