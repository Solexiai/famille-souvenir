import Stripe from 'https://esm.sh/stripe@14.21.0?target=deno'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1'

const jsonHeaders = { 'Content-Type': 'application/json' }

Deno.serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405, headers: jsonHeaders })
  }

  try {
    const stripeKey = Deno.env.get('STRIPE_SECRET_KEY')
    const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET')
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

    if (!stripeKey || !webhookSecret || !supabaseUrl || !supabaseServiceKey) {
      return new Response(JSON.stringify({ error: 'Missing configuration' }), { status: 500, headers: jsonHeaders })
    }

    const stripe = new Stripe(stripeKey, { apiVersion: '2023-10-16' })
    const signature = req.headers.get('stripe-signature')
    if (!signature) {
      return new Response(JSON.stringify({ error: 'Missing stripe-signature' }), { status: 400, headers: jsonHeaders })
    }

    const payload = await req.text()
    let event: Stripe.Event
    try {
      event = await stripe.webhooks.constructEventAsync(payload, signature, webhookSecret)
    } catch (err) {
      console.error('Invalid webhook signature', err)
      return new Response(JSON.stringify({ error: 'Invalid signature' }), { status: 400, headers: jsonHeaders })
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    const { data: insertedEvent, error: insertedEventError } = await supabase
      .from('stripe_webhook_events')
      .insert({
        stripe_event_id: event.id,
        event_type: event.type,
        payload: event as unknown as Record<string, unknown>,
      })
      .select('id')
      .maybeSingle()

    if (insertedEventError) {
      const duplicate = (insertedEventError as { code?: string }).code === '23505'
      if (duplicate) {
        return new Response(JSON.stringify({ ok: true, deduplicated: true }), { headers: jsonHeaders })
      }
      throw insertedEventError
    }

    const upsertSubscription = async (stripeSub: Stripe.Subscription) => {
      let userId = stripeSub.metadata?.user_id
      const customerId = typeof stripeSub.customer === 'string' ? stripeSub.customer : stripeSub.customer?.id

      // Fallback for historical subscriptions missing metadata
      if (!userId && customerId) {
        const { data: existing } = await supabase
          .from('subscriptions')
          .select('user_id')
          .eq('stripe_customer_id', customerId)
          .maybeSingle()
        userId = existing?.user_id
      }

      if (!userId) {
        await supabase.from('app_events').insert({
          source: 'stripe-webhook',
          level: 'warning',
          event_type: 'stripe_subscription_missing_user',
          user_id: null,
          context: { event_id: event.id, subscription_id: stripeSub.id },
        })
        return
      }

      const paymentState =
        stripeSub.status === 'active' ? 'active' :
        stripeSub.status === 'trialing' ? 'trialing' :
        stripeSub.status === 'past_due' ? 'past_due' :
        stripeSub.status === 'canceled' ? 'canceled' :
        'inactive'

      await supabase.from('subscriptions').upsert({
        user_id: userId,
        plan: paymentState === 'active' || paymentState === 'trialing' ? 'annual_family' : 'free',
        subscription_status: stripeSub.status,
        payment_state: paymentState,
        stripe_customer_id: typeof stripeSub.customer === 'string' ? stripeSub.customer : stripeSub.customer?.id,
        stripe_subscription_id: stripeSub.id,
        stripe_price_id: stripeSub.items.data[0]?.price?.id ?? null,
        current_period_end: stripeSub.current_period_end ? new Date(stripeSub.current_period_end * 1000).toISOString() : null,
        renewal_date: stripeSub.current_period_end ? new Date(stripeSub.current_period_end * 1000).toISOString() : null,
        cancelled_at: stripeSub.canceled_at ? new Date(stripeSub.canceled_at * 1000).toISOString() : null,
      }, { onConflict: 'user_id' })
    }

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session
      if (session.subscription && typeof session.subscription === 'string') {
        const stripeSub = await stripe.subscriptions.retrieve(session.subscription)
        await upsertSubscription(stripeSub)
      }
    }

    if (event.type === 'customer.subscription.updated' || event.type === 'customer.subscription.created' || event.type === 'customer.subscription.deleted') {
      const stripeSub = event.data.object as Stripe.Subscription
      await upsertSubscription(stripeSub)
    }
    await supabase.from('app_events').insert({
      source: 'stripe-webhook',
      level: 'info',
      event_type: `stripe_${event.type}`,
      user_id: null,
      context: { id: event.id, webhook_row_id: insertedEvent?.id ?? null },
    })

    return new Response(JSON.stringify({ ok: true }), { headers: jsonHeaders })
  } catch (error) {
    console.error('stripe-webhook error', error)
    return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500, headers: jsonHeaders })
  }
})
