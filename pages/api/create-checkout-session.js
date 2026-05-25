// pages/api/create-checkout-session.js
import Stripe from 'stripe'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const stripeSecret = process.env.STRIPE_SECRET_KEY
  const priceId = process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO || process.env.STRIPE_PRICE_PRO

  if (!stripeSecret) {
    return res.status(500).json({ error: 'Stripe secret key not configured.' })
  }
  if (!priceId) {
    return res.status(500).json({ error: 'Stripe price ID for Pro not configured.' })
  }

  const stripe = new Stripe(stripeSecret, { apiVersion: '2022-11-15' })

  try {
    const origin = req.headers.origin || `http://${req.headers.host}`
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        { price: priceId, quantity: 1 }
      ],
      success_url: `${origin}/subscribe?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/subscribe?canceled=true`,
    })

    return res.status(200).json({ url: session.url })
  } catch (err) {
    console.error('Stripe create session error:', err)
    return res.status(500).json({ error: 'Unable to create checkout session.' })
  }
}
